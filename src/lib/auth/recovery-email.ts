import 'server-only'

import crypto from 'node:crypto'
import { resolveRuntimeCapabilityProvider } from '@/lib/config-control/runtime-provider-config'

const RECOVERY_FROM = 'Oye !magine <hello@oyeimagine.com>'

function canonicalSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.oyeimagine.com'
  try {
    const url = new URL(configured)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'https://www.oyeimagine.com'
    return url.origin
  } catch {
    return 'https://www.oyeimagine.com'
  }
}

function canonicalRecoverySender(configured: string | undefined) {
  const normalized = String(configured || '').trim().toLowerCase()
  if (!normalized.includes('hello@oyeimagine.com')) {
    throw new Error('transactional_recovery_sender_not_canonical')
  }
  return RECOVERY_FROM
}

function recoveryEmailHtml(continueUrl: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f4ed;color:#11130f;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ed;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dedbd2">
          <tr><td style="padding:34px 38px 14px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#65685f">Oye !magine · Secure account recovery</td></tr>
          <tr><td style="padding:8px 38px 0;font-size:32px;line-height:1.15;font-weight:700">Reset your password</td></tr>
          <tr><td style="padding:18px 38px 0;font-size:16px;line-height:1.65;color:#4f534b">A password reset was requested for your Oye !magine account. Use the button below to continue securely.</td></tr>
          <tr><td style="padding:26px 38px"><a href="${continueUrl}" style="display:inline-block;background:#11130f;color:#ffffff;text-decoration:none;padding:14px 20px;font-weight:700">Continue password reset →</a></td></tr>
          <tr><td style="padding:0 38px 18px;font-size:14px;line-height:1.6;color:#65685f">For your protection, opening this email does not consume the recovery credential. The secure credential is verified only after you explicitly continue on oyeimagine.com.</td></tr>
          <tr><td style="padding:0 38px 34px;font-size:13px;line-height:1.6;color:#777b72">If you did not request this reset, you can ignore this email. No password will change unless the recovery flow is completed.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

function recoveryEmailText(continueUrl: string) {
  return [
    'Oye !magine secure account recovery',
    '',
    'A password reset was requested for your Oye !magine account.',
    'Continue securely using this link:',
    continueUrl,
    '',
    'Opening the email does not consume the recovery credential. It is verified only after you explicitly continue on oyeimagine.com.',
    '',
    'If you did not request this reset, ignore this email.',
  ].join('\n')
}

export async function sendPasswordRecoveryEmail(input: { email: string; tokenHash: string }) {
  const provider = await resolveRuntimeCapabilityProvider({
    capabilityKey: 'email.send',
    purpose: 'transactional',
    environment: 'production',
    preferredProviderKey: 'resend',
  })
  if (provider.providerKey !== 'resend') throw new Error('password_recovery_provider_must_be_resend')

  const apiKey = provider.values.RESEND_API_KEY?.trim()
  if (!apiKey) throw new Error('password_recovery_resend_api_key_missing')
  const from = canonicalRecoverySender(provider.values.RESEND_FROM_EMAIL)
  const continueUrl = `${canonicalSiteOrigin()}/auth/recovery?token_hash=${encodeURIComponent(input.tokenHash)}`
  const idempotencyKey = `oye-password-recovery-${crypto.createHash('sha256').update(input.tokenHash).digest('hex').slice(0, 40)}`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: 'Reset your Oye !magine password',
      html: recoveryEmailHtml(continueUrl),
      text: recoveryEmailText(continueUrl),
    }),
    cache: 'no-store',
  })

  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload?.id) {
    throw new Error(`password_recovery_resend_send_failed:${payload?.message || response.status}`)
  }

  return { provider: 'resend', providerMessageId: String(payload.id) }
}
