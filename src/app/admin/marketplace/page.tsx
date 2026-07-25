import { getWorkspaceDisplayName, getWorkspaceSurfaceLabel } from "@/lib/admin/workspace-branding";
const requestCards = [
  {
    id: "req-demo-enterprise-rebrand",
    title: "Enterprise rebrand and demand capture reset",
    company: "Northstar Health",
    status: "New",
    lane: "Brand strategy",
    budget: "$25kÃ¢â‚¬â€œ$40k",
    updated: "Updated 2h ago",
    summary: "Repositioning project covering website refresh, acquisition cleanup, and executive messaging alignment.",
  },
  {
    id: "req-demo-paid-media-repair",
    title: "Paid media repair and funnel recovery",
    company: "Aster Retail",
    status: "In review",
    lane: "Paid media",
    budget: "$12kÃ¢â‚¬â€œ$20k",
    updated: "Updated 5h ago",
    summary: "Performance decline across search and paid social requires tighter routing, targeting cleanup, and landing page fixes.",
  },
  {
    id: "req-demo-marketplace-launch",
    title: "Marketplace launch operating model",
    company: "Nova Commerce",
    status: "Proposal drafting",
    lane: "Marketplace execution",
    budget: "$30k+",
    updated: "Updated yesterday",
    summary: "Go-to-market support for launch planning, specialist coordination, and governed proposal delivery.",
  },
];

const pipeline = [
  { label: "Open requests", value: "12" },
  { label: "In review", value: "5" },
  { label: "Proposal drafting", value: "3" },
  { label: "Awaiting client", value: "4" },
];

export default function AdminMarketplacePage() {
  const workspaceLabel = getWorkspaceSurfaceLabel("marketplace", getWorkspaceDisplayName());
  return (
    <div className="oi-page">
      <div className="oi-container">
        <div className="oi-page-head">
          <p className="oi-stage-eyebrow">{workspaceLabel}</p>
          <span className="oi-kicker">Marketplace admin</span>
        </div>

        <section className="oi-dashboard-grid">
          <div className="oi-panel">
            <div className="oi-chip-row" style={{ marginTop: 0 }}>
              <span className="oi-pill oi-pill-blue">Requests</span>
              <span className="oi-pill oi-pill-orange">Proposals</span>
              <span className="oi-pill oi-pill-green">Activity</span>
            </div>

            <h1 className="oi-display">Govern request intake, proposal flow, and operator actions in one surface.</h1>
            <p className="oi-lead">
              This workspace should feel like a premium operational console: tighter filtering, quicker action
              paths, clearer state, and a direct route from incoming brief to governed delivery.
            </p>

            <div className="oi-chip-row">
              <a href="/marketplace" className="oi-btn oi-btn-secondary">Open customer marketplace</a>
              <a href="/admin" className="oi-btn oi-btn-ghost">Back to admin home</a>
            </div>
          </div>

          <aside className="oi-panel-dark">
            <span className="oi-kicker">Pipeline</span>
            <h2 className="oi-display oi-display-inverse">Live</h2>
            <p className="oi-lead oi-lead-inverse">
              Use the list below to review request quality, route specialist lanes, draft proposals, and inspect
              event history as the backend persistence layer is hardened.
            </p>

            <div className="oi-mini-grid" style={{ marginTop: 22 }}>
              {pipeline.map((item) => (
                <div key={item.label} className="oi-mini-stat">
                  <strong>{item.value}</strong>
                  {item.label}
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="oi-section">
          <div className="oi-card">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 12,
              }}
            >
              <div>
                <div className="oi-stat-label">Filter</div>
                <div className="oi-card-copy">All requests</div>
              </div>
              <div>
                <div className="oi-stat-label">Lane</div>
                <div className="oi-card-copy">All specialist lanes</div>
              </div>
              <div>
                <div className="oi-stat-label">Sort</div>
                <div className="oi-card-copy">Latest activity</div>
              </div>
              <div>
                <div className="oi-stat-label">Action</div>
                <div className="oi-card-copy">Review and route</div>
              </div>
            </div>
          </div>
        </section>

        <section className="oi-section">
          <div className="oi-stack">
            {requestCards.map((request) => (
              <article
                key={request.id}
                className="oi-card"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.95) 100%)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) auto",
                    gap: 18,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <div className="oi-chip-row" style={{ marginTop: 0 }}>
                      <span className="oi-pill oi-pill-blue">{request.status}</span>
                      <span className="oi-pill oi-pill-orange">{request.lane}</span>
                      <span className="oi-pill oi-pill-green">{request.budget}</span>
                    </div>

                    <h2 className="oi-section-title" style={{ marginTop: 16, fontSize: "1.45rem" }}>
                      {request.title}
                    </h2>

                    <p className="oi-card-copy" style={{ marginTop: 10 }}>
                      <strong>{request.company}</strong> Ã‚Â· {request.summary}
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                        gap: 14,
                        marginTop: 18,
                      }}
                    >
                      <div>
                        <div className="oi-stat-label">Company</div>
                        <div className="oi-card-copy">{request.company}</div>
                      </div>
                      <div>
                        <div className="oi-stat-label">Lane</div>
                        <div className="oi-card-copy">{request.lane}</div>
                      </div>
                      <div>
                        <div className="oi-stat-label">Last activity</div>
                        <div className="oi-card-copy">{request.updated}</div>
                      </div>
                    </div>
                  </div>

                  <div className="oi-stack" style={{ minWidth: 220 }}>
                    <a href={"/admin/marketplace/requests/" + request.id} className="oi-btn oi-btn-primary">
                      Open request
                    </a>
                    <button type="button" className="oi-btn oi-btn-secondary">Create proposal</button>
                    <button type="button" className="oi-btn oi-btn-ghost">View activity</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}