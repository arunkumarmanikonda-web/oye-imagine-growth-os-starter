import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const ALLOWED_INTERESTS = new Set([
  'general',
  'starter',
  'growth',
  'commerce',
  'agency',
  'enterprise',
  'managed',
  'white-label',
  'integrations',
  'security',
  'partner',
])

function clean(value: unknown, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function fingerprint(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function rateLimited() {
  return NextResponse.json(
    { ok: false, code: 'rate_limited' },
    { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '900' } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? '0')
    if (Number.isFinite(contentLength) && contentLength > 16_384) {
      return NextResponse.json(
        { ok: false, code: 'payload_too_large' },
        { status: 413, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { ok: false, code: 'invalid_json' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (clean(body.website, 200)) {
      return NextResponse.json({ ok: true }, { status: 202, headers: { 'Cache-Control': 'no-store' } })
    }

    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientAddress =
      request.headers.get('x-real-ip')?.trim() ||
      forwardedFor?.split(',').at(-1)?.trim() ||
      'unknown'
    const userAgent = clean(request.headers.get('user-agent'), 500) || 'unknown'
    const networkFingerprint = fingerprint(`network|${clientAddress}|${userAgent}`)
    const admin = createSupabaseAdminClient()

    const { data: networkAllowed, error: networkRateError } = await admin.rpc('claim_public_contact_rate_limit', {
      p_request_fingerprint: networkFingerprint,
      p_limit: 12,
      p_window_seconds: 900,
    })
    if (networkRateError) throw new Error(networkRateError.message)
    if (networkAllowed !== true) return rateLimited()

    const fullName = clean(body.fullName, 160)
    const companyName = clean(body.companyName, 200)
    const email = clean(body.email, 320).toLowerCase()
    const phone = clean(body.phone, 40)
    const requestedInterest = clean(body.interest, 80)
    const interest = ALLOWED_INTERESTS.has(requestedInterest) ? requestedInterest : 'general'
    const message = clean(body.message, 5000)
    const preferredLanguage = body.preferredLanguage === 'hi' ? 'hi' : 'en'
    const consentToContact = body.consentToContact === true

    if (!fullName || !validEmail(email) || message.length < 10 || !consentToContact) {
      return NextResponse.json(
        { ok: false, code: 'invalid_enquiry' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const identityFingerprint = fingerprint(`identity|${clientAddress}|${userAgent}|${email}`)
    const { data: identityAllowed, error: identityRateError } = await admin.rpc('claim_public_contact_rate_limit', {
      p_request_fingerprint: identityFingerprint,
      p_limit: 3,
      p_window_seconds: 900,
    })
    if (identityRateError) throw new Error(identityRateError.message)
    if (identityAllowed !== true) return rateLimited()

    const enquiryId = `enquiry_${crypto.randomUUID().replaceAll('-', '')}`
    const { error } = await admin.from('public_contact_enquiries').insert({
      enquiry_id: enquiryId,
      full_name: fullName,
      company_name: companyName || null,
      email,
      phone: phone || null,
      interest,
      message,
      preferred_language: preferredLanguage,
      consent_to_contact: true,
      source_path: clean(body.sourcePath, 500) || '/contact',
      source_context: { plan: clean(body.plan, 80) || null },
      request_fingerprint: identityFingerprint,
    })
    if (error) throw new Error(error.message)

    return NextResponse.json(
      { ok: true, enquiryId },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json(
      { ok: false, code: 'enquiry_unavailable' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
