import type { CSSProperties } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { getPublicHomepageExperience } from '../lib/recovery/public-premium-experience'
import { formatInr, getPublishedPricingCatalog, type PublicPlan } from '@/lib/public/pricing-runtime'

const storyItems = [
  ['Brand','Truth'],
  ['Strategy','Plan'],
  ['Creative','Studio'],
  ['Content','SEO'],
  ['Campaigns','Launch'],
  ['Analytics','Learn'],
  ['Commercial','Control'],
]

function planPrice(plan: PublicPlan) {
  if (plan.price_mode === 'custom') return 'Custom'
  const amount = formatInr(plan.monthly_price_inr)
  return plan.price_mode === 'from' ? `From ${amount}` : amount
}

export default async function HomePage() {
  const experience = getPublicHomepageExperience()
  let launchPlans: PublicPlan[] = []
  let annualSavingsLabel = 'Annual plans available'

  try {
    const pricing = await getPublishedPricingCatalog()
    launchPlans = pricing.plans.filter((plan) => ['starter', 'growth', 'commerce'].includes(plan.plan_key)).slice(0, 3)
    annualSavingsLabel = pricing.policy.annual_savings_label
  } catch {
    // Public marketing must remain available even when the commercial data plane is temporarily unavailable.
  }

  const starter = launchPlans.find((plan) => plan.plan_key === 'starter')
  const priceSignal = starter?.monthly_price_inr ? ` · From ${formatInr(starter.monthly_price_inr)}/month` : ''

  return (
    <main className="premium-home">
      <section className="social-hero-shell">
        <div className="social-hero-copy">
          <p className="premium-eyebrow">AI Growth Operating System{priceSignal}</p>
          <h1>Plan, create, launch and learn.<br /><span>One system for the whole growth operation.</span></h1>
          <p>{experience.hero.body}</p>
          <div className="premium-hero-actions"><Link href="/signup" className="premium-primary-cta">Start your workspace</Link><Link href="/pricing" className="premium-secondary-cta">See plans & pricing</Link></div>
          <div className="social-proof-line"><span className="proof-avatars"><i>BR</i><i>CR</i><i>GR</i><i>DA</i></span><p><strong>One operating context.</strong> Brand truth, strategy, creative, channels, analytics and approvals working from the same evidence.</p></div>
        </div>

        <div className="product-stage" aria-label="Oye !magine product experience illustration">
          <div className="product-window">
            <header><span className="mini-logo"><img src="/brand/oye-imagine-logo.webp" alt="" /></span><div className="mini-search">⌕ Ask Oye what the brand should do next</div><span className="mini-avatar">OI</span></header>
            <div className="product-body">
              <aside className="product-mini-rail"><span className="active">✦</span><span>◎</span><span>◐</span><span>↗</span><span>⌘</span><span>≋</span></aside>
              <section className="product-feed">
                <div className="product-greeting"><div><small>Growth workspace</small><h2>What should the brand do next?</h2></div><button>＋ Create</button></div>
                <div className="product-stories">{storyItems.map(([a,b],i)=><div key={a}><span className={i%2?'pink':'yellow'}><i /></span><strong>{a}</strong><small>{b}</small></div>)}</div>
                <article className="product-post feature"><div className="post-head"><span className="post-avatar">✺</span><div><strong>Oye intelligence</strong><small>Grounded in approved brand truth</small></div><b>•••</b></div><h3>Turn the business goal into one coordinated growth plan.</h3><p>Research the context, challenge weak assumptions, create the work, route approvals and connect execution back to measurable evidence.</p><div className="post-tags"><span>Strategy</span><span>Creative</span><span>Search</span><span>Campaigns</span></div><div className="post-actions"><button>Review plan</button><button>Open evidence</button></div></article>
                <div className="product-two-col"><article className="product-mini-card yellow"><small>Approval state</small><strong>Review</strong><span>Human decision required</span></article><article className="product-mini-card pink"><small>Evidence state</small><strong>Verified</strong><span>Only connected data is treated as live</span></article></div>
              </section>
              <aside className="product-right-rail"><small>Workspace</small><h3>Growth pulse</h3><div className="pulse-ring"><strong>LIVE</strong><span>context</span></div><div className="pulse-row"><span>Brand truth</span><b>Current</b></div><div className="pulse-row"><span>Approvals</span><b>Governed</b></div><div className="pulse-row"><span>Sources</span><b>Verified</b></div><button>View full report</button></aside>
            </div>
          </div>
          <p className="product-proof-note">Illustrative product surface. External activity is described as live only after provider-side verification.</p>
        </div>
      </section>

      <section className="home-story-strip"><div className="home-story-inner">{storyItems.map(([label,sub],index)=><Link href={index===2?'/platform':'/solutions'} key={label}><span className={`story-orb ${index%3===0?'yellow':index%3===1?'pink':'ink'}`}><i>{index===6?'✺':'✦'}</i></span><strong>{label}</strong><small>{sub}</small></Link>)}</div></section>

      <section className="premium-section-block home-system-section"><div className="premium-section-intro"><p className="premium-eyebrow">What Oye !magine does</p><h2>Start with the business. Oye turns context into a governed growth loop.</h2><p>Bring your website, catalogue, brand assets, goals, audiences and constraints. Oye helps organise the truth, research the market, build strategy, generate work, route approvals, operate connected channels and learn from verified outcomes.</p></div><div className="growth-loop-premium">{experience.growthLoop.map((step,index)=><div key={step}><span>{String(index+1).padStart(2,'0')}</span><strong>{step}</strong>{index<experience.growthLoop.length-1?<b>→</b>:null}</div>)}</div></section>

      <section className="home-capability-grid">{experience.sections.map((section,index)=><article key={section.id} className={index===0?'yellow':index===1?'pink':'paper'}><small>{section.eyebrow}</small><h3>{section.title}</h3><p>{section.body}</p><ul>{section.bullets.slice(0,4).map((bullet)=><li key={bullet}>{bullet}</li>)}</ul><Link href="/platform">Explore capability <span>→</span></Link></article>)}</section>

      <section className="premium-section-block">
        <div className="premium-section-intro">
          <p className="premium-eyebrow">Plans & pricing</p>
          <h2>Start with the operating system you need now. Add depth as the business grows.</h2>
          <p>Platform subscription and media spend are kept separate. AI usage follows the plan fair-use policy, and high-impact spend or publishing remains approval-bound.</p>
        </div>
        {launchPlans.length ? <div className="mt-8 grid gap-5 lg:grid-cols-3">{launchPlans.map((plan) => <article key={plan.plan_key} className={`flex min-h-full flex-col rounded-[2rem] border-2 border-black p-6 shadow-[6px_6px_0_#111] ${plan.featured ? 'bg-[var(--oye-yellow)]' : 'bg-white'}`}>
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em]">{plan.support_tier}</p><h3 className="mt-2 text-3xl font-black tracking-[-0.04em]">{plan.display_name}</h3></div>{plan.featured ? <span className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">Most popular</span> : null}</div>
          <p className="mt-4 text-sm leading-7 text-black/65">{plan.audience}</p>
          <div className="mt-5 border-y-2 border-black/15 py-4"><p className="text-3xl font-black tracking-[-0.04em]">{planPrice(plan)}</p><p className="mt-1 text-xs font-bold text-black/55">per month · GST extra as applicable</p></div>
          <ul className="mt-5 grid gap-2">{plan.highlights.slice(0, 4).map((item) => <li key={item} className="text-sm font-bold">✓ {item}</li>)}</ul>
          <Link href={plan.cta_href as Route} className="mt-auto pt-6 text-sm font-black">{plan.cta_label} →</Link>
        </article>)}</div> : <div className="mt-8 rounded-[2rem] border-2 border-black bg-white p-6"><p className="font-black">Pricing is temporarily unavailable here.</p><Link href="/pricing" className="mt-2 inline-flex font-black">Open the pricing page →</Link></div>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border-2 border-black bg-[var(--oye-paper)] px-5 py-4"><p className="text-sm font-bold">{annualSavingsLabel} · Media spend and contracted pass-through charges are separate.</p><Link href="/pricing" className="rounded-full border-2 border-black bg-black px-5 py-2.5 text-sm font-black text-white">Compare all 7 editions</Link></div>
      </section>

      <section className="home-persona-section"><div className="persona-copy"><p className="premium-eyebrow">One identity layer. Precise access.</p><h2>Every person sees the work they are responsible for, and Super Admin can narrow or extend access line by line.</h2><p>Marketers, designers, approvers, analysts, partners, clients and administrators can use role defaults while explicit user-level allow or deny rules take precedence.</p><Link href="/trust" className="premium-secondary-cta">See trust & governance</Link></div><div className="persona-stack">{['Super Admin','Digital Marketer','Designer','Account Manager','Finance Approver','Partner','Client Admin','Viewer'].map((role,index)=><div key={role} style={{'--i':index} as CSSProperties}><span>{role.split(' ').map(x=>x[0]).join('').slice(0,2)}</span><strong>{role}</strong><small>{index<4?'Create & operate':'Review & govern'}</small></div>)}</div></section>

      <section className="premium-cta-panel home-final-cta"><div><p className="premium-eyebrow">What happens after signup?</p><h2>Create the workspace, establish brand truth, choose the operating scope and activate only the capabilities you are ready to use.</h2><p>Oye keeps strategy, creative, execution, approvals, evidence and commercial boundaries connected from the beginning.</p></div><div className="premium-hero-actions"><Link href="/signup" className="premium-primary-cta">Create customer workspace</Link><Link href="/contact" className="premium-secondary-cta">Talk to Oye</Link></div></section>
    </main>
  )
}