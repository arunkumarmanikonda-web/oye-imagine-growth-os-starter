import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/marketplace/specialists',
  'Marketplace Specialists | Oye !magine',
  'Learn how Oye !magine governs specialist discovery, scoped assignments, proposals, approvals and delivery inside the Growth OS.'
)

const specialistHighlights = [
  {
    title: 'Scoped specialist discovery',
    body: 'Specialist availability is presented only when the relevant service lane and onboarding state are ready for customer use.'
  },
  {
    title: 'Governed assignment',
    body: 'Requests, proposals and workspace access are designed to stay inside the customer scope, with explicit permissions and approval boundaries.'
  },
  {
    title: 'Evidence-led delivery',
    body: 'Deliverables, approvals and commercial records are intended to remain traceable instead of turning specialist work into an off-platform handoff.'
  }
]

export default function MarketplaceSpecialistsPage() {
  return (
    <main className="public-premium">
      <section className="cms-institutional-hero">
        <div className="cms-institutional-hero-inner">
          <div>
            <p className="public-kicker">Specialist marketplace</p>
            <h1>Human expertise, scoped by the same governance as the Growth OS.</h1>
            <p className="cms-lead">Oye !magine is designed to route appropriate work to vetted specialists without exposing unrelated customer data or pretending that every service lane is automatically available. Specialist availability depends on onboarding, scope, commercial terms and assigned permissions.</p>
            <div className="public-actions"><Link href="/marketplace" className="public-btn-primary">Explore marketplace <span>↗</span></Link><Link href="/contact?interest=managed" className="public-btn-secondary">Discuss managed growth</Link></div>
          </div>
          <aside className="cms-hero-aside">
            <p className="public-kicker">Operating principle</p>
            <strong>Specialist capacity without a fragmented operating model.</strong>
            <p>Scope, authority, delivery state and evidence remain connected to the customer operating context.</p>
          </aside>
        </div>
      </section>

      <section className="public-section">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">How specialist delivery works</p><div><h2>Capability is useful only when the handoff remains accountable.</h2><p>The marketplace is designed around defined outcomes, explicit access boundaries and traceable delivery rather than an unstructured directory of providers.</p></div></div>
          <div className="public-card-grid">
            {specialistHighlights.map((item, index) => (
              <article className="public-card" key={item.title}>
                <span className="public-card-number">{String(index + 1).padStart(2, '0')} / SPECIALIST DELIVERY</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-final">
        <div className="public-wrap public-final-grid">
          <div><p className="public-kicker">Connect the capability to the operating system</p><h2>Start with the outcome, then define the specialist model around it.</h2></div>
          <div><p>Review the broader marketplace and platform, compare the commercial model, or share the business objective for a managed engagement.</p><div className="public-actions"><Link href="/platform" className="public-btn-primary">Review the platform <span>↗</span></Link><Link href="/pricing" className="public-btn-secondary">Commercial model</Link></div></div>
        </div>
      </section>
    </main>
  )
}
