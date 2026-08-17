import Link from 'next/link'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata(
  '/status',
  'Service Status | Oye !magine',
  'Service-status and incident communication information for Oye !magine public and authenticated product surfaces.'
)

const services = [
  ['Public website', 'Operational', 'Public marketing, pricing, contact and trust surfaces'],
  ['Authentication', 'Operational', 'Customer and operator sign-in through the configured identity service'],
  ['Growth OS application', 'Operational', 'Authenticated workspace and governed operating surfaces'],
  ['External providers', 'Tenant dependent', 'Availability depends on each tenant’s configured and verified provider connections'],
]

export default function StatusPage() {
  return (
    <main className="public-premium">
      <section className="cms-institutional-hero">
        <div className="cms-institutional-hero-inner">
          <div>
            <p className="public-kicker">Service operations</p>
            <h1>Oye !magine service status.</h1>
            <p className="cms-lead">This page communicates the operating posture of the core Oye !magine service. External advertising, analytics, messaging, payment and other providers remain subject to their own availability and to each tenant’s verified connection state.</p>
            <p className="policy-date">Last reviewed: 15 August 2026</p>
          </div>
          <aside className="cms-hero-aside">
            <p className="public-kicker">Status principle</p>
            <strong>Provider availability and Oye platform status are not the same thing.</strong>
            <p>A connected service is represented conservatively. Tenant-dependent external availability is not presented as an unconditional platform promise.</p>
          </aside>
        </div>
      </section>

      <section className="public-section">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">Current posture</p><div><h2>Core service areas and their present operating state.</h2><p>Status is stated at the service layer. Individual tenant integrations may differ because provider credentials, account permissions and external service health are customer-specific.</p></div></div>
          <div className="status-grid">
            {services.map(([name, state, description], index) => (
              <article className="status-row" key={name}>
                <span className="status-index">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{name}</h3><p>{description}</p></div>
                <strong className="status-state">{state}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-final">
        <div className="public-wrap public-final-grid">
          <div><p className="public-kicker">Incident communication</p><h2>Material customer impact should be communicated through the appropriate operating channel.</h2></div>
          <div><p>Security-sensitive matters may follow a restricted disclosure path while investigation is active. For trust posture or an issue affecting your environment, use the routes below.</p><div className="public-actions"><Link href="/trust" className="public-btn-primary">Trust & governance <span>↗</span></Link><Link href="/contact" className="public-btn-secondary">Report an issue</Link></div></div>
        </div>
      </section>
    </main>
  )
}
