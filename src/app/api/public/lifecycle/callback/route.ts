import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { applyGuardedDeliveryCallback } from '@/lib/privacy/delivery-callback'
import { readBoundedJson } from '@/lib/security/bounded-json'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function authorized(request: NextRequest) {
  const expected = process.env.OYE_PROVIDER_CALLBACK_SECRET?.trim()
  if (!expected) return { configured: false, allowed: false }
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || ''
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return {
    configured: true,
    allowed: a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b),
  }
}

export async function POST(request: NextRequest) {
  const auth = authorized(request)
  if (!auth.allowed) {
    return noStore(
      { ok: false, code: auth.configured ? 'callback_unauthorized' : 'callback_not_configured' },
      auth.configured ? 401 : 503,
    )
  }

  try {
    const parsed = await readBoundedJson<Record<string, unknown>>(request, 32_768)
    if (!parsed.ok) {
      return noStore(
        { ok: false, code: parsed.code },
        parsed.code === 'payload_too_large' ? 413 : 400,
      )
    }

    const providerMessageId = String(parsed.value.providerMessageId || '').trim()
    const providerStatus = String(parsed.value.providerStatus || '').trim()
    if (!providerMessageId || !providerStatus) {
      return noStore({ ok: false, code: 'callback_fields_required' }, 400)
    }

    const metadata = parsed.value.metadata
    const safeMetadata = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? metadata as Record<string, unknown>
      : undefined

    const result = await applyGuardedDeliveryCallback({
      providerMessageId,
      providerStatus,
      metadata: safeMetadata,
    })

    return noStore({ ok: true, applied: result?.applied === true, job: result?.job || null })
  } catch (error) {
    const code = error instanceof Error ? error.message.split(':')[0] : 'callback_failed'
    const status = code === 'provider_status_invalid' || code === 'provider_message_id_required' ? 400 : 500
    return noStore({ ok: false, code }, status)
  }
}
