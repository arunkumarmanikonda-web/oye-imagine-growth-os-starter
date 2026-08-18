import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getWorkspaceDisplayName } from '@/lib/admin/workspace-branding'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const workspaceDisplayName = getWorkspaceDisplayName()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 32_768
const RATE_WINDOW_SECONDS = 900

type RequestBody = {
  serviceId?: string
  serviceSlug?: string
  fullName?: string
  email?: string
  companyName?: string
  phone?: string
  website?: string
  budgetRange?: string
  brief?: string
  companyFax?: string
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidUrl(value: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function fingerprint(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function noStoreJson(payload: unknown, status: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  })
}

function rateLimited() {
  return noStoreJson(
    { ok: false, code: 'rate_limited' },
    429,
    { 'Retry-After': String(RATE_WINDOW_SECONDS) },
  )
}

function clientFingerprintParts(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const clientAddress =
    request.headers.get('x-real-ip')?.trim() ||
    forwardedFor?.split(',').at(-1)?.trim() ||
    'unknown'
  const userAgent = text(request.headers.get('user-agent'), 500) || 'unknown'
  return { clientAddress, userAgent }
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? '0')
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return noStoreJson({ ok: false, code: 'payload_too_large' }, 413)
    }

    const { clientAddress, userAgent } = clientFingerprintParts(request)
    const supabase = createSupabaseAdminClient()
    const networkFingerprint = fingerprint(`marketplace|network|${clientAddress}|${userAgent}`)

    const { data: networkAllowed, error: networkRateError } = await supabase.rpc(
      'claim_public_contact_rate_limit',
      {
        p_request_fingerprint: networkFingerprint,
        p_limit: 12,
        p_window_seconds: RATE_WINDOW_SECONDS,
      },
    )
    if (networkRateError) throw new Error('marketplace_rate_limit_unavailable')
    if (networkAllowed !== true) return rateLimited()

    let body: RequestBody | null
    try {
      body = (await request.json()) as RequestBody
    } catch {
      return noStoreJson({ ok: false, code: 'invalid_json' }, 400)
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return noStoreJson({ ok: false, code: 'invalid_request' }, 400)
    }

    // Honeypot. Real forms must leave this field empty.
    if (text(body.companyFax, 200)) {
      return noStoreJson({ ok: true }, 202)
    }

    const serviceId = text(body.serviceId, 100)
    const serviceSlug = text(body.serviceSlug, 120)
    const fullName = text(body.fullName, 160)
    const email = text(body.email, 320).toLowerCase()
    const companyName = text(body.companyName, 200)
    const phone = text(body.phone, 40)
    const website = text(body.website, 500)
    const budgetRange = text(body.budgetRange, 100)
    const brief = text(body.brief, 5000)

    if (!fullName || !email || brief.length < 10) {
      return noStoreJson({ ok: false, code: 'invalid_request' }, 400)
    }

    if (!isValidEmail(email)) {
      return noStoreJson({ ok: false, code: 'invalid_email' }, 400)
    }

    if (!isValidUrl(website)) {
      return noStoreJson({ ok: false, code: 'invalid_website' }, 400)
    }

    const identityFingerprint = fingerprint(
      `marketplace|identity|${clientAddress}|${userAgent}|${email}`,
    )
    const { data: identityAllowed, error: identityRateError } = await supabase.rpc(
      'claim_public_contact_rate_limit',
      {
        p_request_fingerprint: identityFingerprint,
        p_limit: 3,
        p_window_seconds: RATE_WINDOW_SECONDS,
      },
    )
    if (identityRateError) throw new Error('marketplace_rate_limit_unavailable')
    if (identityAllowed !== true) return rateLimited()

    let resolvedServiceId: string | null = null
    let resolvedServiceSlug: string | null = null

    if (serviceId || serviceSlug) {
      let lookup = supabase
        .from('marketplace_services')
        .select('id, slug')
        .eq('active', true)

      lookup = serviceId ? lookup.eq('id', serviceId) : lookup.eq('slug', serviceSlug)

      const { data: serviceRows, error: serviceError } = await lookup.limit(1)
      if (serviceError) throw new Error('marketplace_service_lookup_failed')

      const service = Array.isArray(serviceRows) && serviceRows.length > 0 ? serviceRows[0] : null
      if (!service) {
        return noStoreJson({ ok: false, code: 'service_not_found' }, 400)
      }

      resolvedServiceId = service.id
      resolvedServiceSlug = service.slug
    }

    const { data, error } = await supabase
      .from('marketplace_requests')
      .insert({
        service_id: resolvedServiceId,
        service_slug: resolvedServiceSlug,
        full_name: fullName,
        email,
        company_name: companyName || null,
        phone: phone || null,
        website: website || null,
        budget_range: budgetRange || null,
        brief,
        status: 'submitted',
        source: 'marketplace',
      })
      .select('id, status, created_at')
      .limit(1)

    if (error) throw new Error('marketplace_request_persist_failed')

    const row = Array.isArray(data) && data.length > 0 ? data[0] : null

    return noStoreJson(
      {
        ok: true,
        workspaceDisplayName,
        request: row,
        message: 'Marketplace request submitted.',
      },
      201,
    )
  } catch {
    return noStoreJson({ ok: false, code: 'marketplace_unavailable' }, 500)
  }
}
