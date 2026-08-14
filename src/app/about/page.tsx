import Link from 'next/link'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/about', 'About', 'Why Oye !magine is building one governed AI-assisted Growth Operating System across brand truth, strategy, creative, execution, analytics and commercial control.')

const principles = [
  ['Brand truth before generation', 'AI should know what is approved, current and source-backed before it creates anything customer-facing.'],
  ['Autonomy with visible guardrails', 'Approvals, budgets, permissions and evidence are product features, not paperwork added after the fact.'],
  ['One operating loop', 'Strategy, creative, execution, analytics and commercial controls should learn from the same business context.'],
  ['Human judgement stays valuable', 'Specialists, clients and operators work with AI, while high-impact decisions remain attributable and reviewable.'],
]

export default function AboutPage() {
  return (
    <main className="premium-page-shell">
      <section className="premium-about-hero">
        <div><p className="premium-eyebrow">About Oye !magine</p><h1>Marketing technology became a stack.<br />We are turning it back into a system.</h1><p>Oye !magine is being built as an AI-assisted Growth Operating System: one environment where a brand can move from understanding to strategy, creation, approval, execution, measurement and commercial control without losing context between tools.</p><div className="premium-hero-actions"><Link href="/signup" className="premium-primary-cta">Create your workspace</Link><Link href="/platform" className="premium-secondary-cta">Explore the platform</Link></div></div>
        <aside className="about-manifesto-card"><span>✦</span><p>Not another dashboard.<br />Not another prompt box.<br />A governed operating layer for growth.</p></aside>
      </section>

      <section className="premium-stat-band">
        <div><strong>1</strong><span>brand truth</span></div><div><strong>1</strong><span>identity layer</span></div><div><strong>1</strong><span>growth loop</span></div><div><strong>∞</strong><span>specialist workflows</span></div>
      </section>

      <section className="premium-section-block"><div className="premium-section-intro"><p className="premium-eyebrow">What we believe</p><h2>Intelligence becomes useful when the system knows what it may do next.</h2></div><div className="principle-grid">{principles.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

      <section className="premium-origin-block"><div><p className="premium-eyebrow">Built for real operators</p><h2>The product is designed around the work between the tools.</h2><p>Briefs become campaigns. Campaigns create assets. Assets need approvals. Providers return evidence. Evidence changes recommendations. Spend needs reconciliation. Clients need a comprehensible view. Oye !magine is designed around those transitions.</p></div><div className="origin-loop">{['Understand','Imagine','Create','Approve','Launch','Learn','Grow'].map((step, index) => <span key={step} className={index % 2 ? 'pink' : 'yellow'}>{step}</span>)}</div></section>

      <section className="premium-cta-panel"><div><p className="premium-eyebrow">Ready when your brand is</p><h2>Bring the business. Oye builds the operating context around it.</h2></div><Link href="/contact" className="premium-primary-cta">Talk to Oye !magine</Link></section>
    </main>
  )
}
