import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createUnsubscribeToken, deliveryPermission, type LifecycleChannel } from '@/lib/privacy/consent'
import { resolvePrivacyTarget } from '@/lib/privacy/context'

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name.toLowerCase()}_not_configured`)
  return value
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.oyeimagine.com').replace(/\/$/, '')
}

async function sendEmail(input: {
  to: string
  subject: string
  html?: string
  text?: string
  unsubscribeUrl: string
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${required('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: required('RESEND_FROM_EMAIL'),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: {
        'List-Unsubscribe': `<${input.unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.id) throw new Error(`resend_send_failed:${payload?.message || response.status}`)
  return { providerMessageId: String(payload.id), providerStatus: 'accepted', raw: { id: payload.id } }
}

async function sendWhatsApp(input: { to: string; templateName: string; languageCode?: string; components?: unknown[] }) {
  const base = (process.env.WHATSAPP_GRAPH_BASE_URL || 'https://graph.facebook.com').replace(/\/$/, '')
  const version = required('WHATSAPP_GRAPH_VERSION').replace(/^\//, '')
  const phoneNumberId = required('WHATSAPP_CLOUD_PHONE_NUMBER_ID')
  const response = await fetch(`${base}/${version}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${required('WHATSAPP_CLOUD_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: input.to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: input.templateName,
        language: { code: input.languageCode || 'en' },
        ...(input.components?.length ? { components: input.components } : {}),
      },
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  const id = payload?.messages?.[0]?.id
  if (!response.ok || !id) throw new Error(`whatsapp_send_failed:${payload?.error?.message || response.status}`)
  return { providerMessageId: String(id), providerStatus: 'accepted', raw: { messagingProduct: payload.messaging_product || 'whatsapp' } }
}

async function sendSms(input: { to: string; message: string }) {
  const response = await fetch(required('FAST2SMS_API_URL'), {
    method: 'POST',
    headers: {
      authorization: required('FAST2SMS_API_KEY'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: process.env.FAST2SMS_ROUTE || 'q',
      sender_id: process.env.FAST2SMS_SENDER_ID || undefined,
      message: input.message,
      language: 'english',
      flash: 0,
      numbers: input.to.replace(/\D/g, ''),
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  const id = payload?.request_id || payload?.requestId || payload?.id
  if (!response.ok || payload?.return === false || !id) throw new Error(`fast2sms_send_failed:${payload?.message || response.status}`)
  return { providerMessageId: String(id), providerStatus: 'accepted', raw: { requestId: id } }
}

export async function sendLifecycleMessage(access: ApiAccessContext, input: {
  workspaceId?: string
  channel: LifecycleChannel
  purpose: string
  subject: string
  provider?: 'resend' | 'whatsapp_cloud' | 'fast2sms'
  email?: { subject: string; html?: string; text?: string }
  whatsapp?: { templateName: string; languageCode?: string; components?: unknown[] }
  sms?: { message: string }
}) {
  const target = await resolvePrivacyTarget(access, input.workspaceId)
  if (!input.purpose.trim()) throw new Error('lifecycle_purpose_required')
  const permission = await deliveryPermission({
    tenantId: target.tenantId,
    workspaceId: target.workspaceId,
    subject: input.subject,
    channel: input.channel,
    purpose: input.purpose.trim(),
  })
  const provider = input.provider || (input.channel === 'email' ? 'resend' : input.channel === 'whatsapp' ? 'whatsapp_cloud' : 'fast2sms')
  const admin = createSupabaseAdminClient()
  const requestedPayload = input.channel === 'email' ? input.email || {} : input.channel === 'whatsapp' ? input.whatsapp || {} : input.sms || {}
  const { data: job, error: jobError } = await admin.from('lifecycle_delivery_jobs').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    subject_key: permission.subjectKey,
    channel: input.channel,
    purpose: input.purpose.trim(),
    provider,
    payload: requestedPayload,
    consent_event_id: permission.consentEvent?.consent_event_id || null,
    status: permission.allowed ? 'queued' : 'blocked',
    decision_reason: permission.reason,
    requested_by: access.subject,
  }).select('*').single()
  if (jobError) throw new Error(`lifecycle_job_write_failed:${jobError.message}`)
  if (!permission.allowed) return { sent: false, blocked: true, reason: permission.reason, job }

  await admin.from('lifecycle_delivery_jobs').update({ status: 'sending', attempts: 1, last_attempt_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('delivery_job_id', job.delivery_job_id)
  try {
    let result: { providerMessageId: string; providerStatus: string; raw: Record<string, unknown> }
    if (input.channel === 'email') {
      if (!input.email?.subject?.trim() || (!input.email.html && !input.email.text)) throw new Error('email_payload_required')
      const unsubscribeToken = createUnsubscribeToken({
        tenantId: target.tenantId,
        workspaceId: target.workspaceId,
        subjectKey: permission.subjectKey,
        channel: 'email',
        purpose: input.purpose.trim(),
      })
      const unsubscribeUrl = `${siteUrl()}/api/public/privacy/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
      result = await sendEmail({ to: permission.subjectKey, subject: input.email.subject.trim(), html: input.email.html, text: input.email.text, unsubscribeUrl })
    } else if (input.channel === 'whatsapp') {
      if (!input.whatsapp?.templateName?.trim()) throw new Error('whatsapp_template_required')
      result = await sendWhatsApp({ to: permission.subjectKey, templateName: input.whatsapp.templateName.trim(), languageCode: input.whatsapp.languageCode, components: input.whatsapp.components })
    } else {
      if (!input.sms?.message?.trim()) throw new Error('sms_payload_required')
      result = await sendSms({ to: permission.subjectKey, message: input.sms.message.trim() })
    }
    const { data: completed } = await admin.from('lifecycle_delivery_jobs').update({
      status: 'sent',
      provider_message_id: result.providerMessageId,
      provider_status: result.providerStatus,
      callback_metadata: result.raw,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('delivery_job_id', job.delivery_job_id).select('*').single()
    return { sent: true, blocked: false, job: completed || job, providerMessageId: result.providerMessageId }
  } catch (error) {
    const code = error instanceof Error ? error.message.split(':')[0] : 'provider_send_failed'
    await admin.from('lifecycle_delivery_jobs').update({
      status: 'failed',
      provider_status: 'failed',
      decision_reason: code,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('delivery_job_id', job.delivery_job_id)
    throw error
  }
}

export async function applyDeliveryCallback(input: { providerMessageId: string; providerStatus: string; metadata?: Record<string, unknown> }) {
  const admin = createSupabaseAdminClient()
  const terminalDelivered = ['delivered', 'read'].includes(input.providerStatus.toLowerCase())
  const terminalFailed = ['failed', 'undelivered', 'bounced', 'complained'].includes(input.providerStatus.toLowerCase())
  const status = terminalDelivered ? 'delivered' : terminalFailed ? 'failed' : 'sent'
  const { data, error } = await admin.from('lifecycle_delivery_jobs').update({
    status,
    provider_status: input.providerStatus,
    callback_metadata: input.metadata || {},
    completed_at: terminalDelivered || terminalFailed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('provider_message_id', input.providerMessageId).select('*').limit(1).maybeSingle()
  if (error) throw new Error(`lifecycle_callback_write_failed:${error.message}`)
  return data
}
