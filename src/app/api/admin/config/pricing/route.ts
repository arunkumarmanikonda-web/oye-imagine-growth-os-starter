import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { listPricingControl, updatePublishedPlan } from '@/lib/commercial/public-pricing-admin'

function errorResponse(error: unknown) {
  if (error instanceof ApiAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: error.status })
  const message = error instanceof Error ? error.message : 'pricing_control_failed'
  return NextResponse.json({ ok: false, code: message.split(':')[0], message }, { status: 400 })
}

async function access() {
  return requireApiAccess({ lane: 'admin', permission: 'platform.config' })
}

export async function GET() {
  try {
    const verified = await access()
    return NextResponse.json({ ok: true, ...(await listPricingControl(verified)) }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await access()
    const body = await request.json()
    const result = await updatePublishedPlan({
      access: verified,
      planKey: String(body.planKey ?? ''),
      monthlyPriceInr: body.monthlyPriceInr,
      annualPriceInr: body.annualPriceInr,
      onboardingFeeInr: body.onboardingFeeInr,
      priceMode: body.priceMode === 'fixed' || body.priceMode === 'from' || body.priceMode === 'custom' ? body.priceMode : undefined,
      featured: typeof body.featured === 'boolean' ? body.featured : undefined,
      public: typeof body.public === 'boolean' ? body.public : undefined,
      status: body.status === 'draft' || body.status === 'published' || body.status === 'archived' ? body.status : undefined,
      ctaLabel: typeof body.ctaLabel === 'string' ? body.ctaLabel : undefined,
      ctaHref: typeof body.ctaHref === 'string' ? body.ctaHref : undefined,
      reason: String(body.reason ?? ''),
    })
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
