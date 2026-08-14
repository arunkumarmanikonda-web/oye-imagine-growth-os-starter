import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolvePrivacyTarget } from '@/lib/privacy/context'

const deletableTargets = {
  raw_growth_events: { timestamp: 'ingested_at' },
  integration_sync_runs: { timestamp: 'created_at' },
  lifecycle_delivery_jobs: { timestamp: 'requested_at' },
} as const

const protectedTables = new Set([
  'commercial_ledger_entries',
  'commercial_media_balance_accounts',
  'commercial_invoices',
  'commercial_contracts',
  'commercial_subscriptions',
  'commercial_audit_events',
  'commercial_mutation_ops',
  'admin_audit_events',
  'audit_events',
  'privacy_consent_events',
  'privacy_dsar_requests',
])

type RetentionTarget = keyof typeof deletableTargets

function isDeletableTarget(value: string): value is RetentionTarget {
  return Object.prototype.hasOwnProperty.call(deletableTargets, value)
}

export async function createRetentionPolicy(access: ApiAccessContext, input: {
  workspaceId?: string
  dataClass: string
  targetTable: string
  retentionDays: number
  action: 'review' | 'anonymize' | 'delete'
  legalBasis?: string
  enabled?: boolean
}) {
  const target = await resolvePrivacyTarget(access, input.workspaceId)
  if (!input.dataClass.trim() || !input.targetTable.trim()) throw new Error('retention_policy_fields_required')
  if (!Number.isInteger(input.retentionDays) || input.retentionDays < 1 || input.retentionDays > 36500) throw new Error('retention_days_invalid')
  const table = input.targetTable.trim()
  const protectedRecordClass = protectedTables.has(table) || !isDeletableTarget(table)
  if (input.action === 'delete' && protectedRecordClass) throw new Error('retention_delete_target_protected')
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('privacy_retention_policies').upsert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    data_class: input.dataClass.trim(),
    target_table: table,
    retention_days: input.retentionDays,
    action: input.action,
    protected_record_class: protectedRecordClass,
    enabled: input.enabled !== false,
    legal_basis: input.legalBasis?.trim() || null,
    created_by: access.subject,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'tenant_id,workspace_id,target_table,data_class' }).select('*').single()
  if (error) throw new Error(`retention_policy_write_failed:${error.message}`)
  return data
}

async function loadPolicy(access: ApiAccessContext, policyId: string) {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('privacy_retention_policies').select('*').eq('retention_policy_id', policyId).maybeSingle()
  if (error || !data) throw new Error('retention_policy_not_found')
  const target = await resolvePrivacyTarget(access, data.workspace_id || undefined)
  if (target.tenantId !== data.tenant_id) throw new Error('retention_policy_tenant_mismatch')
  if (!data.enabled) throw new Error('retention_policy_disabled')
  return { policy: data, target }
}

async function requireExecutionApproval(tenantId: string, policyId: string, approvalId?: string) {
  if (!approvalId?.trim()) throw new Error('retention_approval_required')
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('commercial_approval_requests').select('*')
    .eq('approval_id', approvalId.trim())
    .eq('tenant_id', tenantId)
    .eq('status', 'approved')
    .maybeSingle()
  if (error || !data) throw new Error('retention_approval_required')
  const payload = (data.payload || {}) as Record<string, unknown>
  const scopedType = typeof payload.resourceType === 'string' ? payload.resourceType : typeof payload.externalAction === 'string' ? payload.externalAction : null
  const scopedPolicy = typeof payload.retentionPolicyId === 'string' ? payload.retentionPolicyId : null
  if (data.approval_type !== 'retention_execution' && scopedType !== 'retention_execution') throw new Error('retention_approval_scope_mismatch')
  if (scopedPolicy !== policyId) throw new Error('retention_approval_policy_mismatch')
  return data
}

export async function runRetention(access: ApiAccessContext, input: {
  policyId: string
  mode: 'dry_run' | 'execute'
  approvalId?: string
}) {
  const { policy, target } = await loadPolicy(access, input.policyId)
  const admin = createSupabaseAdminClient()
  const cutoff = new Date(Date.now() - Number(policy.retention_days) * 86_400_000).toISOString()
  let candidateCount = 0
  let affectedCount = 0
  let status: 'completed' | 'needs_approval' | 'blocked' = 'completed'
  let safeErrorCode: string | null = null

  if (policy.action === 'review' || policy.action === 'anonymize') {
    status = 'needs_approval'
    safeErrorCode = policy.action === 'anonymize' ? 'retention_anonymize_manual_mapping_required' : 'retention_review_required'
  } else if (policy.protected_record_class || !isDeletableTarget(policy.target_table)) {
    status = 'blocked'
    safeErrorCode = 'retention_delete_target_protected'
  } else {
    const timestampColumn = deletableTargets[policy.target_table].timestamp
    let countQuery = admin.from(policy.target_table).select('*', { count: 'exact', head: true }).eq('tenant_id', target.tenantId).lt(timestampColumn, cutoff)
    if (target.workspaceId) countQuery = countQuery.eq('workspace_id', target.workspaceId)
    const countResult = await countQuery
    if (countResult.error) throw new Error(`retention_count_failed:${countResult.error.message}`)
    candidateCount = countResult.count || 0

    if (input.mode === 'execute') {
      await requireExecutionApproval(target.tenantId, policy.retention_policy_id, input.approvalId)
      let deleteQuery = admin.from(policy.target_table).delete({ count: 'exact' }).eq('tenant_id', target.tenantId).lt(timestampColumn, cutoff)
      if (target.workspaceId) deleteQuery = deleteQuery.eq('workspace_id', target.workspaceId)
      const deletion = await deleteQuery
      if (deletion.error) throw new Error(`retention_delete_failed:${deletion.error.message}`)
      affectedCount = deletion.count || 0
    }
  }

  const { data: run, error: runError } = await admin.from('privacy_retention_runs').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    retention_policy_id: policy.retention_policy_id,
    mode: input.mode,
    status,
    approval_id: input.approvalId || null,
    candidate_count: candidateCount,
    affected_count: affectedCount,
    evidence: {
      cutoff,
      targetTable: policy.target_table,
      dataClass: policy.data_class,
      action: policy.action,
      protectedRecordClass: policy.protected_record_class,
      executionPerformed: input.mode === 'execute' && affectedCount > 0,
    },
    safe_error_code: safeErrorCode,
    requested_by: access.subject,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
  }).select('*').single()
  if (runError) throw new Error(`retention_run_write_failed:${runError.message}`)
  return { policy, run, cutoff, candidateCount, affectedCount }
}

export async function listRetention(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolvePrivacyTarget(access, workspaceId)
  const admin = createSupabaseAdminClient()
  let policyQuery = admin.from('privacy_retention_policies').select('*').eq('tenant_id', target.tenantId)
  let runQuery = admin.from('privacy_retention_runs').select('*').eq('tenant_id', target.tenantId)
  if (target.workspaceId) {
    policyQuery = policyQuery.eq('workspace_id', target.workspaceId)
    runQuery = runQuery.eq('workspace_id', target.workspaceId)
  }
  const [policies, runs] = await Promise.all([
    policyQuery.order('created_at', { ascending: false }).limit(100),
    runQuery.order('created_at', { ascending: false }).limit(100),
  ])
  if (policies.error) throw new Error(`retention_policy_list_failed:${policies.error.message}`)
  if (runs.error) throw new Error(`retention_run_list_failed:${runs.error.message}`)
  return { target, policies: policies.data || [], runs: runs.data || [], deletableTargets: Object.keys(deletableTargets) }
}
