import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

export default function SupportPage() {
  const experience = getLegalGovernanceExperience()

  return (
    <main className="public-premium">
      <section className="cms-institutional-hero">
        <div className="cms-institutional-hero-inner">
          <div>
            <p className="public-kicker">Support operations</p>
            <h1>Support with context, ownership and a clear route.</h1>
            <p className="cms-lead">Governed support routes for onboarding, legal questions, CMS publishing changes and accountable client coordination.</p>
          </div>
          <aside className="cms-hero-aside">
            <p className="public-kicker">Support principle</p>
            <strong>The right issue should reach the right operating owner.</strong>
            <p>Account, legal, publishing and customer coordination requests remain distinct so sensitive or consequential work is not handled through an ambiguous general queue.</p>
          </aside>
        </div>
      </section>

      <section className="public-section">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">Support channels</p><div><h2>Choose the route that matches the issue.</h2><p>Published response windows describe the intended support posture for each available channel.</p></div></div>
          <div className="cms-card-grid">
            {experience.supportChannels.map((channel, index) => (
              <article key={channel.label} className="cms-card">
                <small>{String(index + 1).padStart(2, '0')} · {channel.label}</small>
                <h3>{channel.value}</h3>
                <p>{channel.responseWindow}</p>
                <a href={channel.href}>Contact via {channel.label.toLowerCase()} →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-final">
        <div className="public-wrap public-final-grid">
          <div><p className="public-kicker">Publishing governance</p><h2>Public changes remain part of an accountable publishing process.</h2></div>
          <div><p>{experience.cmsPublicationNote}</p><p style={{marginTop:16}}>Legal entity: {experience.legalIdentity.legalName}</p><div className="public-actions"><a href="/contact" className="public-btn-primary">Contact Oye !magine <span>↗</span></a><a href="/status" className="public-btn-secondary">Service status</a></div></div>
        </div>
      </section>
    </main>
  )
}
