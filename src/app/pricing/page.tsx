import Link from 'next/link'
import { formatInr, getPublishedPricingCatalog } from '@/lib/public/pricing-runtime'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata(
  '/pricing',
  'Pricing',
  'Simple India-first Oye !magine platform pricing for Starter, Growth, Commerce and Agency teams, with tailored Enterprise, Managed Growth and White Label options.',
)

function priceHeadline(plan: Awaited<ReturnType<typeof getPublishedPricingCatalog>>['plans'][number]) {
  if (plan.price_mode === 'custom') return 'Custom'
  const prefix = plan.price_mode === 'from' ? 'From ' : ''
  return `${prefix}${formatInr(plan.monthly_price_inr)}`
}

export default async function PricingPage() {
  const { plans, policy } = await getPublishedPricingCatalog()
  const policyItems = Object.values(policy.policy_copy ?? {}).filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))

  return (
    <main className="oi-page">
      <section className="oi-container">
        <header className="relative overflow-hidden rounded-[2.5rem] border-2 border-black bg-[var(--oye-paper)] p-7 shadow-[10px_10px_0_#111] md:p-12">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-2 border-black bg-[var(--oye-yellow)] md:h-72 md:w-72" aria-hidden="true" />
          <div className="absolute -bottom-14 right-24 h-32 w-32 rotate-12 rounded-[2.25rem] border-2 border-black bg-[var(--oye-pink)]" aria-hidden="true" />
          <div className="relative max-w-5xl">
            <p className="text-xs font-black uppercase tracking-[0.24em]">Oye !magine pricing</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.065em] text-black md:text-7xl">A serious growth operating system. Priced to start before you become enormous.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4d4841]">Start with the platform your team needs today. Add channels, specialist delivery, higher-scale infrastructure and deeper governance when the business actually needs them.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full border-2 border-black bg-black px-5 py-2.5 text-sm font-black text-white">Monthly or annual billing</span>
              <span className="rounded-full border-2 border-black bg-white px-5 py-2.5 text-sm font-black">{policy.annual_savings_label}</span>
              <span className="rounded-full border-2 border-black bg-[var(--oye-yellow)] px-5 py-2.5 text-sm font-black">{policy.tax_label}</span>
            </div>
          </div>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <article key={plan.plan_key} className={`relative flex min-h-full flex-col rounded-[2.25rem] border-2 border-black p-7 shadow-[7px_7px_0_#111] ${plan.featured ? 'bg-[var(--oye-yellow)]' : index % 3 === 2 ? 'bg-[var(--oye-pink)]' : 'bg-white'}`}>
              {plan.featured ? <span className="absolute right-5 top-5 rounded-full border-2 border-black bg-black px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">Most popular</span> : null}
              <p className="text-xs font-black uppercase tracking-[0.22em]">{String(index + 1).padStart(2, '0')} · {plan.support_tier}</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.055em]">{plan.display_name}</h2>
              <p className="mt-4 min-h-20 text-sm leading-7 text-[#39352f]">{plan.audience}</p>

              <div className="mt-6 border-y-2 border-black/15 py-5">
                <p className="text-4xl font-black tracking-[-0.05em]">{priceHeadline(plan)}</p>
                <p className="mt-1 text-sm font-bold text-black/60">{plan.price_mode === 'custom' ? 'Designed around your contracted scope' : 'per month · platform subscription'}</p>
                {plan.annual_price_inr !== null ? <p className="mt-3 text-sm"><strong>{formatInr(plan.annual_price_inr)}</strong> annually</p> : null}
                {plan.onboarding_fee_inr ? <p className="mt-1 text-xs font-bold text-black/55">One-time implementation from {formatInr(plan.onboarding_fee_inr)}</p> : null}
              </div>

              <ul className="mt-6 grid gap-2.5">
                {plan.highlights.map((item) => <li key={item} className="flex gap-3 rounded-xl border border-black/15 bg-white/45 px-4 py-3 text-sm font-bold"><span aria-hidden="true">✓</span><span>{item}</span></li>)}
              </ul>

              <div className="mt-auto pt-7">
                <Link href={plan.cta_href} className="flex w-full items-center justify-between rounded-full border-2 border-black bg-black px-5 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5">
                  <span>{plan.cta_label}</span><span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-[2.25rem] border-2 border-black bg-black p-8 text-white md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--oye-yellow)]">Know exactly what you are buying</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">The subscription runs the intelligence. Your media budget remains your money.</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/65">Oye !magine separates platform fees, media spend and any contracted pass-through services. AI may recommend spend, but money cannot silently move outside configured approvals and commercial limits.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-5"><strong>Platform subscription</strong><p className="mt-2 text-sm leading-6 text-white/55">Brand intelligence, workflows, AI, governance and the modules included in your edition.</p></div>
              <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-5"><strong>Media & external usage</strong><p className="mt-2 text-sm leading-6 text-white/55">Funded separately where used, traceable to the client and governed by approval limits.</p></div>
            </div>
          </article>

          <aside className="rounded-[2.25rem] border-2 border-black bg-[var(--oye-paper)] p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em]">Commercial policy</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em]">Clear before activation.</h2>
            <ul className="mt-6 grid gap-4">{policyItems.map((item) => <li key={item} className="border-b border-black/15 pb-4 text-sm leading-7 text-black/70">{item}</li>)}</ul>
          </aside>
        </section>

        <section className="mt-12 rounded-[2.5rem] border-2 border-black bg-[var(--oye-pink)] p-8 md:flex md:items-center md:justify-between md:gap-8 md:p-10">
          <div><p className="text-xs font-black uppercase tracking-[0.22em]">Not sure where to start?</p><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.05em]">Tell Oye what the business is trying to become. We will map the right operating model.</h2></div>
          <div className="mt-6 flex shrink-0 flex-wrap gap-3 md:mt-0"><Link href="/signup" className="rounded-full border-2 border-black bg-black px-6 py-3 font-black text-white">Create workspace</Link><Link href="/contact" className="rounded-full border-2 border-black bg-white px-6 py-3 font-black">Talk to us</Link></div>
        </section>
      </section>
    </main>
  )
}
