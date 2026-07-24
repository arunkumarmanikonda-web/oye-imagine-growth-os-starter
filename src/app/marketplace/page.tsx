import Link from "next/link";

const specialists = [
  {
    name: "Launch Strategist",
    focus: "Narrative, positioning, launch sequencing",
    availability: "Available this week",
  },
  {
    name: "Performance Operator",
    focus: "Demand capture, funnel repair, paid efficiency",
    availability: "2 open slots",
  },
  {
    name: "Conversion Designer",
    focus: "Landing surfaces, offer framing, CRO systems",
    availability: "Booking next sprint",
  },
];

export default function MarketplacePage() {
  return (
    <div className="oi-page">
      <div className="oi-container">
        <div className="oi-page-head">
          <span className="oi-kicker">Marketplace</span>
        </div>

        <section className="oi-hero">
          <div className="oi-panel">
            <h1 className="oi-display">Submit a better brief. Get a sharper delivery path.</h1>
            <p className="oi-lead">
              The marketplace should feel guided, premium, and credible. This version improves
              the intake rhythm, specialist presentation, and handoff structure without forcing
              the user through a noisy interface.
            </p>

            <div className="oi-chip-row">
              <span className="oi-chip">Brief-led intake</span>
              <span className="oi-chip">Specialist matching</span>
              <span className="oi-chip">Proposal-ready routing</span>
            </div>
          </div>

          <div className="oi-panel-dark">
            <span className="oi-kicker">Delivery posture</span>
            <h2 className="oi-display oi-display-inverse">Structured enough to trust. Light enough to move.</h2>
            <p className="oi-lead oi-lead-inverse">
              Instead of a crowded dashboard feel, the marketplace now reads like a guided product flow:
              understand the request, frame scope, route to the right operator, then move into proposal.
            </p>
          </div>
        </section>

        <section className="oi-section">
          <div className="oi-stat-grid">
            <div className="oi-stat-card">
              <p className="oi-stat-label">Intake quality</p>
              <p className="oi-stat-value">Higher</p>
              <p className="oi-stat-copy">Prompt the buyer for goals, constraints, and outcomes instead of a vague one-line ask.</p>
            </div>
            <div className="oi-stat-card">
              <p className="oi-stat-label">Routing clarity</p>
              <p className="oi-stat-value">Tighter</p>
              <p className="oi-stat-copy">Position the right specialist profile beside the request flow.</p>
            </div>
            <div className="oi-stat-card">
              <p className="oi-stat-label">Product feel</p>
              <p className="oi-stat-value">Sharper</p>
              <p className="oi-stat-copy">Cleaner hierarchy, more breathing room, less visual clutter.</p>
            </div>
          </div>
        </section>

        <section className="oi-section">
          <div className="oi-grid-2">
            <article className="oi-panel">
              <div className="oi-section-header">
                <h2 className="oi-section-title">Project brief</h2>
                <p className="oi-section-copy">
                  Capture enough context to produce quality proposals and reduce clarification loops.
                </p>
              </div>

              <div className="oi-form-shell">
                <div className="oi-field">
                  <label className="oi-label" htmlFor="project-name">Project name</label>
                  <input id="project-name" className="oi-input" placeholder="Q4 acquisition reset" />
                </div>

                <div className="oi-field">
                  <label className="oi-label" htmlFor="project-goal">Primary outcome</label>
                  <input id="project-goal" className="oi-input" placeholder="Increase qualified pipeline and improve conversion" />
                </div>

                <div className="oi-field">
                  <label className="oi-label" htmlFor="project-brief">Brief</label>
                  <textarea
                    id="project-brief"
                    className="oi-textarea"
                    placeholder="Describe the audience, constraints, timeline, current blockers, and what success should look like."
                  />
                </div>

                <div className="oi-chip-row">
                  <button type="button" className="oi-btn oi-btn-primary">Submit request</button>
                  <button type="button" className="oi-btn oi-btn-secondary">Save draft</button>
                </div>
              </div>
            </article>

            <aside className="oi-stack">
              <article className="oi-card">
                <h3 className="oi-card-title">Specialist directory</h3>
                <div className="oi-stack">
                  {specialists.map((specialist) => (
                    <div key={specialist.name} className="oi-card" style={{ padding: 18 }}>
                      <div className="oi-chip-row" style={{ marginTop: 0 }}>
                        <span className="oi-pill oi-pill-blue">{specialist.availability}</span>
                      </div>
                      <h4 className="oi-card-title" style={{ marginTop: 10 }}>{specialist.name}</h4>
                      <p className="oi-card-copy">{specialist.focus}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="oi-card">
                <h3 className="oi-card-title">What happens next</h3>
                <ul className="oi-list">
                  <li className="oi-list-item"><span className="oi-bullet" /><span>Request is reviewed for scope, urgency, and fit.</span></li>
                  <li className="oi-list-item"><span className="oi-bullet" /><span>Admin team routes to the right specialist lane.</span></li>
                  <li className="oi-list-item"><span className="oi-bullet" /><span>Proposal, follow-up, and event history become visible from the admin workspace.</span></li>
                </ul>
              </article>
            </aside>
          </div>
        </section>

        <section className="oi-section">
          <div className="oi-card">
            <div className="oi-section-header">
              <h2 className="oi-section-title">Need internal visibility too?</h2>
              <p className="oi-section-copy">
                Marketplace requests should flow directly into a tighter admin control surface for proposal creation,
                activity review, and close / reopen actions.
              </p>
            </div>

            <div className="oi-chip-row">
              <Link href="/admin/marketplace" className="oi-btn oi-btn-secondary">Open marketplace admin</Link>
              <Link href="/admin" className="oi-btn oi-btn-accent">Open admin home</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}