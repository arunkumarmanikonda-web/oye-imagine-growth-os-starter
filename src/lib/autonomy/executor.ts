import crypto from 'node:crypto'
import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveOperationalTarget, type OperationalTarget } from '@/lib/integrations/operational-target'
import { createBoundedSearchCampaign, readCampaign, setCampaignStatus } from '@/lib/integrations/google-ads'
import { readGoogleAdsCustomer } from '@/lib/integrations/google-ads-customer'
import { sendLifecycleMessage } from '@/lib/privacy/delivery'

export type AutonomousExecutionInput = {
  actionKey: 'campaign.launch' | 'lifecycle.send' | 'social.publish' | 'report.publish'
  workspaceId?: string
  idempotencyKey: string
  channel: string
  providerKey?: string
  amount?: number
  currency?: string
  payload?: Record<string, any>
}

type CoreTarget = { tenantId: string; brandId: string; workspaceId: string; brandName: string }
type GateResult = { ok: boolean; blockers: string[]; policy: any; route: any; approvalPolicy: any; core: CoreTarget; target: OperationalTarget }
const PASSING_QA_STATES = new Set(['ready', 'passed', 'verified', 'green', 'approved'])

function coreTarget(target: OperationalTarget): CoreTarget {
  if (target.tenantSlug === 'neejee' || target.tenantId === '95c81580-1be2-49b1-84a5-a35060384a31') return { tenantId: 'tenant_neejee', brandId: 'brand_neejee', workspaceId: 'workspace_neejee', brandName: 'Neejee' }
  if (target.tenantSlug === 'oye-imagine' || target.tenantId === '69f078ea-31cc-4b47-94c4-a05301dde119') return { tenantId: 'tenant_oye_internal', brandId: 'brand_oye_imagine', workspaceId: 'workspace_oye_internal', brandName: 'Oye !magine' }
  throw new Error('autonomy_core_target_unmapped')
}

function requiredTools(actionKey: AutonomousExecutionInput['actionKey']) {
  if (actionKey === 'campaign.launch') return ['external_mutation', 'spend']
  if (actionKey === 'lifecycle.send') return ['external_mutation', 'message']
  if (actionKey === 'social.publish') return ['external_mutation', 'publish']
  return ['publish']
}
function runtimeMissing(names: string[]) { return names.filter(name => !process.env[name]?.trim()) }
function lifecycleProvider(input: AutonomousExecutionInput) {
  if (input.channel === 'email') return String(input.payload?.provider || 'resend')
  if (input.channel === 'whatsapp') return String(input.payload?.provider || 'whatsapp_cloud')
  if (input.channel === 'sms') return String(input.payload?.provider || 'fast2sms')
  return 'invalid'
}
function providerBlockers(input: AutonomousExecutionInput) {
  if (input.actionKey === 'campaign.launch') return runtimeMissing(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'OYE_OAUTH_ENCRYPTION_KEY']).map(name => `runtime_secret_missing:${name}`)
  if (input.actionKey === 'lifecycle.send') {
    const p = lifecycleProvider(input)
    if (input.channel === 'email' && p !== 'resend') return [`provider_channel_mismatch:${p}:email`]
    if (input.channel === 'whatsapp' && p !== 'whatsapp_cloud') return [`provider_channel_mismatch:${p}:whatsapp`]
    if (input.channel === 'sms' && p !== 'fast2sms') return [`provider_channel_mismatch:${p}:sms`]
    if (p === 'resend') return runtimeMissing(['RESEND_API_KEY', 'RESEND_FROM_EMAIL']).map(name => `runtime_secret_missing:${name}`)
    if (p === 'whatsapp_cloud') return runtimeMissing(['WHATSAPP_GRAPH_VERSION', 'WHATSAPP_CLOUD_PHONE_NUMBER_ID', 'WHATSAPP_CLOUD_ACCESS_TOKEN']).map(name => `runtime_secret_missing:${name}`)
    if (p === 'fast2sms') return runtimeMissing(['FAST2SMS_API_URL', 'FAST2SMS_API_KEY']).map(name => `runtime_secret_missing:${name}`)
    return [`provider_adapter_not_configured:${p}`]
  }
  if (input.actionKey === 'social.publish') return ['social_provider_adapter_not_configured']
  return ['report_external_publisher_not_configured']
}

