'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'

type Plan = {
  plan_key: string
  display_name: string
  price_mode: 'fixed' | 'from' | 'custom'
  monthly_price_inr: number | string | null
  annual_price_inr: number | string | null
  onboarding_fee_inr: number | string | null
  featured: boolean
  public: boolean
  status: 'draft' | 'published' | 'archived'
  version: number
  cta_label: string
  cta_href: string
}

type Policy = { tax_label?: string; annual_savings_label?: string; policy_copy?: Record<string, string> } | null

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } })
  const body = await response.json()
  if (!response.ok || !body.ok) throw new Error(body.message ?? body.code ?? 'Request failed')
  return body
}

export function PricingCatalogConsole() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [policy, setPolicy] = useState<Policy>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const body = await request('/api/admin/config/pricing')
      setPlans(body.plans ?? [])
      setPolicy(body.policy ?? null)
      setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pricing could not be loaded.') }
  }, [])
  useEffect(() => { void load() }, [load])

  async function save(event: FormEvent<HTMLFormElement>, planKey: string) {
    event.preventDefault(); setBusy(planKey); setError(null)
    const form = new FormData(event.currentTarget)
    try {
      await request('/api/admin/config/pricing', {
        method: 'PATCH',
        body: JSON.stringify({
          planKey,
          monthlyPriceInr: form.get('monthlyPriceInr'),
          annualPriceInr: form.get('annualPriceInr'),
          onboardingFeeInr: form.get('onboardingFeeInr'),
          priceMode: form.get('priceMode'),
          featured: form.get('featured') === 'on',
          public: form.get('public') === 'on',
          status: form.get('status'),
          ctaLabel: form.get('ctaLabel'),
          ctaHref: form.get('ctaHref'),
          reason: form.get('reason'),
        }),
      })
      await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pricing update failed.') }
    finally { setBusy(null) }
  }

  return (
    <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fdca5a]">Commercial catalogue</p><h2 className="mt-2 text-2xl font-semibold">Public plans and launch pricing</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">This is the pricing authority used by the public site. Every change creates a version record. Media spend and pass-through provider costs remain outside subscription fees unless contracted otherwise.</p></div><span className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300">{policy?.annual_savings_label ?? 'Annual pricing policy'}</span></div>
      {error ? <p className="mt-5 rounded-2xl bg-red-500/10 p-4 text-sm text-red-100">{error}</p> : null}
      <div className="mt-7 grid gap-5 xl:grid-cols-2">{plans.map((plan) => <form onSubmit={(event) => save(event, plan.plan_key)} key={plan.plan_key} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5"><div className="flex items-center justify-between gap-3"><div><small className="text-slate-500">{plan.plan_key}</small><h3 className="text-xl font-semibold">{plan.display_name}</h3></div><span className="rounded-full bg-white/5 px-3 py-1 text-xs">v{plan.version}</span></div><div className="mt-5 grid grid-cols-3 gap-3"><label className="text-xs text-slate-400">Monthly<input name="monthlyPriceInr" defaultValue={plan.monthly_price_inr ?? ''} inputMode="numeric" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white" /></label><label className="text-xs text-slate-400">Annual<input name="annualPriceInr" defaultValue={plan.annual_price_inr ?? ''} inputMode="numeric" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white" /></label><label className="text-xs text-slate-400">Onboarding<input name="onboardingFeeInr" defaultValue={plan.onboarding_fee_inr ?? ''} inputMode="numeric" className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white" /></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><select name="priceMode" defaultValue={plan.price_mode} className="rounded-xl bg-white/5 px-3 py-2"><option value="fixed">Fixed</option><option value="from">Starting from</option><option value="custom">Custom</option></select><select name="status" defaultValue={plan.status} className="rounded-xl bg-white/5 px-3 py-2"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><input name="ctaLabel" defaultValue={plan.cta_label} className="rounded-xl bg-white/5 px-3 py-2" /><input name="ctaHref" defaultValue={plan.cta_href} className="rounded-xl bg-white/5 px-3 py-2" /></div><div className="mt-4 flex gap-5 text-sm text-slate-300"><label><input type="checkbox" name="public" defaultChecked={plan.public} /> Public</label><label><input type="checkbox" name="featured" defaultChecked={plan.featured} /> Featured</label></div><input name="reason" required defaultValue="Super Admin pricing catalogue update." className="mt-4 w-full rounded-xl bg-white/5 px-3 py-2 text-sm" /><button disabled={busy === plan.plan_key} className="mt-4 rounded-full bg-[#fdca5a] px-5 py-2.5 text-sm font-semibold text-black">{busy === plan.plan_key ? 'Saving…' : 'Save & version'}</button></form>)}</div>
    </section>
  )
}
