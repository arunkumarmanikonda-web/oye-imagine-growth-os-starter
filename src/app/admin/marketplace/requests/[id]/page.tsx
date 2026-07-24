type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const eventTimeline = [
  {
    title: "Request created",
    detail: "Initial brief captured from the marketplace intake surface.",
  },
  {
    title: "Operator review queued",
    detail: "Admin review lane opened for scope, urgency, and specialist routing.",
  },
  {
    title: "Proposal path prepared",
    detail: "Request is ready for proposal drafting, event persistence verification, and follow-up actions.",
  },
];

const actionCards = [
  {
    title: "Create proposal",
    copy: "Open proposal drafting for this request and preserve the resulting activity trail.",
    tone: "primary",
  },
  {
    title: "Review activity",
    copy: "Inspect request events, operator actions, and backend persistence once hardening is complete.",
    tone: "secondary",
  },
  {
    title: "Close or reopen",
    copy: "Manage status changes without losing operational visibility across the request lifecycle.",
    tone: "ghost",
  },
];

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const requestId = decodeURIComponent(id);

  return (
    <div className="oi-page">
      <div className="oi-container">
        <div className="oi-page-head">
          <span className="oi-kicker">Request detail</span>
        </div>

        <section className="oi-dashboard-grid">
          <div className="oi-panel">
            <div className="oi-chip-row" style={{ marginTop: 0 }}>
              <span className="oi-pill oi-pill-blue">Marketplace request</span>
              <span className="oi-pill oi-pill-orange">Governed workflow</span>
              <span className="oi-pill oi-pill-green">Operator action</span>
            </div>

            <h1 className="oi-display">Request workspace</h1>
            <p className="oi-lead">
              Review the selected request, frame the next action, and keep proposals, activity, and lifecycle
              state in one calmer workspace.
            </p>

            <div
              style={{
                marginTop: 22,
                padding: 20,
                borderRadius: 20,
                border: "1px solid rgba(15,23,42,0.08)",
                background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
              }}
            >
              <div className="oi-stat-label">Request ID</div>
              <div className="oi-card-copy" style={{ fontWeight: 800 }}>{requestId}</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                gap: 14,
                marginTop: 18,
              }}
            >
              <div className="oi-card" style={{ padding: 18 }}>
                <div className="oi-stat-label">Status</div>
                <div className="oi-card-copy">In review</div>
              </div>
              <div className="oi-card" style={{ padding: 18 }}>
                <div className="oi-stat-label">Lane</div>
                <div className="oi-card-copy">Marketplace execution</div>
              </div>
              <div className="oi-card" style={{ padding: 18 }}>
                <div className="oi-stat-label">Budget</div>
                <div className="oi-card-copy">$15k–$30k</div>
              </div>
            </div>
          </div>

          <aside className="oi-panel-dark">
            <span className="oi-kicker">Quick actions</span>
            <h2 className="oi-display oi-display-inverse">Ready</h2>
            <p className="oi-lead oi-lead-inverse">
              The detail page should expose proposal, activity, and lifecycle actions clearly while backend event
              persistence is verified.
            </p>

            <div className="oi-stack" style={{ marginTop: 22 }}>
              <a href="/admin/marketplace" className="oi-btn oi-btn-secondary">Back to marketplace admin</a>
              <button type="button" className="oi-btn oi-btn-primary">Create proposal</button>
              <button type="button" className="oi-btn oi-btn-ghost">Open activity</button>
            </div>
          </aside>
        </section>

        <section className="oi-section">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.05fr) minmax(320px,0.95fr)",
              gap: 18,
            }}
          >
            <article className="oi-card">
              <div className="oi-section-header">
                <h2 className="oi-section-title">Request activity</h2>
                <p className="oi-section-copy">
                  These actions represent the lifecycle checkpoints that should later be backed by persisted events.
                </p>
              </div>

              <div className="oi-stack">
                {eventTimeline.map((event, index) => (
                  <div
                    key={event.title}
                    style={{
                      padding: 20,
                      borderRadius: 20,
                      border: "1px solid rgba(15,23,42,0.08)",
                      background: index === 0
                        ? "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)"
                        : "#ffffff",
                      boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
                    }}
                  >
                    <div className="oi-stat-label">Step {index + 1}</div>
                    <h3 className="oi-card-title">{event.title}</h3>
                    <p className="oi-card-copy">{event.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <aside className="oi-stack">
              <article className="oi-card">
                <h3 className="oi-card-title">Request actions</h3>
                <div className="oi-stack">
                  {actionCards.map((card) => (
                    <div
                      key={card.title}
                      style={{
                        padding: 18,
                        borderRadius: 18,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                      }}
                    >
                      <h4 className="oi-card-title">{card.title}</h4>
                      <p className="oi-card-copy">{card.copy}</p>
                      <div className="oi-chip-row">
                        {card.tone === "primary" && (
                          <button type="button" className="oi-btn oi-btn-primary">Run action</button>
                        )}
                        {card.tone === "secondary" && (
                          <button type="button" className="oi-btn oi-btn-secondary">Run action</button>
                        )}
                        {card.tone === "ghost" && (
                          <button type="button" className="oi-btn oi-btn-ghost">Run action</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="oi-card">
                <h3 className="oi-card-title">Operational note</h3>
                <p className="oi-card-copy">
                  After this UI alignment batch, return to the backend work: replace non-throwing event writes,
                  verify PUT-triggered events, implement Supabase admin-client persistence, and confirm GET returns
                  the newly written timeline entries.
                </p>
              </article>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}