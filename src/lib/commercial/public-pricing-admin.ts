import 'server-only'

import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function assertPlatformOwner(access: ApiAccessContext) {
  if (access.membership.role_key !== 'platform_owner' || access.assuranceLevel !== 'aal2') {
    throw new Error('platform_owner_aal2_required')
  }
}

export async function listPricingControl(access: ApiAccessContext) {
  assertPlatformOwner(access)
  const admin = createSupabaseAdminClient()
  const [{ data: plans, error: planError }, { data: policy, error: policyError }] = await Promise.all([
    admin.from('commercial_public_plan_catalog').select('*').order('sort_order'),
    admin.from('commercial_public_pricing_policy').select('*').eq('policy_key', 'public_launch').maybeSingle(),
  ])
  if (planError) throw new Error(`pricing_read_failed:${planError.message}`)
  if (policyError) throw new Error(`pricing_policy_read_failed:${policyError.message}`)
  return { plans: plans ?? [], policy: policy ?? null }
}

function finiteNumber(value: unknown, field: string) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) throw new Error(`invalid_${field}`)
  return number
}

export async function updatePublishedPlan(input: {
  access: ApiAccessContext
  planKey: string
  monthlyPriceInr?: unknown
  annualPriceInr?: unknown
  onboardingFeeInr?: unknown
  priceMode?: 'fixed' | 'from' | 'custom'
  featured?: boolean
  public?: boolean
  status?: 'draft' | 'published' | 'archived'
  ctaLabel?: string
  ctaHref?: string
  reason: string
}) {
  assertPlatformOwner(input.access)
  if (!input.reason.trim()) throw new Error('change_reason_required')
  const admin = createSupabaseAdminClient()
  const { data: before, error: readError } = await admin.from('commercial_public_plan_catalog').select('*').eq('plan_key', input.planKey).maybeSingle()
  if (readError || !before) throw new Error('pricing_plan_not_found')

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString(), version: Number(before.version ?? 1) + 1 }
  if (input.monthlyPriceInr !== undefined) patch.monthly_price_inr = finiteNumber(input.monthlyPriceInr, 'monthly_price')
  if (input.annualPriceInr !== undefined) patch.annual_price_inr = finiteNumber(input.annualPriceInr, 'annual_price')
  if (input.onboardingFeeInr !== undefined) patch.onboarding_fee_inr = finiteNumber(input.onboardingFeeInr, 'onboarding_fee')
  if (input.priceMode) patch.price_mode = input.priceMode
  if (typeof input.featured === 'boolean') patch.featured = input.featured
  if (typeof input.public === 'boolean') patch.public = input.public
  if (input.status) patch.status = input.status
  if (input.ctaLabel?.trim()) patch.cta_label = input.ctaLabel.trim()
  if (input.ctaHref?.trim()) patch.cta_href = input.ctaHref.trim()

  const { data: after, error } = await admin.from('commercial_public_plan_catalog').update(patch).eq('plan_key', input.planKey).select('*').single()
  if (error) throw new Error(`pricing_plan_update_failed:${error.message}`)

  const { error: versionError } = await admin.from('commercial_public_pricing_versions').insert({
    entity_type: 'plan',
    entity_key: input.planKey,
    version: after.version,
    snapshot: after,
    change_reason: input.reason.trim(),
    actor_user_id: input.access.subject,
  })
  if (versionError) throw new Error(`pricing_version_write_failed:${versionError.message}`)
  return after
}