async function latestReadiness(brandName: string, channel: string) {
  const { data, error } = await createSupabaseAdminClient().from('execution_channel_publish_readiness').select('*').eq('brand_name', brandName).eq('channel', channel).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw new Error(`channel_readiness_read_failed:${error.message}`)
  return data
}
async function googleAccount(target: OperationalTarget) {
  const admin = createSupabaseAdminClient(); let q = admin.from('integration_accounts').select('*').eq('tenant_id', target.tenantId).eq('provider', 'google').eq('status', 'connected')
  if (target.workspaceId) q = q.eq('workspace_id', target.workspaceId)
  const { data, error } = await q.order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw new Error(`integration_account_read_failed:${error.message}`)
  return data
}

async function gate(access: ApiAccessContext, input: AutonomousExecutionInput): Promise<GateResult> {
  const target = await resolveOperationalTarget(access, input.workspaceId), core = coreTarget(target), admin = createSupabaseAdminClient()
  const [p, r, a] = await Promise.all([
    admin.from('agent_autonomy_policies').select('*').eq('tenant_id', core.tenantId).eq('workspace_id', core.workspaceId).eq('agent_key', 'growth-executor').maybeSingle(),
    admin.from('core_action_approval_routes').select('*').eq('action_key', input.actionKey).eq('enabled', true).maybeSingle(),
    admin.from('core_approval_policies').select('*').eq('tenant_id', core.tenantId).eq('scope_type', 'workspace').eq('scope_ref', core.workspaceId).eq('action_key', input.actionKey).eq('is_active', true).maybeSingle(),
  ])
  if (p.error) throw new Error(`autonomy_policy_read_failed:${p.error.message}`); if (r.error) throw new Error(`action_route_read_failed:${r.error.message}`); if (a.error) throw new Error(`approval_policy_read_failed:${a.error.message}`)
  const policy: any = p.data, route: any = r.data, approvalPolicy: any = a.data, blockers: string[] = []
  if (!policy) blockers.push('growth_executor_policy_missing'); else { if (!policy.enabled) blockers.push('growth_executor_disabled'); if (policy.kill_switch) blockers.push('autonomy_kill_switch_active'); if (Number(policy.autonomy_level || 0) < 4) blockers.push('autonomy_level_below_unattended') }
  const allowed = new Set(Array.isArray(policy?.allowed_tool_classes) ? policy.allowed_tool_classes.map(String) : [])
  for (const tool of requiredTools(input.actionKey)) if (!allowed.has(tool)) blockers.push(`tool_class_not_allowed:${tool}`)
  if (!route) blockers.push('action_route_disabled_or_missing'); else if (route.auto_execute_after_approval !== true) blockers.push('action_route_not_auto_executable')
  const policyJson = (approvalPolicy?.policy || {}) as Record<string, unknown>
  if (!approvalPolicy || policyJson.autonomous !== true) blockers.push('autonomous_policy_not_authorized')
  if (approvalPolicy && (approvalPolicy.maker_checker_required || Number(approvalPolicy.min_approvers || 0) > 0)) blockers.push('human_approval_still_required')
  blockers.push(...providerBlockers(input))
  if (input.actionKey === 'campaign.launch') { const account: any = await googleAccount(target); if (!account) blockers.push('google_account_not_connected'); if (account?.metadata?.discovery?.googleAdsOk !== true) blockers.push('google_ads_provider_discovery_not_verified') }
  const readiness: any = await latestReadiness(core.brandName, input.channel)
  if (!readiness) blockers.push(`channel_qa_missing:${input.channel}`); else { if (!PASSING_QA_STATES.has(String(readiness.qa_status || '').toLowerCase())) blockers.push(`channel_qa_not_ready:${input.channel}:${readiness.qa_status}`); if (Array.isArray(readiness.blockers)) blockers.push(...readiness.blockers.map((x: unknown) => `channel_blocker:${String(x)}`)) }
  return { ok: blockers.length === 0, blockers: Array.from(new Set(blockers)), policy, route, approvalPolicy, core, target }
}

