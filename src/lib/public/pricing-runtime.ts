import 'server-only'

import { unstable_noStore as noStore } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type PublicPlan = {
  plan_key: string
  sort_order: number
  display_name: string
  audience: string
  price_mode: 'fixed' | 'from' | 'custom'
  monthly_price_inr: number | null
  annual_price_inr: number | null
  onboarding_fee_inr: number | null
  annual_label: string | null
  highlights: string[]
  included_modules: string[]
  usage_allowances: Record<string, unknown>
  support_tier: string
  cta_label: string
  cta_href: string
  featured: boolean
  metadata: Record<string, unknown>
}

export type PublicPricingPolicy = {
  currency_code: string
  currency_symbol: string
  tax_label: string
  annual_savings_label: string
  media_spend_included: boolean
  provider_pass_through_included: boolean
  ai_fair_use_included: boolean
  policy_copy: Record<string, string>
}

export async function getPublishedPricingCatalog() {
  noStore()
  const admin = createSupabaseAdminClient()
  const [{ data: plans, error: planError }, { data: policy, error: policyError }] = await Promise.all([
    admin
      .from('commercial_public_plan_catalog')
      .select('plan_key,sort_order,display_name,audience,price_mode,monthly_price_inr,annual_price_inr,onboarding_fee_inr,annual_label,highlights,included_modules,usage_allowances,support_tier,cta_label,cta_href,featured,metadata')
      .eq('status', 'published')
      .eq('public', true)
      .order('sort_order'),
    admin
      .from('commercial_public_pricing_policy')
      .select('currency_code,currency_symbol,tax_label,annual_savings_label,media_spend_included,provider_pass_through_included,ai_fair_use_included,policy_copy')
      .eq('policy_key', 'public_launch')
      .eq('status', 'published')
      .maybeSingle(),
  ])

  if (planError) throw new Error(`public_pricing_unavailable:${planError.message}`)
  if (policyError || !policy) throw new Error(`public_pricing_policy_unavailable:${policyError?.message ?? 'missing'}`)

  return {
    plans: (plans ?? []).map((plan: any) => ({
      ...plan,
      monthly_price_inr: plan.monthly_price_inr === null ? null : Number(plan.monthly_price_inr),
      annual_price_inr: plan.annual_price_inr === null ? null : Number(plan.annual_price_inr),
      onboarding_fee_inr: plan.onboarding_fee_inr === null ? null : Number(plan.onboarding_fee_inr),
      highlights: Array.isArray(plan.highlights) ? plan.highlights : [],
      included_modules: Array.isArray(plan.included_modules) ? plan.included_modules : [],
      usage_allowances: plan.usage_allowances && typeof plan.usage_allowances === 'object' ? plan.usage_allowances : {},
      metadata: plan.metadata && typeof plan.metadata === 'object' ? plan.metadata : {},
    })) as PublicPlan[],
    policy: {
      ...policy,
      policy_copy: policy.policy_copy && typeof policy.policy_copy === 'object' ? policy.policy_copy : {},
    } as PublicPricingPolicy,
  }
}

export function formatInr(value: number | null) {
  if (value === null) return 'Custom'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}
