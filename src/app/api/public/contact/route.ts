import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function clean(value: unknown, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}
function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (clean(body.website, 200)) return NextResponse.json({ ok: true }, { status: 202 })

    const fullName = clean(body.fullName, 160)
    const companyName = clean(body.companyName, 200)
    const email = clean(body.email, 320).toLowerCase()
    const phone = clean(body.phone, 40)
    const interest = clean(body.interest, 80) || 'general'
    const message = clean(body.message, 5000)
    const preferredLanguage = body.preferredLanguage === 'hi' ? 'hi' : 'en'
    const consentToContact = body.consentToContact === true

    if (!fullName || !validEmail(email) || message.length < 10 || !consentToContact) {
      return NextResponse.json({ ok: false, code: 'invalid_enquiry' }, { status: 400 })
    }

    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
    const userAgent = request.headers.get('user-agent') ?? ''
    const fingerprint = crypto.createHash('sha256').update(`${forwarded}|${userAgent}|${email}|${new Date().toISOString().slice(0, 10)}`).digest('hex')
    const admin = createSupabaseAdminClient()

    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { count } = await admin.from('public_contact_enquiries').select('*', { count: 'exact', head: true }).eq('request_fingerprint', fingerprint).gte('created_at', since)
    if ((count ?? 0) >= 3) return NextResponse.json({ ok: false, code: 'rate_limited' }, { status: 429 })

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
      request_fingerprint: fingerprint,
    })
    if (error) throw new Error(error.message)

    return NextResponse.json({ ok: true, enquiryId }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ ok: false, code: 'enquiry_unavailable' }, { status: 500 })
  }
}
