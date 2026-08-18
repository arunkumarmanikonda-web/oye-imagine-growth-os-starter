import crypto from 'node:crypto'
import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolvePrivacyTarget } from '@/lib/privacy/context'

export type LifecycleChannel = 'email' | 'whatsapp' | 'sms'

type UnsubscribePayload = {
  tenantId: string
  workspaceId: string | null
  subjectKey: string
  channel: LifecycleChannel
  purpose: string
  exp: number
}

function signingSecret() {
  const value = process.env.OYE_PRIVACY_SIGNING_SECRET?.trim()
  if (!value) throw new Error('oye_privacy_signing_secret_not_configured')
  return value
}

export function normalizeSubject(channel: LifecycleChannel | 'push' | 'web', value: string) {
  const raw = value.trim()
  if (!raw) throw new Error('privacy_subject_required')
  if (channel === 'email') return raw.toLowerCase()
  if (channel === 'sms' || channel === 'whatsapp') {
    const leadingPlus = raw.startsWith('+')
    const digits = raw.replace(/\D/g, '')
    if (!digits) throw new Error('privacy_subject_invalid')
    return `${leadingPlus ? '+' : ''}${digits}`
  }
  return raw
}

function signPayload(payload: UnsubscribePayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', signingSecret()).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyUnsubscribeToken(token: string): UnsubscribePayload {
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) throw new Error('unsubscribe_token_invalid')
  const expected = crypto.createHmac('sha256', signingSecret()).update(encoded).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('unsubscribe_token_invalid')
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<UnsubscribePayload>
  if (!payload.tenantId || !payload.subjectKey || !payload.channel || !payload.purpose || !payload.exp) throw new Error('unsubscribe_token_invalid')
  if (Date.now() > payload.exp) throw new Error('unsubscribe_token_expired')
  return payload as UnsubscribePayload
}

export function createUnsubscribeToken(input: Omit<UnsubscribePayload, 'exp'> & { expiresInDays?: number }) {
  return signPayload({ ...input, exp: Date.now() + Math.max(1, input.expiresInDays || 365) * 86_400_000 })
}

export async function recordConsent(access: ApiAccessContext, input: {
  workspaceId?: string
  subject: string
  channel: LifecycleChannel | 'push' | 'web'
  purpose: string
  decision: 'granted' | 'withdrawn'
  noticeVersion: string
  source: string
  lawfulBasis?: string
  metadata?: Record<string, unknown>
}) {
  const target = await resolvePrivacyTarget(access, input.workspaceId)
  const subjectKey = normalizeSubject(input.channel, input.subject)
  if (!input.purpose.trim() || !input.noticeVersion.trim() || !input.source.trim()) throw new Error('privacy_consent_fields_required')
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('privacy_consent_events').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    subject_key: subjectKey,
    channel: input.channel,
    purpose: input.purpose.trim(),
    decision: input.decision,
    notice_version: input.noticeVersion.trim(),
    source: input.source.trim(),
    lawful_basis: input.lawfulBasis?.trim() || null,
    actor_id: access.subject,
    metadata: input.metadata || {},
  }).select('*').single()
  if (error) throw new Error(`privacy_consent_write_failed:${error.message}`)
  return data
}

export async function deliveryPermission(input: {
  tenantId: string
  workspaceId?: string | null
  subject: string
  channel: LifecycleChannel
  purpose: string
}) {
  const subjectKey = normalizeSubject(input.channel, input.subject)
  const admin = createSupabaseAdminClient()
  let consentQuery = admin.from('privacy_consent_events').select('*')
    .eq('tenant_id', input.tenantId)
    .eq('subject_key', subjectKey)
    .eq('channel', input.channel)
    .eq('purpose', input.purpose)
  if (input.workspaceId) consentQuery = consentQuery.eq('workspace_id', input.workspaceId)
  const { data: consent, error: consentError } = await consentQuery.order('occurred_at', { ascending: false }).limit(1).maybeSingle()
  if (consentError) throw new Error(`privacy_consent_read_failed:${consentError.message}`)

  let suppressionQuery = admin.from('privacy_suppressions').select('*')
    .eq('tenant_id', input.tenantId)
    .eq('subject_key', subjectKey)
    .eq('active', true)
  if (input.workspaceId) suppressionQuery = suppressionQuery.or(`workspace_id.eq.${input.workspaceId},workspace_id.is.null`)
  const { data: suppressions, error: suppressionError } = await suppressionQuery
  if (suppressionError) throw new Error(`privacy_suppression_read_failed:${suppressionError.message}`)
  const suppression = (suppressions || []).find((row: any) => row.scope === 'global' || (row.scope === 'channel' && row.channel === input.channel)) || null

  if (suppression) return { allowed: false, reason: 'suppressed', subjectKey, consentEvent: consent || null, suppression }
  if (!consent) return { allowed: false, reason: 'consent_missing', subjectKey, consentEvent: null, suppression: null }
  if (consent.decision !== 'granted') return { allowed: false, reason: 'consent_withdrawn', subjectKey, consentEvent: consent, suppression: null }
  return { allowed: true, reason: 'consent_granted', subjectKey, consentEvent: consent, suppression: null }
}

