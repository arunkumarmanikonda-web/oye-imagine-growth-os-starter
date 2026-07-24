import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="oi-page">
      <div className="oi-container">
        <div className="oi-page-head">
          <span className="oi-kicker">Product shell overhaul</span>
        </div>

        <section className="oi-hero">
          <div className="oi-panel">
            <Image
              src="/brand/oye-logo-dark.png"
              alt="Oye !magine"
              width={220}
              height={62}
              className="oi-logo-hero"
              priority
            />
            <h1 className="oi-display">Growth infrastructure built for brands that need clarity, speed, and accountable execution.</h1>
            <p className="oi-lead">
              Oye !magine is the operating layer for strategy, websites, SEO, paid media, analytics,
              specialist execution, and governed marketplace delivery.
            </p>

            <div className="oi-chip-row">
              <Link href="/marketplace" className="oi-btn oi-btn-primary">Explore marketplace</Link>
              <Link href="/admin" className="oi-btn oi-btn-secondary">Open admin workspace</Link>
              <Link href="/login" className="oi-btn oi-btn-ghost">Sign in</Link>
            </div>
          </div>

          <div className="oi-panel-dark">
            <span className="oi-kicker">Setup readiness</span>
            <h2 className="oi-display oi-display-inverse">100%</h2>
            <p className="oi-lead oi-lead-inverse">
              Operational readiness is complete, core checks are available, and the shell now separates
              customer-facing value from admin execution surfaces more clearly.
            </p>

            <div className="oi-mini-grid" style={{ marginTop: 22 }}>
              <div className="oi-mini-stat">
                <strong>6/6</strong>
                checks ready
              </div>
              <div className="oi-mini-stat">
                <strong>Live</strong>
                strategy
              </div>
              <div className="oi-mini-stat">
                <strong>Live</strong>
                marketplace
              </div>
              <div className="oi-mini-stat">
                <strong>Ready</strong>
                operator workspace
              </div>
            </div>
          </div>
        </section>

        <section className="oi-section">
          <div className="oi-grid-3">
            <article className="oi-card">
              <h3 className="oi-card-title">Strategy engine</h3>
              <p className="oi-card-copy">
                Convert inputs into channel plans, positioning, growth priorities, and execution guidance.
              </p>
            </article>
            <article className="oi-card">
              <h3 className="oi-card-title">Specialist marketplace</h3>
              <p className="oi-card-copy">
                Route governed briefs into a managed network of operators, reviewers, and delivery flows.
              </p>
            </article>
            <article className="oi-card">
              <h3 className="oi-card-title">Admin control plane</h3>
              <p className="oi-card-copy">
                Manage context, settings, audit trails, workstreams, and marketplace actions in one place.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}