import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { normalizeSubject, type LifecycleChannel } from '@/lib/privacy/consent'
import { resolvePrivacyTarget } from '@/lib/privacy/context'

export type DsarRequestType = 'access' | 'export' | 'correction' | 'deletion' | 'restriction' | 'objection'

function subjectKey(subject: string, channelHint?: LifecycleChannel) {
  const channel = channelHint || (subject.includes('@') ? 'email' : 'sms')
  return normalizeSubject(channel, subject)
}

export async function createDsarRequest(access: ApiAccessContext, input: {
  workspaceId?: string
  subject: string
  channelHint?: LifecycleChannel
  requestType: DsarRequestType
  requestPayload?: Record<string, unknown>
  dueAt?: string
}) {
  const target = await resolvePrivacyTarget(access, input.workspaceId)
  const key = subjectKey(input.subject, input.channelHint)
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('privacy_dsar_requests').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    subject_key: key,
    request_type: input.requestType,
    identity_status: 'pending',
    status: 'received',
    request_payload: input.requestPayload || {},
    due_at: input.dueAt || null,
    created_by: access.subject,
    updated_by: access.subject,
  }).select('*').single()
  if (error) throw new Error(`privacy_dsar_create_failed:${error.message}`)
  return data
}

export async function verifyDsarIdentity(access: ApiAccessContext, input: {
  dsarRequestId: string
  verified: boolean
  evidence?: Record<string, unknown>
}) {
  const admin = createSupabaseAdminClient()
  const { data: request, error: readError } = await admin.from('privacy_dsar_requests').select('*').eq('dsar_request_id', input.dsarRequestId).maybeSingle()
  if (readError || !request) throw new Error('privacy_dsar_not_found')
  await resolvePrivacyTarget(access, request.workspace_id || undefined)
  const { data, error } = await admin.from('privacy_dsar_requests').update({
    identity_status: input.verified ? 'verified' : 'failed',
    status: input.verified ? 'in_progress' : 'needs_review',
    verified_at: input.verified ? new Date().toISOString() : null,
    result_metadata: { ...(request.result_metadata || {}), identityEvidence: input.evidence || {}, identityDecisionBy: access.subject },
    updated_by: access.subject,
    updated_at: new Date().toISOString(),
  }).eq('dsar_request_id', input.dsarRequestId).select('*').single()
  if (error) throw new Error(`privacy_dsar_verify_failed:${error.message}`)
  return data
}

async function collectSubjectData(tenantId: string, workspaceId: string | null, key: string) {
  const admin = createSupabaseAdminClient()
  const workspace = <T extends { eq: Function }>(query: T) => workspaceId ? query.eq('workspace_id', workspaceId) : query
  const [consents, suppressions, deliveries, dsars, commerce] = await Promise.all([
    workspace(admin.from('privacy_consent_events').select('*').eq('tenant_id', tenantId).eq('subject_key', key)).order('occurred_at', { ascending: true }),
    workspace(admin.from('privacy_suppressions').select('*').eq('tenant_id', tenantId).eq('subject_key', key)).order('suppressed_at', { ascending: true }),
    workspace(admin.from('lifecycle_delivery_jobs').select('*').eq('tenant_id', tenantId).eq('subject_key', key)).order('requested_at', { ascending: true }),
    workspace(admin.from('privacy_dsar_requests').select('*').eq('tenant_id', tenantId).eq('subject_key', key)).order('requested_at', { ascending: true }),
    workspace(admin.from('commerce_orders_ingested').select('external_order_id,order_timestamp,currency,gross_revenue,discount_amount,refund_amount,net_revenue,status,customer_ref,utm,ingested_at').eq('tenant_id', tenantId).eq('customer_ref', key)).order('order_timestamp', { ascending: true }),
  ])
  const errors = [consents.error, suppressions.error, deliveries.error, dsars.error].filter(Boolean)
  if (errors.length) throw new Error(`privacy_dsar_export_failed:${errors[0]?.message || 'privacy_data_read_failed'}`)
  const commerceRows = commerce.error ? [] : commerce.data || []
  return {
    generatedAt: new Date().toISOString(),
    subjectKey: key,
    categories: {
      consentHistory: consents.data || [],
      suppressions: suppressions.data || [],
      lifecycleDeliveries: deliveries.data || [],
      dsarHistory: dsars.data || [],
      commerceOrders: commerceRows,
    },
    disclosureNotes: [
      'Provider secrets, internal security telemetry and records belonging to other data subjects are excluded.',
      'Financial, contractual and audit records may be retained where legal or accounting obligations require retention.',
      commerce.error ? 'Commerce order records could not be queried from the currently deployed schema; the export records that limitation rather than inventing data.' : null,
    ].filter(Boolean),
  }
}