export async function suppressSubject(access: ApiAccessContext, input: {
  workspaceId?: string
  subject: string
  channel?: LifecycleChannel
  scope?: 'channel' | 'global'
  reason: string
  source: string
  reversible?: boolean
}) {
  const target = await resolvePrivacyTarget(access, input.workspaceId)
  const scope = input.scope || (input.channel ? 'channel' : 'global')
  const normalizationChannel: LifecycleChannel = input.channel || (input.subject.includes('@') ? 'email' : 'sms')
  const subjectKey = normalizeSubject(normalizationChannel, input.subject)
  if (scope === 'channel' && !input.channel) throw new Error('privacy_suppression_channel_required')
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('privacy_suppressions').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    subject_key: subjectKey,
    channel: scope === 'channel' ? input.channel : null,
    scope,
    reason: input.reason.trim() || 'operator_suppression',
    source: input.source.trim() || 'operator',
    reversible: input.reversible !== false,
    active: true,
  }).select('*').single()
  if (error) throw new Error(`privacy_suppression_write_failed:${error.message}`)
  return data
}

export async function releaseSuppression(access: ApiAccessContext, suppressionId: string) {
  const admin = createSupabaseAdminClient()
  const { data: row, error: readError } = await admin.from('privacy_suppressions').select('*').eq('suppression_id', suppressionId).maybeSingle()
  if (readError || !row) throw new Error('privacy_suppression_not_found')
  await resolvePrivacyTarget(access, row.workspace_id || undefined)
  if (!row.reversible) throw new Error('privacy_suppression_irreversible')
  const { data, error } = await admin.from('privacy_suppressions').update({ active: false, released_at: new Date().toISOString(), released_by: access.subject, updated_at: new Date().toISOString() }).eq('suppression_id', suppressionId).select('*').single()
  if (error) throw new Error(`privacy_suppression_release_failed:${error.message}`)
  return data
}

export async function applyPublicUnsubscribe(token: string) {
  const payload = verifyUnsubscribeToken(token)
  const subjectKey = normalizeSubject(payload.channel, payload.subjectKey)
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.rpc('apply_public_unsubscribe_guarded', {
    p_tenant_id: payload.tenantId,
    p_workspace_id: payload.workspaceId,
    p_subject_key: subjectKey,
    p_channel: payload.channel,
    p_purpose: payload.purpose,
  })
  if (error) {
    const message = error.message || ''
    if (message.includes('unsubscribe_channel_invalid')) throw new Error('unsubscribe_token_invalid')
    if (message.includes('unsubscribe_fields_required') || message.includes('unsubscribe_tenant_required')) throw new Error('unsubscribe_token_invalid')
    throw new Error('privacy_unsubscribe_failed')
  }
  return data as {
    ok: boolean
    applied: boolean
    alreadyApplied: boolean
    suppressionCreated: boolean
    consentEventCreated: boolean
    channel: LifecycleChannel
    purpose: string
  }
}

export async function listPrivacyState(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolvePrivacyTarget(access, workspaceId)
  const admin = createSupabaseAdminClient()
  const [consents, suppressions] = await Promise.all([
    admin.from('privacy_consent_events').select('*').eq('tenant_id', target.tenantId).order('occurred_at', { ascending: false }).limit(100),
    admin.from('privacy_suppressions').select('*').eq('tenant_id', target.tenantId).order('suppressed_at', { ascending: false }).limit(100),
  ])
  if (consents.error) throw new Error(`privacy_consent_read_failed:${consents.error.message}`)
  if (suppressions.error) throw new Error(`privacy_suppression_read_failed:${suppressions.error.message}`)
  return { target, consents: consents.data || [], suppressions: suppressions.data || [] }
}