async function existingRun(tenantId: string, key: string) { const { data, error } = await createSupabaseAdminClient().from('autonomous_execution_runs').select('*').eq('tenant_id', tenantId).eq('idempotency_key', key).maybeSingle(); if (error) throw new Error(`autonomous_run_read_failed:${error.message}`); return data }
async function createRun(access: ApiAccessContext, target: OperationalTarget, input: AutonomousExecutionInput) {
  const key = input.idempotencyKey?.trim(); if (!key || key.length < 8 || key.length > 200) throw new Error('autonomy_idempotency_key_invalid')
  const old = await existingRun(target.tenantId, key); if (old) return { run: old, existing: true }
  const amount = Number(input.amount || 0); if (!Number.isFinite(amount) || amount < 0) throw new Error('autonomy_amount_invalid')
  const providerKey = input.actionKey === 'campaign.launch' ? 'google' : input.actionKey === 'lifecycle.send' ? lifecycleProvider(input) : input.providerKey || 'unconfigured'
  const admin = createSupabaseAdminClient(); const { data, error } = await admin.from('autonomous_execution_runs').insert({ tenant_id: target.tenantId, workspace_id: target.workspaceId, agent_key: 'growth-executor', idempotency_key: key, action_key: input.actionKey, provider_key: providerKey, channel: input.channel, requested_amount: amount, currency: String(input.currency || 'INR').toUpperCase(), status: 'gated', reservation_state: amount > 0 ? 'pending' : 'not_required', request_payload: input.payload || {}, created_by: access.subject }).select('*').single()
  if (error) { const raced = await existingRun(target.tenantId, key); if (raced) return { run: raced, existing: true }; throw new Error(`autonomous_run_create_failed:${error.message}`) }
  return { run: data, existing: false }
}
async function updateRun(id: string, patch: Record<string, unknown>) { const { data, error } = await createSupabaseAdminClient().from('autonomous_execution_runs').update({ ...patch, updated_at: new Date().toISOString() }).eq('run_id', id).select('*').single(); if (error) throw new Error(`autonomous_run_update_failed:${error.message}`); return data }
async function spendRpc(name: 'reserve_autonomous_media_spend' | 'settle_autonomous_media_spend' | 'release_autonomous_media_spend', id: string) { const { data, error } = await createSupabaseAdminClient().rpc(name, { p_run_id: id }); if (error) throw new Error(`autonomous_spend_rpc_failed:${error.message}`); return data as any }
async function markBlocked(run: any, blockers: string[]) { return updateRun(run.run_id, { status: 'blocked', blockers, error_code: blockers[0] || 'autonomy_gate_blocked', completed_at: new Date().toISOString() }) }

async function machineApproval(access: ApiAccessContext, target: OperationalTarget, run: any, input: AutonomousExecutionInput) {
  const approvalId = `auto_${String(run.run_id).replace(/-/g, '')}`, approvalType = input.actionKey === 'campaign.launch' ? 'google_ads_campaign' : input.actionKey === 'lifecycle.send' ? 'lifecycle_send' : input.actionKey.replace('.', '_'), now = new Date().toISOString()
  const { data, error } = await createSupabaseAdminClient().from('commercial_approval_requests').upsert({ approval_id: approvalId, tenant_id: target.tenantId, approval_type: approvalType, status: 'approved', payload: { actionKey: input.actionKey, resourceType: approvalType, externalAction: approvalType, autonomous: true, autonomyAgent: 'growth-executor', autonomousRunId: run.run_id, idempotencyKey: input.idempotencyKey, amount: run.requested_amount, currency: run.currency }, resolution_payload: { decision: 'machine_scoped_approval', policyBasis: 'core_approval_policies + agent_autonomy_policies', approvedBy: access.subject, approvedAt: now }, actor_id: `autonomy:growth-executor:${access.subject}`, resolved_at: now }, { onConflict: 'approval_id' }).select('*').single()
  if (error) throw new Error(`autonomous_approval_write_failed:${error.message}`); return data
}

