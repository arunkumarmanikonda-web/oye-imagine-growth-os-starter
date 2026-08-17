import Link from 'next/link'
import { neejeePilot } from '@/lib/public/product-catalog'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/customers/neejee', 'Neejee Pilot', 'See the controlled Neejee commerce pilot architecture used to prove Oye !magine without fabricated healthcare or performance assumptions.')

export default function NeejeeCustomerPage() {
  return (
    <main className="public-premium">
      <section className="cms-institutional-hero">
        <div className="cms-institutional-hero-inner">
          <div>
            <p className="public-kicker">Controlled reference pilot</p>
            <h1>{neejeePilot.title}</h1>
            <p className="cms-lead">{neejeePilot.intro}</p>
            <div className="public-actions"><a href="https://neejee.com" className="public-btn-primary" rel="noreferrer">Visit Neejee <span>↗</span></a><Link href="/contact" className="public-btn-secondary">Discuss a pilot</Link></div>
          </div>
          <aside className="cms-hero-aside">
            <p className="public-kicker">Canonical business truth</p>
            <strong>A controlled pilot begins with what is actually true.</strong>
            <p>{neejeePilot.truths.join(' · ')}</p>
          </aside>
        </div>
      </section>

      <section className="public-section dark">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">The proving loop</p><div><h2>Evidence advances in stages. Claims do not run ahead of proof.</h2><p>The Neejee pilot is structured to move from business truth and governed configuration into connected execution only when each stage is genuinely evidenced.</p></div></div>
          <div className="public-proof">
            {neejeePilot.proofLoop.map((step,index)=><div key={step}><span>{String(index+1).padStart(2,'0')}</span><strong>{step}</strong><p>Each stage inherits the business context, approval boundaries and evidence produced before it.</p></div>)}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">What the pilot proves</p><div><h2>Correct context, private assets and honest execution state.</h2><p>The pilot is deliberately narrow enough to verify the operating model without inventing results from providers that are not yet connected.</p></div></div>
          <div className="public-card-grid">
            <article className="public-card"><span className="public-card-number">01 / TRUTH LAYER</span><h3>No healthcare or generic B2B funnel assumptions.</h3><p>Pilot strategy, landing, paid-search, lifecycle and execution defaults are regression-tested against the commerce and craft truth contract.</p></article>
            <article className="public-card"><span className="public-card-number">02 / PRIVATE CONTENT</span><h3>Neejee has its own private asset boundary.</h3><p>Source and generated assets remain separated from Oye !magine corporate assets, with versions, rights, provider provenance and approvals.</p></article>
            <article className="public-card"><span className="public-card-number">03 / EXECUTION TRUTH</span><h3>External performance is not fabricated.</h3><p>Provider connection, campaign IDs, spend, commerce results and closed-loop optimisation become proof only after the corresponding external systems are genuinely connected.</p></article>
          </div>
        </div>
      </section>

      <section className="public-final">
        <div className="public-wrap public-final-grid">
          <div><p className="public-kicker">Pilot disclosure</p><h2>A reference environment designed to prove the operating discipline.</h2></div>
          <div><p>{neejeePilot.disclosure}</p><div className="public-actions"><Link href="/contact" className="public-btn-primary">Discuss a controlled pilot <span>↗</span></Link><Link href="/customers" className="public-btn-secondary">Customer models</Link></div></div>
        </div>
      </section>
    </main>
  )
}
