import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'

export type MediaFundingEvidence = {
  bankName?: string
  payerName?: string
  sourceAccountLast4?: string
  proofReference?: string
}

function money(value: unknown) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('media_funding_amount_invalid')
  return Math.round(amount * 100) / 100
}

function currency(value: unknown) {
  const code = String(value || 'INR').trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) throw new Error('media_funding_currency_invalid')
  return code
}

function reference(value: unknown) {
  const result = String(value || '').trim()
  if (result.length < 4 || result.length > 120) throw new Error('media_funding_reference_invalid')
  return result
}

function optionalText(value: unknown, max = 200) {
  const result = String(value || '').trim()
  return result ? result.slice(0, max) : null
}

function evidence(input: MediaFundingEvidence | undefined) {
  const sourceAccountLast4 = optionalText(input?.sourceAccountLast4, 4)
  if (sourceAccountLast4 && !/^\d{4}$/.test(sourceAccountLast4)) throw new Error('media_funding_account_last4_invalid')
  return {
    bankName: optionalText(input?.bankName, 100),
    payerName: optionalText(input?.payerName, 120),
    sourceAccountLast4,
    proofReference: optionalText(input?.proofReference, 160),
  }
}

function paidAt(value: unknown) {
  if (!value) return null
  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) throw new Error('media_funding_paid_at_invalid')
  if (parsed.getTime() > Date.now() + 5 * 60_000) throw new Error('media_funding_paid_at_future')
  return parsed.toISOString()
}

function assertFinanceReviewer(access: ApiAccessContext) {
  if (access.membership.role_key !== 'platform_owner') throw new Error('platform_owner_required')
}

export async function submitMediaFundingRequest(access: ApiAccessContext, input: {
  workspaceId?: string
  amount: number
  currency?: string
  remittanceReference: string
  paidAt?: string | null
  note?: string | null
  evidence?: MediaFundingEvidence
}) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  if (!target.workspaceId) throw new Error('media_funding_workspace_required')
  const admin = createSupabaseAdminClient()
  const payload = {
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    amount: money(input.amount),
    currency: currency(input.currency),
    funding_source: 'bank_remittance',
    remittance_reference: reference(input.remittanceReference),
    paid_at: paidAt(input.paidAt),
    evidence: evidence(input.evidence),
    note: optionalText(input.note, 500),
    status: 'submitted',
    submitted_by: access.subject,
  }
  const { data, error } = await admin.from('commercial_media_funding_requests').insert(payload).select('*').single()
  if (error) {
    if (error.code === '23505') throw new Error('media_funding_reference_already_submitted')
    throw new Error(`media_funding_submit_failed:${error.message}`)
  }
  await admin.from('commercial_audit_events').insert({
    tenant_id: target.tenantId,
    event_type: 'media_wallet_funding_submitted',
    actor_id: access.subject,
    payload: { requestId: data.request_id, workspaceId: target.workspaceId, amount: data.amount, currency: data.currency, reference: data.remittance_reference },
  })
  return data
}

export async function listMediaFundingRequests(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveOperationalTarget(access, workspaceId)
  const admin = createSupabaseAdminClient()
  let query = admin.from('commercial_media_funding_requests').select('*').eq('tenant_id', target.tenantId)
  if (target.workspaceId) query = query.eq('workspace_id', target.workspaceId)
  const { data, error } = await query.order('submitted_at', { ascending: false }).limit(100)
  if (error) throw new Error(`media_funding_list_failed:${error.message}`)
  const { data: balance, error: balanceError } = await admin.from('commercial_media_balance_accounts').select('*').eq('tenant_id', target.tenantId).maybeSingle()
  if (balanceError) throw new Error(`media_balance_read_failed:${balanceError.message}`)
  return { target, balance: balance || null, requests: data || [] }
}

export async function verifyMediaFundingRequest(access: ApiAccessContext, input: { workspaceId?: string; requestId: string; note?: string | null }) {
  assertFinanceReviewer(access)
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const admin = createSupabaseAdminClient()
  const { data: request, error: requestError } = await admin.from('commercial_media_funding_requests').select('request_id,tenant_id,workspace_id,status,submitted_by').eq('request_id', input.requestId).eq('tenant_id', target.tenantId).maybeSingle()
  if (requestError || !request) throw new Error('media_funding_request_not_found')
  if (target.workspaceId && request.workspace_id !== target.workspaceId) throw new Error('media_funding_workspace_mismatch')
  if (request.submitted_by === access.subject) throw new Error('media_funding_maker_checker_required')
  const { data, error } = await admin.rpc('verify_and_credit_media_funding', {
    p_request_id: request.request_id,
    p_actor: access.subject,
    p_verification_note: optionalText(input.note, 500),
  })
  if (error) throw new Error(`media_funding_verify_failed:${error.message}`)
  if (!data?.ok) throw new Error(String(data?.code || 'media_funding_verify_failed'))
  return data
}

export async function rejectMediaFundingRequest(access: ApiAccessContext, input: { workspaceId?: string; requestId: string; reason: string }) {
  assertFinanceReviewer(access)
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const reason = optionalText(input.reason, 500)
  if (!reason) throw new Error('media_funding_rejection_reason_required')
  const admin = createSupabaseAdminClient()
  const { data: request, error: readError } = await admin.from('commercial_media_funding_requests').select('*').eq('request_id', input.requestId).eq('tenant_id', target.tenantId).maybeSingle()
  if (readError || !request) throw new Error('media_funding_request_not_found')
  if (target.workspaceId && request.workspace_id !== target.workspaceId) throw new Error('media_funding_workspace_mismatch')
  if (request.status !== 'submitted') throw new Error('media_funding_request_not_rejectable')
  const now = new Date().toISOString()
  const { data, error } = await admin.from('commercial_media_funding_requests').update({
    status: 'rejected',
    rejected_by: access.subject,
    rejected_at: now,
    rejection_reason: reason,
    updated_at: now,
  }).eq('request_id', request.request_id).eq('status', 'submitted').select('*').single()
  if (error) throw new Error(`media_funding_reject_failed:${error.message}`)
  await admin.from('commercial_audit_events').insert({
    tenant_id: target.tenantId,
    event_type: 'media_wallet_funding_rejected',
    actor_id: access.subject,
    payload: { requestId: request.request_id, workspaceId: request.workspace_id, reason },
  })
  return data
}
