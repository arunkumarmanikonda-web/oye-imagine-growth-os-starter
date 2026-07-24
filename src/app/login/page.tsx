import Image from "next/image";
import Link from "next/link";

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
              width={180}
              height={51}
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

            <div className="oi-divider" style={{ background: 'rgba(255,255,255,0.12)' }} />

            <div className="oi-mini-grid">
              <div className="oi-mini-stat">
                <strong>Projects</strong>
                Track marketplace requests, proposals, and execution visibility.
              </div>
              <div className="oi-mini-stat">
                <strong>Access</strong>
                Separate customer-facing journeys from internal admin operations.
              </div>
              <div className="oi-mini-stat">
                <strong>Signals</strong>
                Keep approvals, follow-ups, and activity easier to inspect.
              </div>
              <div className="oi-mini-stat">
                <strong>Trust</strong>
                Cleaner visual system, less “template”, more product confidence.
              </div>
            </div>
          </aside>

          <section className="oi-auth-card">
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
                <label className="oi-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" />
                  <span className="oi-subtle">Keep me signed in</span>
                </label>

                <Link href="/admin" className="oi-card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Need admin access?
                </Link>
              </div>

              <div className="oi-chip-row">
                <button type="button" className="oi-btn oi-btn-primary">Continue</button>
                <button type="button" className="oi-btn oi-btn-secondary">Use magic link</button>
              </div>

              <p className="oi-subtle" style={{ margin: 0 }}>
                If authentication logic already exists in your project, wire these controls into the current handlers after the shell pass.
              </p>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}