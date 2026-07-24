const surfaces = [
  {
    title: "Executive summary",
    href: "/admin/summary",
    copy: "Top-level health, posture, and workspace narrative for operator review.",
    badge: "Summary",
  },
  {
    title: "Workspace settings",
    href: "/admin/settings",
    copy: "Configuration controls, version history, restore actions, and refresh flows.",
    badge: "Settings",
  },
  {
    title: "Operations console",
    href: "/admin/ops",
    copy: "Release-readiness, guardrails, and execution posture across the system.",
    badge: "Ops",
  },
  {
    title: "Marketplace admin",
    href: "/admin/marketplace",
    copy: "Requests, proposals, event history, and request-level action handling.",
    badge: "Marketplace",
  },
];

const operatorChecklist = [
  "Review context switching and current workspace scope.",
  "Inspect audit and notes surfaces for missing admin credentials.",
  "Validate marketplace request and proposal flows.",
  "Return to event persistence hardening after UI stabilization.",
];

export default function AdminHomePage() {
  return (
    <div className="oi-page">
      <div className="oi-container">
        <div className="oi-page-head">
          <span className="oi-kicker">Admin workspace</span>
        </div>

        <section className="oi-dashboard-grid">
          <div className="oi-panel">
            <div className="oi-chip-row" style={{ marginTop: 0 }}>
              <span className="oi-pill oi-pill-blue">Operator console</span>
              <span className="oi-pill oi-pill-orange">Managed access</span>
              <span className="oi-pill oi-pill-green">Execution ready</span>
            </div>

            <h1 className="oi-display">Operate workspaces inside a calmer, denser control plane.</h1>
            <p className="oi-lead">
              The admin side should feel less like a landing page and more like an internal command
              surface: sharper grouping, quicker action paths, clearer state, and better separation
              from the customer-facing product language.
            </p>

            <div className="oi-stat-grid">
              <div className="oi-stat-card">
                <p className="oi-stat-label">Tenants</p>
                <p className="oi-stat-value">0</p>
                <p className="oi-stat-copy">No active context yet in the current unauthenticated session.</p>
              </div>
              <div className="oi-stat-card">
                <p className="oi-stat-label">Brands</p>
                <p className="oi-stat-value">0</p>
                <p className="oi-stat-copy">Brand scope remains gated until admin credentials are present.</p>
              </div>
              <div className="oi-stat-card">
                <p className="oi-stat-label">Status</p>
                <p className="oi-stat-value">Guarded</p>
                <p className="oi-stat-copy">APIs correctly return 401 when admin credentials are missing.</p>
              </div>
            </div>
          </div>

          <aside className="oi-panel-dark">
            <span className="oi-kicker">Admin identity</span>
            <h2 className="oi-display oi-display-inverse">Unknown</h2>
            <p className="oi-lead oi-lead-inverse">
              Manage context, review audit activity, work with notes, and move between onboarding,
              strategy, execution, and summary workflows.
            </p>

            <div className="oi-mini-grid" style={{ marginTop: 22 }}>
              <div className="oi-mini-stat">
                <strong>No active</strong>
                context
              </div>
              <div className="oi-mini-stat">
                <strong>401</strong>
                guarded APIs
              </div>
              <div className="oi-mini-stat">
                <strong>Live</strong>
                operator shell
              </div>
              <div className="oi-mini-stat">
                <strong>Next</strong>
                backend hardening
              </div>
            </div>
          </aside>
        </section>

        <section className="oi-section">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1.1fr) minmax(320px,0.9fr)",
              gap: 18,
            }}
          >
            <article className="oi-card">
              <div className="oi-section-header">
                <h2 className="oi-section-title">Control surfaces</h2>
                <p className="oi-section-copy">
                  Use these routes to inspect the refreshed operator experience.
                </p>
              </div>

              <div className="oi-grid-2">
                {surfaces.map((surface) => (
                  <article
                    key={surface.href}
                    style={{
                      padding: 20,
                      borderRadius: 20,
                      border: "1px solid rgba(15,23,42,0.08)",
                      background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                      boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
                    }}
                  >
                    <span className="oi-pill oi-pill-blue">{surface.badge}</span>
                    <h3 className="oi-card-title" style={{ marginTop: 14 }}>{surface.title}</h3>
                    <p className="oi-card-copy">{surface.copy}</p>
                    <div className="oi-chip-row">
                      <a href={surface.href} className="oi-btn oi-btn-secondary">Open</a>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <aside className="oi-stack">
              <article className="oi-card">
                <h3 className="oi-card-title">Immediate operator checklist</h3>
                <ul className="oi-list">
                  {operatorChecklist.map((item) => (
                    <li key={item} className="oi-list-item">
                      <span className="oi-bullet" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="oi-card">
                <h3 className="oi-card-title">Current posture</h3>
                <p className="oi-card-copy">
                  Customer-facing pages now read more cleanly, but the admin side remains the
                  execution lane. Preserve that split while continuing backend event persistence work.
                </p>
              </article>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}