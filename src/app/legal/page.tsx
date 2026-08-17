import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

export default function LegalPage() {
  const experience = getLegalGovernanceExperience()
  const identity = experience.legalIdentity
  const disclosures = [
    ['Legal entity', identity.legalName],
    ['Brand', identity.brandName],
    ['CIN', identity.cin],
    ['PAN', identity.pan],
    ['TAN', identity.tan],
    ['GSTIN', identity.gstin],
    ['Support email', identity.supportEmail],
    ['Support phone', identity.supportPhone],
  ]

  return (
    <main className="public-premium">
      <section className="cms-institutional-hero">
        <div className="cms-institutional-hero-inner">
          <div>
            <p className="public-kicker">Legal identity</p>
            <h1>Company disclosures, stated plainly.</h1>
            <p className="cms-lead">Canonical company identity for Oye !magine AI Growth OS, published as a governed public trust surface.</p>
          </div>
          <aside className="cms-hero-aside">
            <p className="public-kicker">Operating entity</p>
            <strong>{identity.legalName}</strong>
            <p>{identity.principalAddress}</p>
          </aside>
        </div>
      </section>

      <section className="public-section">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">Corporate particulars</p><div><h2>The registered identity behind the Oye !magine brand.</h2><p>These details provide a single reference point for commercial, tax, support and company-identification purposes.</p></div></div>
          <div className="cms-card-grid">
            {disclosures.map(([label, value], index) => <article className="cms-card" key={label}><small>{String(index + 1).padStart(2, '0')} · {label}</small><h3>{value || 'Not published'}</h3></article>)}
          </div>
        </div>
      </section>

      <section className="public-final">
        <div className="public-wrap public-final-grid">
          <div><p className="public-kicker">Principal address</p><h2>{identity.principalAddress}</h2></div>
          <div><p>For privacy, contractual, procurement or support questions, use the relevant public policy or contact route so the request reaches the appropriate operating workflow.</p><div className="public-actions"><a href={`mailto:${identity.supportEmail}`} className="public-btn-primary">Email support <span>↗</span></a><a href="/contact" className="public-btn-secondary">Contact Oye !magine</a></div></div>
        </div>
      </section>
    </main>
  )
}
