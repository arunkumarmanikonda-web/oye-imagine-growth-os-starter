import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { executeAutonomousAction, type AutonomousExecutionInput } from '@/lib/autonomy/executor'
import { readCampaign } from '@/lib/integrations/google-ads'

const ACTIONS = new Set(['campaign.launch', 'lifecycle.send', 'social.publish', 'report.publish'])

function systemAccess(tenantId: string, workspaceId: string | null): ApiAccessContext {
  const subject = 'system:autonomy-worker'
  const membership = {
    membership_id: 'system_autonomy_worker',
    tenant_id: tenantId,
    user_id: subject,
    role_key: 'platform_owner',
    brand_id: null,
    workspace_id: workspaceId,
    status: 'active' as const,
    metadata: {
      accessLane: 'admin',
      operationalTenantId: tenantId,
      operationalWorkspaceId: workspaceId,
    },
  }
  return {
    subject,
    email: null,
    lane: 'admin',
    membership,
    memberships: [membership],
    assuranceLevel: 'aal2',
    permissionSet: {} as ApiAccessContext['permissionSet'],
  }
}

async function updateQueue(queueId: string, patch: Record<string, unknown>) {
  const { data, error } = await createSupabaseAdminClient().from('autonomous_action_queue').update({ ...patch, updated_at: new Date().toISOString() }).eq('queue_id', queueId).select('*').single()
  if (error) throw new Error(`autonomy_queue_update_failed:${error.message}`)
  return data
}

function queueStatus(runStatus: string) {
  if (runStatus === 'succeeded') return 'completed'
  if (runStatus === 'blocked') return 'blocked'
  if (runStatus === 'verification_pending' || runStatus === 'reconciliation_required') return 'reconciling'
  return 'failed'
}

export async function enqueueAutonomousAction(input: {
  tenantId: string
  workspaceId?: string | null
  actionKey: AutonomousExecutionInput['actionKey']
  channel: string
  providerKey?: string | null
  idempotencyKey: string
  amount?: number
  currency?: string
  payload?: Record<string, unknown>
  priority?: number
  scheduledAt?: string
  createdBy?: string
}) {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('autonomous_action_queue').upsert({
    tenant_id: input.tenantId,
    workspace_id: input.workspaceId || null,
    action_key: input.actionKey,
    channel: input.channel,
    provider_key: input.providerKey || null,
    idempotency_key: input.idempotencyKey,
    requested_amount: Number(input.amount || 0),
    currency: String(input.currency || 'INR').toUpperCase(),
    payload: input.payload || {},
    priority: Math.max(0, Math.min(100, Math.trunc(input.priority ?? 50))),
    status: 'pending',
    scheduled_at: input.scheduledAt || new Date().toISOString(),
    created_by: input.createdBy || 'system',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'tenant_id,idempotency_key', ignoreDuplicates: true }).select('*').maybeSingle()
  if (error) throw new Error(`autonomy_queue_write_failed:${error.message}`)
  if (data) return data
  const { data: existing, error: existingError } = await admin.from('autonomous_action_queue').select('*').eq('tenant_id', input.tenantId).eq('idempotency_key', input.idempotencyKey).maybeSingle()
  if (existingError || !existing) throw new Error('autonomy_queue_idempotency_read_failed')
  return existing
}

