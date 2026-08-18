import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { resolveRuntimeProviderFields } from '@/lib/config-control/runtime-provider-config'
import { applyGuardedDeliveryCallback } from '@/lib/privacy/delivery-callback'
import { readBoundedBody } from '@/lib/security/bounded-json'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_WEBHOOK_BYTES = 262_144

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function timingSafeStringEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right)
}

async function webhookConfig() {
  const resolution = await resolveRuntimeProviderFields({
    providerKey: 'meta_marketing',
    fieldKeys: ['META_APP_SECRET', 'WHATSAPP_WEBHOOK_VERIFY_TOKEN'],
    environment: 'production',
  })
  return {
    appSecret: process.env.WHATSAPP_CLOUD_APP_SECRET?.trim() || resolution.values.META_APP_SECRET || '',
    verifyToken: resolution.values.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
  }
}

function signatureValid(rawBody: Uint8Array, supplied: string, secret: string) {
  const match = /^sha256=([a-f0-9]{64})$/i.exec(supplied.trim())
  if (!match || !secret) return false
  const expectedHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const expected = Buffer.from(expectedHex, 'hex')
  const actual = Buffer.from(match[1], 'hex')
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

function statusEvents(payload: unknown) {
  const events: Array<{
    providerMessageId: string
    providerStatus: string
    metadata: Record<string, unknown>
  }> = []

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return events
  const root = payload as Record<string, unknown>
  if (root.object !== 'whatsapp_business_account' || !Array.isArray(root.entry)) return events

  for (const entry of root.entry.slice(0, 50)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const changes = (entry as Record<string, unknown>).changes
    if (!Array.isArray(changes)) continue

    for (const change of changes.slice(0, 50)) {
      if (!change || typeof change !== 'object' || Array.isArray(change)) continue
      const value = (change as Record<string, unknown>).value
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      const statuses = (value as Record<string, unknown>).statuses
      if (!Array.isArray(statuses)) continue

      for (const status of statuses.slice(0, 100)) {
        if (!status || typeof status !== 'object' || Array.isArray(status)) continue
        const row = status as Record<string, unknown>
        const providerMessageId = typeof row.id === 'string' ? row.id.trim() : ''
        const providerStatus = typeof row.status === 'string' ? row.status.trim() : ''
        if (!providerMessageId || !providerStatus) continue

        const errors = Array.isArray(row.errors)
          ? row.errors.slice(0, 5).map((error) => {
              if (!error || typeof error !== 'object' || Array.isArray(error)) return null
              const item = error as Record<string, unknown>
              return {
                code: typeof item.code === 'number' || typeof item.code === 'string' ? item.code : null,
                title: typeof item.title === 'string' ? item.title.slice(0, 160) : null,
              }
            }).filter(Boolean)
          : []

        events.push({
          providerMessageId,
          providerStatus,
          metadata: {
            provider: 'whatsapp_cloud',
            timestamp: typeof row.timestamp === 'string' ? row.timestamp.slice(0, 40) : null,
            errors,
          },
        })
      }
    }
  }

  return events.slice(0, 200)
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode') || ''
  const suppliedToken = request.nextUrl.searchParams.get('hub.verify_token') || ''
  const challenge = request.nextUrl.searchParams.get('hub.challenge') || ''
  const { verifyToken } = await webhookConfig()

  if (
    mode !== 'subscribe' ||
    !challenge ||
    !verifyToken ||
    !timingSafeStringEqual(suppliedToken, verifyToken)
  ) {
    return noStore({ ok: false, code: 'verification_failed' }, 403)
  }

  return new Response(challenge, {
    status: 200,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { appSecret } = await webhookConfig()
    if (!appSecret) return noStore({ ok: false, code: 'webhook_unavailable' }, 503)

    const rawBody = await readBoundedBody(request, MAX_WEBHOOK_BYTES)
    if (!rawBody.ok) {
      return noStore(
        { ok: false, code: rawBody.code },
        rawBody.code === 'payload_too_large' ? 413 : 400,
      )
    }

    const signature = request.headers.get('x-hub-signature-256') || ''
    if (!signatureValid(rawBody.bytes, signature, appSecret)) {
      return noStore({ ok: false, code: 'signature_invalid' }, 401)
    }

    let payload: unknown
    try {
      payload = JSON.parse(new TextDecoder().decode(rawBody.bytes))
    } catch {
      return noStore({ ok: false, code: 'invalid_json' }, 400)
    }

    const events = statusEvents(payload)
    let applied = 0
    for (const event of events) {
      const result = await applyGuardedDeliveryCallback(event)
      if (result?.applied === true) applied += 1
    }

    return noStore({ ok: true, received: events.length, applied })
  } catch {
    return noStore({ ok: false, code: 'webhook_processing_failed' }, 500)
  }
}