async function executeCampaign(access: ApiAccessContext, input: AutonomousExecutionInput, g: GateResult, run: any) {
  const payload = input.payload || {}, customerId = String(payload.customerId || ''), name = String(payload.name || ''), startDate = String(payload.startDate || ''), endDate = String(payload.endDate || ''), currency = String(run.currency || 'INR').toUpperCase()
  if (!customerId || !name || !startDate || !endDate) return markBlocked(run, ['campaign_payload_incomplete'])
  const providerCustomer = await readGoogleAdsCustomer(access, { workspaceId: input.workspaceId, customerId }); if (providerCustomer.currencyCode !== currency) return markBlocked(run, [`provider_currency_mismatch:${providerCustomer.currencyCode}:${currency}`])
  const amount = Number(run.requested_amount), micros = Math.round(amount * 1_000_000); if (amount <= 0 || !Number.isSafeInteger(micros) || micros <= 0) return markBlocked(run, ['prepaid_spend_amount_invalid'])
  const reservation = await spendRpc('reserve_autonomous_media_spend', run.run_id); if (!reservation?.ok) return markBlocked(run, [String(reservation?.code || 'prepaid_spend_reservation_failed')])
  const approval: any = await machineApproval(access, g.target, run, input); await updateRun(run.run_id, { status: 'approved', approval_id: approval.approval_id, blockers: [] })
  let resourceName: string | null = null, enableAttempted = false
  try {
    await updateRun(run.run_id, { status: 'executing', started_at: new Date().toISOString() })
    const created = await createBoundedSearchCampaign(access, { workspaceId: input.workspaceId, approvalId: approval.approval_id, customerId, name, totalBudgetMicros: micros, startDate, endDate })
    const createdResourceName = String(created.resourceName); resourceName = createdResourceName
    await updateRun(run.run_id, { external_resource_id: createdResourceName, provider_result: { phase: 'paused_verified', created } })
    enableAttempted = true
    const enabled = await setCampaignStatus(access, { workspaceId: input.workspaceId, approvalId: approval.approval_id, customerId, resourceName: createdResourceName, status: 'ENABLED' })
    const settlement = await spendRpc('settle_autonomous_media_spend', run.run_id)
    if (!settlement?.ok) { try { await setCampaignStatus(access, { workspaceId: input.workspaceId, approvalId: approval.approval_id, customerId, resourceName: createdResourceName, status: 'PAUSED' }); await spendRpc('release_autonomous_media_spend', run.run_id) } catch {}; return updateRun(run.run_id, { status: 'reconciliation_required', provider_result: { enabled, settlement }, error_code: String(settlement?.code || 'media_settlement_failed'), completed_at: new Date().toISOString() }) }
    return updateRun(run.run_id, { status: 'succeeded', provider_result: { phase: 'enabled_verified', enabled, settlement, providerCustomer }, error_code: null, completed_at: new Date().toISOString() })
  } catch (error) {
    const code = error instanceof Error ? error.message.split(':')[0] : 'autonomous_campaign_failed'
    if (!enableAttempted) { await spendRpc('release_autonomous_media_spend', run.run_id).catch(() => null); return updateRun(run.run_id, { status: 'failed', external_resource_id: resourceName, error_code: code, completed_at: new Date().toISOString() }) }
    if (resourceName) try { const verification = await readCampaign(access, { workspaceId: input.workspaceId, customerId, resourceName }); const state = String(verification?.campaign?.status || '').toUpperCase(); if (state === 'ENABLED') { const settlement = await spendRpc('settle_autonomous_media_spend', run.run_id); return updateRun(run.run_id, settlement?.ok ? { status: 'succeeded', provider_result: { phase: 'enabled_verified_after_retry', verification, settlement }, error_code: null, completed_at: new Date().toISOString() } : { status: 'reconciliation_required', provider_result: { verification, settlement }, error_code: String(settlement?.code || code), completed_at: new Date().toISOString() }) } if (state === 'PAUSED') { await spendRpc('release_autonomous_media_spend', run.run_id).catch(() => null); return updateRun(run.run_id, { status: 'failed', provider_result: { verification }, error_code: code, completed_at: new Date().toISOString() }) } } catch {}
    return updateRun(run.run_id, { status: 'verification_pending', external_resource_id: resourceName, error_code: 'provider_verification_pending', provider_result: { phase: 'enable_attempted_provider_state_ambiguous', originalError: code }, completed_at: null })
  }
}