async function reconcileRuns(limit = 20) {
  const admin = createSupabaseAdminClient()
  const { data: runs, error } = await admin.from('autonomous_execution_runs').select('*').in('status', ['verification_pending', 'reconciliation_required']).order('updated_at', { ascending: true }).limit(limit)
  if (error) throw new Error(`autonomy_reconciliation_read_failed:${error.message}`)
  const results: any[] = []
  for (const run of runs || []) {
    if (run.action_key !== 'campaign.launch' || !run.external_resource_id || !run.workspace_id) continue
    const payload = (run.request_payload || {}) as Record<string, unknown>
    const customerId = String(payload.customerId || '')
    if (!customerId) continue
    const access = systemAccess(run.tenant_id, run.workspace_id)
    try {
      const verification: any = await readCampaign(access, { workspaceId: run.workspace_id, customerId, resourceName: run.external_resource_id })
      const state = String(verification?.campaign?.status || '').toUpperCase()
      if (state === 'ENABLED') {
        const settlement = await admin.rpc('settle_autonomous_media_spend', { p_run_id: run.run_id })
        if (!settlement.error && (settlement.data as any)?.ok) {
          await admin.from('autonomous_execution_runs').update({ status: 'succeeded', provider_result: { ...(run.provider_result || {}), reconciliation: verification, settlement: settlement.data }, error_code: null, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('run_id', run.run_id)
          await admin.from('autonomous_action_queue').update({ status: 'completed', completed_at: new Date().toISOString(), last_error_code: null, updated_at: new Date().toISOString() }).eq('run_id', run.run_id)
          results.push({ runId: run.run_id, status: 'succeeded' })
          continue
        }
      }
      if (state === 'PAUSED' || state === 'REMOVED') {
        await admin.rpc('release_autonomous_media_spend', { p_run_id: run.run_id })
        await admin.from('autonomous_execution_runs').update({ status: 'failed', provider_result: { ...(run.provider_result || {}), reconciliation: verification }, error_code: `provider_final_state_${state.toLowerCase()}`, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('run_id', run.run_id)
        await admin.from('autonomous_action_queue').update({ status: 'failed', completed_at: new Date().toISOString(), last_error_code: `provider_final_state_${state.toLowerCase()}`, updated_at: new Date().toISOString() }).eq('run_id', run.run_id)
        results.push({ runId: run.run_id, status: 'failed', providerState: state })
      }
    } catch (error) {
      results.push({ runId: run.run_id, status: 'pending', code: error instanceof Error ? error.message.split(':')[0] : 'reconciliation_failed' })
    }
  }
  return results
}

export async function processAutonomousQueue(limit = 10) {
  const admin = createSupabaseAdminClient()
  await admin.rpc('requeue_stale_autonomous_claims', { p_stale_minutes: 15 })
  const reconciled = await reconcileRuns()
  const { data: claimed, error } = await admin.rpc('claim_autonomous_actions', { p_limit: Math.max(1, Math.min(25, Math.trunc(limit))) })
  if (error) throw new Error(`autonomy_queue_claim_failed:${error.message}`)
  const processed: any[] = []
  for (const row of (claimed || []) as any[]) {
    try {
      if (!ACTIONS.has(String(row.action_key))) {
        await updateQueue(row.queue_id, { status: 'failed', completed_at: new Date().toISOString(), last_error_code: 'autonomy_action_unknown' })
        processed.push({ queueId: row.queue_id, status: 'failed', code: 'autonomy_action_unknown' })
        continue
      }
      const access = systemAccess(row.tenant_id, row.workspace_id)
      const execution: AutonomousExecutionInput = {
        actionKey: row.action_key,
        workspaceId: row.workspace_id || undefined,
        idempotencyKey: row.idempotency_key,
        channel: row.channel,
        providerKey: row.provider_key || undefined,
        amount: Number(row.requested_amount || 0),
        currency: row.currency,
        payload: row.payload || {},
      }
      const result = await executeAutonomousAction(access, execution)
      const run = result.run
      await updateQueue(row.queue_id, {
        status: queueStatus(run.status),
        run_id: run.run_id,
        completed_at: ['succeeded', 'blocked', 'failed'].includes(run.status) ? new Date().toISOString() : null,
        last_error_code: run.error_code || null,
      })
      processed.push({ queueId: row.queue_id, runId: run.run_id, status: run.status, replayed: result.replayed })
    } catch (error) {
      const code = error instanceof Error ? error.message.split(':')[0] : 'autonomy_worker_failed'
      await updateQueue(row.queue_id, { status: 'failed', completed_at: new Date().toISOString(), last_error_code: code }).catch(() => null)
      processed.push({ queueId: row.queue_id, status: 'failed', code })
    }
  }
  return { claimed: (claimed || []).length, processed, reconciled }
}