export async function processDsar(access: ApiAccessContext, input: { dsarRequestId: string }) {
  const admin = createSupabaseAdminClient()
  const { data: request, error: readError } = await admin.from('privacy_dsar_requests').select('*').eq('dsar_request_id', input.dsarRequestId).maybeSingle()
  if (readError || !request) throw new Error('privacy_dsar_not_found')
  await resolvePrivacyTarget(access, request.workspace_id || undefined)
  if (request.identity_status !== 'verified' && request.identity_status !== 'waived') throw new Error('privacy_dsar_identity_required')

  if (request.request_type === 'access' || request.request_type === 'export') {
    const exportData = await collectSubjectData(request.tenant_id, request.workspace_id, request.subject_key)
    const { data, error } = await admin.from('privacy_dsar_requests').update({
      status: 'completed',
      result_metadata: { ...(request.result_metadata || {}), export: exportData, processedBy: access.subject },
      completed_at: new Date().toISOString(),
      updated_by: access.subject,
      updated_at: new Date().toISOString(),
    }).eq('dsar_request_id', input.dsarRequestId).select('*').single()
    if (error) throw new Error(`privacy_dsar_complete_failed:${error.message}`)
    return { request: data, exportData, automated: true }
  }

  const reviewPlan = {
    generatedAt: new Date().toISOString(),
    requestedAction: request.request_type,
    subjectKey: request.subject_key,
    automatedMutationPerformed: false,
    reviewRequired: true,
    protectedRecordClasses: ['commercial_ledger_entries', 'commercial_invoices', 'commercial_contracts', 'commercial_audit_events', 'admin_audit_events', 'audit_events'],
    instructions: request.request_type === 'deletion'
      ? 'Identify directly identifying data that may be deleted or anonymized. Preserve legally required financial, contract, security and audit evidence; record every executed change as a separate approved operation.'
      : 'Validate the requested correction/restriction/objection against source-of-truth records before any mutation. Record source evidence and reviewer identity.',
  }
  const { data, error } = await admin.from('privacy_dsar_requests').update({
    status: 'needs_review',
    result_metadata: { ...(request.result_metadata || {}), reviewPlan, processedBy: access.subject },
    updated_by: access.subject,
    updated_at: new Date().toISOString(),
  }).eq('dsar_request_id', input.dsarRequestId).select('*').single()
  if (error) throw new Error(`privacy_dsar_review_plan_failed:${error.message}`)
  return { request: data, reviewPlan, automated: false }
}

export async function listDsarRequests(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolvePrivacyTarget(access, workspaceId)
  const admin = createSupabaseAdminClient()
  let query = admin.from('privacy_dsar_requests').select('*').eq('tenant_id', target.tenantId)
  if (target.workspaceId) query = query.eq('workspace_id', target.workspaceId)
  const { data, error } = await query.order('requested_at', { ascending: false }).limit(100)
  if (error) throw new Error(`privacy_dsar_list_failed:${error.message}`)
  return { target, requests: data || [] }
}