async function executeLifecycle(access: ApiAccessContext, input: AutonomousExecutionInput, g: GateResult, run: any) {
  const payload = input.payload || {}; if (!payload.purpose || !payload.subject) return markBlocked(run, ['lifecycle_payload_incomplete'])
  const approval: any = await machineApproval(access, g.target, run, input); await updateRun(run.run_id, { status: 'executing', approval_id: approval.approval_id, started_at: new Date().toISOString(), blockers: [] })
  try {
    const result = await sendLifecycleMessage(access, { workspaceId: input.workspaceId, channel: input.channel as 'email' | 'whatsapp' | 'sms', purpose: String(payload.purpose), subject: String(payload.subject), provider: payload.provider, email: payload.email, whatsapp: payload.whatsapp, sms: payload.sms })
    if (result.blocked) return updateRun(run.run_id, { status: 'blocked', provider_result: result, error_code: String(result.reason || 'lifecycle_consent_blocked'), completed_at: new Date().toISOString() })
    return updateRun(run.run_id, { status: 'succeeded', provider_result: result, external_resource_id: result.providerMessageId || null, error_code: null, completed_at: new Date().toISOString() })
  } catch (error) { return updateRun(run.run_id, { status: 'failed', error_code: error instanceof Error ? error.message.split(':')[0] : 'autonomous_lifecycle_failed', completed_at: new Date().toISOString() }) }
}

export async function executeAutonomousAction(access: ApiAccessContext, input: AutonomousExecutionInput) {
  if (!input || typeof input !== 'object') throw new Error('autonomy_execution_required')
  const target = await resolveOperationalTarget(access, input.workspaceId), created = await createRun(access, target, input); if (created.existing) return { replayed: true, run: created.run }
  const g = await gate(access, input); if (!g.ok) return { replayed: false, run: await markBlocked(created.run, g.blockers), gate: g }
  if (input.actionKey === 'campaign.launch') return { replayed: false, run: await executeCampaign(access, input, g, created.run), gate: g }
  if (input.actionKey === 'lifecycle.send') return { replayed: false, run: await executeLifecycle(access, input, g, created.run), gate: g }
  return { replayed: false, run: await markBlocked(created.run, providerBlockers(input)), gate: g }
}

