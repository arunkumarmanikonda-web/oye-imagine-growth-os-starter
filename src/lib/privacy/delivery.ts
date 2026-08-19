import type { ApiAccessContext } from '@/lib/auth/api-access'
import { resolveRuntimeCapabilityProvider } from '@/lib/config-control/runtime-provider-config'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createUnsubscribeToken, deliveryPermission, type LifecycleChannel } from '@/lib/privacy/consent'
import { resolvePrivacyTarget } from '@/lib/privacy/context'

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.oyeimagine.com').replace(/\/$/, '')
}

function capabilityForChannel(channel: LifecycleChannel) {
  if (channel === 'email') return { capabilityKey: 'email.send', purpose: 'lifecycle' }
  if (channel === 'whatsapp') return { capabilityKey: 'whatsapp.send', purpose: 'lifecycle' }
  return { capabilityKey: 'sms.send', purpose: 'lifecycle' }
}

function declaredProvider(channel: LifecycleChannel, preferred?: string) {
  if (preferred) return preferred
  if (channel === 'email') return 'resend'
  if (channel === 'whatsapp') return 'whatsapp_cloud'
  return 'fast2sms'
}

async function sendEmail(input: {
  to: string
  subject: string
  html?: string
  text?: string
  unsubscribeUrl: string
  config: Record<string, string>
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.config.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: input.config.RESEND_FROM_EMAIL,
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
  return { providerMessageId: String(payload.id), providerStatus: 'accepted', raw: { provider: 'resend', id: payload.id } }
}

async function sendWhatsAppCloud(input: {
  to: string
  templateName: string
  languageCode?: string
  components?: unknown[]
  config: Record<string, string>
}) {
  const base = (input.config.WHATSAPP_GRAPH_BASE_URL || 'https://graph.facebook.com').replace(/\/$/, '')
  const version = input.config.WHATSAPP_GRAPH_VERSION.replace(/^\//, '')
  const phoneNumberId = input.config.WHATSAPP_CLOUD_PHONE_NUMBER_ID
  const response = await fetch(`${base}/${version}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.config.WHATSAPP_CLOUD_ACCESS_TOKEN}`,
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
  return { providerMessageId: String(id), providerStatus: 'accepted', raw: { provider: 'whatsapp_cloud', messagingProduct: payload.messaging_product || 'whatsapp' } }
}

function aiSensyTemplateParams(components?: unknown[]) {
  if (!components?.length) return []
  const params: string[] = []
  for (const component of components) {
    if (!component || typeof component !== 'object' || Array.isArray(component)) throw new Error('aisensy_components_unsupported')
    const row = component as Record<string, unknown>
    if (row.type !== 'body' || !Array.isArray(row.parameters)) throw new Error('aisensy_components_unsupported')
    for (const parameter of row.parameters) {
      if (!parameter || typeof parameter !== 'object' || Array.isArray(parameter)) throw new Error('aisensy_components_unsupported')
      const item = parameter as Record<string, unknown>
      if (item.type !== 'text' || typeof item.text !== 'string') throw new Error('aisensy_components_unsupported')
      params.push(item.text)
    }
  }
  return params
}

async function sendAiSensy(input: {
  to: string
  templateName: string
  components?: unknown[]
  config: Record<string, string>
}) {
  const campaignName = input.config.AISENSY_CAMPAIGN_NAME
  if (input.templateName !== campaignName) throw new Error('aisensy_template_mismatch')
  const endpoint = input.config.AISENSY_CAMPAIGN_ENDPOINT || 'https://backend.aisensy.com/campaign/t1/api/v2'
  const payload = {
    apiKey: input.config.AISENSY_API_KEY,
    campaignName,
    destination: input.to.replace(/\D/g, ''),
    userName: 'Oye !magine lifecycle recipient',
    source: input.config.AISENSY_SOURCE || 'OyeImagineApp',
    templateParams: aiSensyTemplateParams(input.components),
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  const body: any = await response.json().catch(() => ({}))
  const id = body?.messageId || body?.message_id || body?.requestId || body?.id || body?.data?.messageId || body?.data?.message_id || body?.data?.id
  if (!response.ok || !id) throw new Error(`aisensy_send_failed:${body?.message || response.status}`)
  return { providerMessageId: String(id), providerStatus: 'accepted', raw: { provider: 'aisensy', id: String(id) } }
}

async function sendSms(input: { to: string; message: string; config: Record<string, string> }) {
  const endpoint = input.config.FAST2SMS_API_URL || 'https://www.fast2sms.com/dev/bulkV2'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: input.config.FAST2SMS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: input.config.FAST2SMS_ROUTE || 'q',
      sender_id: input.config.FAST2SMS_SENDER_ID || undefined,
      entity_id: input.config.FAST2SMS_ENTITY_ID || undefined,
      template_id: input.config.FAST2SMS_TEMPLATE_ID || undefined,
      message: input.message,
      language: 'english',
      flash: 0,
      numbers: input.to.replace(/\D/g, ''),
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  const id = payload?.request_id || payload?.requestId || payload?.id
  if (!response.ok || payload?.return === false || !id) throw new Error(`fast2sms_send_failed:${payload?.message || response.status}`)
  return { providerMessageId: String(id), providerStatus: 'accepted', raw: { provider: 'fast2sms', requestId: id } }
}

export async function sendLifecycleMessage(access: ApiAccessContext, input: {
  workspaceId?: string
  channel: LifecycleChannel
  purpose: string
  subject: string
  provider?: 'resend' | 'whatsapp_cloud' | 'aisensy' | 'fast2sms'
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
  const admin = createSupabaseAdminClient()
  const requestedPayload = input.channel === 'email' ? input.email || {} : input.channel === 'whatsapp' ? input.whatsapp || {} : input.sms || {}

  if (!permission.allowed) {
    const { data: blockedJob, error: blockedError } = await admin.from('lifecycle_delivery_jobs').insert({
      tenant_id: target.tenantId,
      workspace_id: target.workspaceId,
      subject_key: permission.subjectKey,
      channel: input.channel,
      purpose: input.purpose.trim(),
      provider: declaredProvider(input.channel, input.provider),
      payload: requestedPayload,
      consent_event_id: permission.consentEvent?.consent_event_id || null,
      status: 'blocked',
      decision_reason: permission.reason,
      requested_by: access.subject,
    }).select('*').single()
    if (blockedError) throw new Error(`lifecycle_job_write_failed:${blockedError.message}`)
    return { sent: false, blocked: true, reason: permission.reason, job: blockedJob }
  }

  const capability = capabilityForChannel(input.channel)
  const providerResolution = await resolveRuntimeCapabilityProvider({
    ...capability,
    environment: 'production',
    preferredProviderKey: input.provider,
  })
  const provider = providerResolution.providerKey

  const { data: job, error: jobError } = await admin.from('lifecycle_delivery_jobs').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    subject_key: permission.subjectKey,
    channel: input.channel,
    purpose: input.purpose.trim(),
    provider,
    payload: requestedPayload,
    consent_event_id: permission.consentEvent?.consent_event_id || null,
    status: 'queued',
    decision_reason: permission.reason,
    requested_by: access.subject,
  }).select('*').single()
  if (jobError) throw new Error(`lifecycle_job_write_failed:${jobError.message}`)

  await admin.from('lifecycle_delivery_jobs').update({ status: 'sending', attempts: 1, last_attempt_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('delivery_job_id', job.delivery_job_id)
  try {
    let result: { providerMessageId: string; providerStatus: string; raw: Record<string, unknown> }
    if (input.channel === 'email') {
      if (provider !== 'resend') throw new Error(`lifecycle_provider_unsupported:${provider}`)
      if (!input.email?.subject?.trim() || (!input.email.html && !input.email.text)) throw new Error('email_payload_required')
      const unsubscribeToken = createUnsubscribeToken({
        tenantId: target.tenantId,
        workspaceId: target.workspaceId,
        subjectKey: permission.subjectKey,
        channel: 'email',
        purpose: input.purpose.trim(),
      })
      const unsubscribeUrl = `${siteUrl()}/api/public/privacy/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
      result = await sendEmail({
        to: permission.subjectKey,
        subject: input.email.subject.trim(),
        html: input.email.html,
        text: input.email.text,
        unsubscribeUrl,
        config: providerResolution.values,
      })
    } else if (input.channel === 'whatsapp') {
      if (!input.whatsapp?.templateName?.trim()) throw new Error('whatsapp_template_required')
      if (provider === 'whatsapp_cloud') {
        result = await sendWhatsAppCloud({
          to: permission.subjectKey,
          templateName: input.whatsapp.templateName.trim(),
          languageCode: input.whatsapp.languageCode,
          components: input.whatsapp.components,
          config: providerResolution.values,
        })
      } else if (provider === 'aisensy') {
        result = await sendAiSensy({
          to: permission.subjectKey,
          templateName: input.whatsapp.templateName.trim(),
          components: input.whatsapp.components,
          config: providerResolution.values,
        })
      } else {
        throw new Error(`lifecycle_provider_unsupported:${provider}`)
      }
    } else {
      if (provider !== 'fast2sms') throw new Error(`lifecycle_provider_unsupported:${provider}`)
      if (!input.sms?.message?.trim()) throw new Error('sms_payload_required')
      result = await sendSms({ to: permission.subjectKey, message: input.sms.message.trim(), config: providerResolution.values })
    }
    const { data: completed } = await admin.from('lifecycle_delivery_jobs').update({
      status: 'sent',
      provider_message_id: result.providerMessageId,
      provider_status: result.providerStatus,
      callback_metadata: result.raw,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('delivery_job_id', job.delivery_job_id).select('*').single()
    return { sent: true, blocked: false, provider, job: completed || job, providerMessageId: result.providerMessageId }
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
