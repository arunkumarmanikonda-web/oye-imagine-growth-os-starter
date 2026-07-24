import Link from "next/link";

const specialistCards = [
  {
    name: "Launch Strategist",
    focus: "Narrative architecture, positioning, launch sequencing, and GTM alignment.",
    availability: "Available this week",
  },
  {
    name: "Performance Operator",
    focus: "Demand capture, paid media efficiency, funnel repair, and budget control.",
    availability: "2 open slots",
  },
  {
    name: "Conversion Designer",
    focus: "Landing surfaces, offer structure, UX cleanup, and conversion rate lift.",
    availability: "Booking next sprint",
  },
];

const serviceLanes = [
  "Brand strategy",
  "Website redesign",
  "SEO growth",
  "Paid media",
  "Analytics and dashboards",
  "Marketplace execution",
];

const processSteps = [
  "Brief is reviewed for scope, urgency, and expected delivery path.",
  "Admin team routes the request into the right specialist lane.",
  "Proposal, follow-up, and event history move into the governed operator workspace.",
];

export default function MarketplacePage() {
  return (
    <div className="oi-page">
      <div className="oi-container">
        <div className="oi-page-head">
          <span className="oi-kicker">Marketplace</span>
        </div>

        <section className="oi-hero">
          <div
            className="oi-panel"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248,251,255,0.95) 100%)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(10,132,255,0.08)",
                color: "#1256b8",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Marketplace intake
            </div>

            <h1 className="oi-display">Submit a better brief. Get a sharper delivery path.</h1>
            <p className="oi-lead">
              The marketplace should feel guided, premium, and credible. This pass improves the
              intake rhythm, specialist presentation, and handoff structure so the page reads like
              a real product flow instead of a generic form screen.
            </p>

            <div className="oi-chip-row">
              <span className="oi-chip">Brief-led intake</span>
              <span className="oi-chip">Specialist matching</span>
              <span className="oi-chip">Proposal-ready routing</span>
            </div>

            <div className="oi-chip-row">
              <button type="button" className="oi-btn oi-btn-primary">Submit request</button>
              <button type="button" className="oi-btn oi-btn-secondary">Save draft</button>
              <Link href="/admin/marketplace" className="oi-btn oi-btn-ghost">Open marketplace admin</Link>
            </div>
          </div>

          <div className="oi-panel-dark">
            <span className="oi-kicker">Delivery posture</span>
            <h2 className="oi-display oi-display-inverse">Structured enough to trust. Light enough to move.</h2>
            <p className="oi-lead oi-lead-inverse">
              Instead of a crowded dashboard feel, the marketplace now reads like a guided product
              journey: understand the request, frame scope, route to the right operator, then move
              into proposal and activity tracking.
            </p>

            <div className="oi-mini-grid" style={{ marginTop: 22 }}>
              <div className="oi-mini-stat">
                <strong>Higher</strong>
                intake quality
              </div>
              <div className="oi-mini-stat">
                <strong>Tighter</strong>
                routing clarity
              </div>
              <div className="oi-mini-stat">
                <strong>Guided</strong>
                specialist matching
              </div>
              <div className="oi-mini-stat">
                <strong>Governed</strong>
                proposal handoff
              </div>
            </div>
          </div>
        </section>

        <section className="oi-section">
          <div className="oi-stat-grid">
            <div className="oi-stat-card">
              <p className="oi-stat-label">Intake quality</p>
              <p className="oi-stat-value">Higher</p>
              <p className="oi-stat-copy">
                Prompt the buyer for goals, constraints, timeline, and expected outcomes.
              </p>
            </div>
            <div className="oi-stat-card">
              <p className="oi-stat-label">Routing clarity</p>
              <p className="oi-stat-value">Tighter</p>
              <p className="oi-stat-copy">
                Put the right operator context beside the request instead of after it.
              </p>
            </div>
            <div className="oi-stat-card">
              <p className="oi-stat-label">Product feel</p>
              <p className="oi-stat-value">Sharper</p>
              <p className="oi-stat-copy">
                Cleaner hierarchy, more whitespace, stronger confidence, less clutter.
              </p>
            </div>
          </div>
        </section>

        <section className="oi-section">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.15fr) minmax(360px,0.85fr)",
              gap: 18,
            }}
          >
            <article className="oi-panel">
              <div className="oi-section-header">
                <h2 className="oi-section-title">Project brief</h2>
                <p className="oi-section-copy">
                  Capture enough context to produce a quality proposal and reduce clarification loops.
                </p>
              </div>

              <div className="oi-form-shell">
                <div className="oi-grid-2">
                  <div className="oi-field">
                    <label className="oi-label" htmlFor="project-name">Project name</label>
                    <input id="project-name" className="oi-input" placeholder="Q4 acquisition reset" />
                  </div>
                  <div className="oi-field">
                    <label className="oi-label" htmlFor="primary-outcome">Primary outcome</label>
                    <input
                      id="primary-outcome"
                      className="oi-input"
                      placeholder="Increase qualified pipeline and improve conversion"
                    />
                  </div>
                </div>

                <div className="oi-grid-2">
                  <div className="oi-field">
                    <label className="oi-label" htmlFor="timeline">Timeline</label>
                    <input id="timeline" className="oi-input" placeholder="4–6 weeks" />
                  </div>
                  <div className="oi-field">
                    <label className="oi-label" htmlFor="budget">Budget range</label>
                    <input id="budget" className="oi-input" placeholder="$15k–$30k" />
                  </div>
                </div>

                <div className="oi-field">
                  <label className="oi-label" htmlFor="brief">Brief</label>
                  <textarea
                    id="brief"
                    className="oi-textarea"
                    placeholder="Describe the audience, constraints, current blockers, operating context, and what success should look like."
                  />
                </div>

                <div className="oi-field">
                  <span className="oi-label">Service lanes</span>
                  <div className="oi-chip-row" style={{ marginTop: 8 }}>
                    {serviceLanes.map((lane) => (
                      <span key={lane} className="oi-chip">{lane}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <aside className="oi-stack">
              <article className="oi-card">
                <h3 className="oi-card-title">Specialist directory</h3>
                <div className="oi-stack">
                  {specialistCards.map((specialist) => (
                    <div
                      key={specialist.name}
                      style={{
                        padding: 18,
                        borderRadius: 20,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                        boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
                      }}
                    >
                      <span className="oi-pill oi-pill-blue">{specialist.availability}</span>
                      <h4 className="oi-card-title" style={{ marginTop: 14 }}>{specialist.name}</h4>
                      <p className="oi-card-copy">{specialist.focus}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="oi-card">
                <h3 className="oi-card-title">What happens next</h3>
                <ul className="oi-list">
                  {processSteps.map((step) => (
                    <li key={step} className="oi-list-item">
                      <span className="oi-bullet" />
                      <span>{step}</span>
                    </li>
                  ))}
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
                Marketplace requests should flow directly into the admin control surface for proposal
                creation, event history, follow-up, and close / reopen actions.
              </p>
            </div>

            <div className="oi-chip-row">
              <Link href="/admin/marketplace" className="oi-btn oi-btn-secondary">Open marketplace admin</Link>
              <Link href="/admin" className="oi-btn oi-btn-accent">Open admin workspace</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}