export async function autonomousExecutionStatus(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveOperationalTarget(access, workspaceId), core = coreTarget(target), admin = createSupabaseAdminClient()
  const [policy, media, readiness, runs, routes, approvals, google] = await Promise.all([
    admin.from('agent_autonomy_policies').select('*').eq('tenant_id', core.tenantId).eq('workspace_id', core.workspaceId).eq('agent_key', 'growth-executor').maybeSingle(),
    admin.from('commercial_media_balance_accounts').select('tenant_id,currency,available,reserved,spent,updated_at').eq('tenant_id', target.tenantId).maybeSingle(),
    admin.from('execution_channel_publish_readiness').select('*').eq('brand_name', core.brandName).order('created_at', { ascending: false }).limit(50),
    admin.from('autonomous_execution_runs').select('*').eq('tenant_id', target.tenantId).order('created_at', { ascending: false }).limit(25),
    admin.from('core_action_approval_routes').select('*').eq('enabled', true).order('action_key'),
    admin.from('core_approval_policies').select('*').eq('tenant_id', core.tenantId).eq('scope_type', 'workspace').eq('scope_ref', core.workspaceId).eq('is_active', true).order('action_key'),
    googleAccount(target).catch(() => null),
  ])
  for (const result of [policy, media, readiness, runs, routes, approvals]) if (result.error) throw new Error(`autonomy_status_read_failed:${result.error.message}`)
  const latest = new Map<string, any>(); for (const row of readiness.data || []) if (!latest.has(row.channel)) latest.set(row.channel, row)
  const g: any = google, discovery = g?.metadata?.discovery
  return { target, core, policy: policy.data || null, killSwitch: Boolean((policy.data as any)?.kill_switch), mediaBalance: media.data || null, providers: { google_ads: { runtimeConfigured: runtimeMissing(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'OYE_OAUTH_ENCRYPTION_KEY']).length === 0, accountConnected: Boolean(g), providerVerified: discovery?.googleAdsOk === true, lastVerifiedAt: g?.last_verified_at || null }, email: { runtimeConfigured: runtimeMissing(['RESEND_API_KEY', 'RESEND_FROM_EMAIL']).length === 0, adapter: 'resend' }, whatsapp: { runtimeConfigured: runtimeMissing(['WHATSAPP_GRAPH_VERSION', 'WHATSAPP_CLOUD_PHONE_NUMBER_ID', 'WHATSAPP_CLOUD_ACCESS_TOKEN']).length === 0, adapter: 'whatsapp_cloud' }, sms: { runtimeConfigured: runtimeMissing(['FAST2SMS_API_URL', 'FAST2SMS_API_KEY']).length === 0, adapter: 'fast2sms' }, meta_social: { runtimeConfigured: false, blocker: 'provider_adapter_not_configured' }, linkedin_social: { runtimeConfigured: false, blocker: 'provider_adapter_not_configured' } }, channelReadiness: Array.from(latest.values()), actionRoutes: routes.data || [], autonomousApprovalPolicies: approvals.data || [], recentRuns: runs.data || [] }
}

export async function setAutonomyKillSwitch(access: ApiAccessContext, input: { workspaceId?: string; active: boolean }) {
  if (access.membership.role_key !== 'platform_owner') throw new Error('platform_owner_required')
  const target = await resolveOperationalTarget(access, input.workspaceId), core = coreTarget(target), admin = createSupabaseAdminClient(), now = new Date().toISOString()
  const { data, error } = await admin.from('agent_autonomy_policies').update({ kill_switch: input.active, updated_at: now }).eq('tenant_id', core.tenantId).eq('workspace_id', core.workspaceId).eq('agent_key', 'growth-executor').select('*').single(); if (error) throw new Error(`autonomy_kill_switch_update_failed:${error.message}`)
  await admin.from('commercial_audit_events').insert({ tenant_id: target.tenantId, event_type: input.active ? 'autonomy_kill_switch_activated' : 'autonomy_kill_switch_released', actor_id: access.subject, payload: { workspaceId: target.workspaceId, agentKey: 'growth-executor' } })
  return data
}

export async function recordChannelReadiness(access: ApiAccessContext, input: { workspaceId?: string; channel: string; ready: boolean; blockers?: string[]; note?: string }) {
  if (access.membership.role_key !== 'platform_owner') throw new Error('platform_owner_required')
  const target = await resolveOperationalTarget(access, input.workspaceId), core = coreTarget(target), channel = input.channel.trim(); if (!channel) throw new Error('channel_required')
  const { data, error } = await createSupabaseAdminClient().from('execution_channel_publish_readiness').insert({ brand_name: core.brandName, channel, qa_status: input.ready ? 'verified' : 'blocked', blockers: input.ready ? [] : input.blockers || ['operator_marked_not_ready'], next_action: input.ready ? `Provider-side QA verified by ${access.subject}` : input.note || 'Resolve channel blockers and re-run provider-side QA.' }).select('*').single(); if (error) throw new Error(`channel_readiness_write_failed:${error.message}`)
  return data
}

export function newAutonomyIdempotencyKey(prefix = 'run') { return `${prefix}_${crypto.randomUUID()}` }
