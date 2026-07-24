import Image from "next/image";
import Link from "next/link";

const trustPoints = [
  "Track marketplace requests, proposals, and execution visibility.",
  "Separate customer-facing journeys from internal admin operations.",
  "Keep approvals, follow-ups, and activity easier to inspect.",
  "Present a cleaner visual system with stronger product confidence.",
];

export default function LoginPage() {
  return (
    <div className="oi-page">
      <div className="oi-container">
        <div className="oi-page-head">
          <span className="oi-kicker">Client access</span>
        </div>

        <section className="oi-auth-shell">
          <aside className="oi-auth-side">
            <Image
              src="/brand/oye-logo-light.png"
              alt="Oye !magine"
              width={220}
              height={62}
              className="oi-logo-hero"
              priority
            />

            <h1 className="oi-display oi-display-inverse" style={{ marginTop: 18 }}>
              A premium sign-in surface for clients and operators.
            </h1>

            <p className="oi-lead oi-lead-inverse">
              The login page should build trust immediately: clear brand presence, strong contrast,
              quiet form framing, and obvious next actions.
            </p>

            <div className="oi-divider" />

            <div className="oi-mini-grid">
              <div className="oi-mini-stat">
                <strong>Secure</strong>
                workspace entry
              </div>
              <div className="oi-mini-stat">
                <strong>Clear</strong>
                customer/admin split
              </div>
              <div className="oi-mini-stat">
                <strong>Governed</strong>
                proposal access
              </div>
              <div className="oi-mini-stat">
                <strong>Sharper</strong>
                product feel
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <ul className="oi-list">
                {trustPoints.map((point) => (
                  <li key={point} className="oi-list-item">
                    <span className="oi-bullet" />
                    <span style={{ color: "#e2e8f0" }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section
            className="oi-auth-card"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248,251,255,0.94) 100%)",
            }}
          >
            <div className="oi-section-header">
              <h2 className="oi-section-title">Sign in</h2>
              <p className="oi-section-copy">
                Use your workspace credentials to access customer or admin flows.
              </p>
            </div>

            <div className="oi-form-shell">
              <div className="oi-field">
                <label className="oi-label" htmlFor="email">Email</label>
                <input id="email" type="email" className="oi-input" placeholder="name@company.com" />
              </div>

              <div className="oi-field">
                <label className="oi-label" htmlFor="password">Password</label>
                <input id="password" type="password" className="oi-input" placeholder="Enter your password" />
              </div>

              <div className="oi-grid-2">
                <label
                  className="oi-card"
                  style={{
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#ffffff",
                  }}
                >
                  <input type="checkbox" />
                  <span className="oi-subtle">Keep me signed in</span>
                </label>

                <Link
                  href="/admin"
                  className="oi-card"
                  style={{
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ffffff",
                    fontWeight: 800,
                  }}
                >
                  Need admin access?
                </Link>
              </div>

              <div className="oi-chip-row">
                <button type="button" className="oi-btn oi-btn-primary">Continue</button>
                <button type="button" className="oi-btn oi-btn-secondary">Use magic link</button>
              </div>

              <div
                style={{
                  marginTop: 8,
                  padding: 18,
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "rgba(248,251,255,0.9)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <div className="oi-stat-label">Customer lane</div>
                    <div className="oi-card-copy">Requests, proposals, delivery visibility.</div>
                  </div>
                  <div>
                    <div className="oi-stat-label">Admin lane</div>
                    <div className="oi-card-copy">Context switching, notes, audit, ops, marketplace control.</div>
                  </div>
                </div>
              </div>

              <p className="oi-subtle" style={{ margin: 0 }}>
                If authentication handlers already exist in the project, keep this visual shell and reconnect the controls to the existing logic next.
              </p>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}