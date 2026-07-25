import type { Route } from "next";
import Link from "next/link";
import { getNeejeePilotControlSnapshot } from "@/lib/admin/neejee-pilot";

const statusLabel: Record<string, string> = {
  blocked: "Blocked",
  review_required: "Review required",
  in_progress: "In progress",
  ready: "Ready",
};

const toneClass: Record<string, string> = {
  primary: "oi-stage-button-primary",
  secondary: "oi-stage-button-secondary",
  ghost: "oi-stage-button-ghost",
};

export default function AdminPilotPage() {
  const snapshot = getNeejeePilotControlSnapshot();

  return (
    <main className="oi-stage-shell oi-pilot-shell">
      <section className="oi-stage-hero oi-pilot-hero">
        <div className="oi-stage-eyebrow">Neejee pilot</div>
        <h1>Unified pilot control tower</h1>
        <p>
          Bring onboarding readiness, brand intelligence, executive interpretation, and activation
          planning into one operating view for the Neejee pilot.
        </p>

        <div className="oi-pilot-hero-actions">
          <Link href="/admin/onboarding" className="oi-stage-button-secondary">
            Open onboarding
          </Link>
          <Link href="/admin/brand-intelligence" className="oi-stage-button-primary">
            Open brand intelligence
          </Link>
          <Link href="/admin/summary" className="oi-stage-button-ghost">
            Open summary
          </Link>
        </div>

        <div className="oi-pilot-signal-row">
          <article className="oi-pilot-signal-card">
            <span className="oi-pilot-signal-label">Readiness score</span>
            <strong>{snapshot.signals.readinessScore}</strong>
            <span>{snapshot.signals.blockedLanes} blocked lane(s)</span>
          </article>
          <article className="oi-pilot-signal-card">
            <span className="oi-pilot-signal-label">Brand profile</span>
            <strong>{snapshot.signals.profileStatus}</strong>
            <span>{snapshot.signals.approvedLanguageCount} approved language cue(s)</span>
          </article>
          <article className="oi-pilot-signal-card">
            <span className="oi-pilot-signal-label">Activation load</span>
            <strong>{snapshot.signals.serviceCount} tracks</strong>
            <span>{snapshot.signals.pendingIntegrations} pending integration(s)</span>
          </article>
        </div>
      </section>

      <section className="oi-pilot-grid">
        <article className="oi-pilot-panel">
          <div className="oi-pilot-panel-head">
            <div>
              <div className="oi-stage-eyebrow">Pilot progression</div>
              <h2>Stage-by-stage readiness</h2>
            </div>
            <Link href="/api/admin/pilot" className="oi-stage-button-ghost">
              View pilot API
            </Link>
          </div>

          <div className="oi-pilot-stage-list">
            {snapshot.stages.map((stage, index) => (
              <article key={stage.id} className="oi-pilot-stage-card">
                <div className="oi-pilot-stage-index">0{index + 1}</div>
                <div className="oi-pilot-stage-body">
                  <div className="oi-pilot-stage-topline">
                    <div>
                      <h3>{stage.title}</h3>
                      <p>{stage.owner}</p>
                    </div>
                    <span className={`oi-pilot-status oi-pilot-status-${stage.status}`}>
                      {statusLabel[stage.status] ?? stage.status}
                    </span>
                  </div>
                  <p className="oi-pilot-stage-summary">{stage.summary}</p>
                  <ul className="oi-pilot-list">
                    {stage.signals.map((signal) => (
                      <li key={signal}>{signal}</li>
                    ))}
                  </ul>
                  <Link href={stage.href as Route} className="oi-stage-button-secondary">
                    Open surface
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="oi-pilot-panel">
          <div className="oi-pilot-panel-head">
            <div>
              <div className="oi-stage-eyebrow">Execution guidance</div>
              <h2>Immediate next actions</h2>
            </div>
          </div>

          <div className="oi-pilot-action-list">
            {snapshot.nextActions.map((action) => (
              <article key={`${action.href}-${action.label}`} className="oi-pilot-action-card">
                <div>
                  <h3>{action.label}</h3>
                  <p>{action.detail}</p>
                </div>
                <Link href={action.href as Route} className={toneClass[action.tone] ?? "oi-stage-button-secondary"}>
                  Continue
                </Link>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="oi-pilot-grid">
        <article className="oi-pilot-panel">
          <div className="oi-pilot-panel-head">
            <div>
              <div className="oi-stage-eyebrow">Leadership readout</div>
              <h2>Executive interpretation</h2>
            </div>
          </div>

          <ul className="oi-pilot-brief-list">
            {snapshot.executiveBrief.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>

        <article className="oi-pilot-panel">
          <div className="oi-pilot-panel-head">
            <div>
              <div className="oi-stage-eyebrow">Connected surfaces</div>
              <h2>One pilot, four working views</h2>
            </div>
          </div>

          <div className="oi-pilot-surface-grid">
            <Link href="/admin/onboarding" className="oi-pilot-surface-card">
              <span className="oi-pilot-surface-title">Onboarding command center</span>
              <span className="oi-pilot-surface-copy">
                Resolve readiness blockers, integrations, and activation dependencies.
              </span>
            </Link>
            <Link href="/admin/brand-intelligence" className="oi-pilot-surface-card">
              <span className="oi-pilot-surface-title">Brand intelligence workspace</span>
              <span className="oi-pilot-surface-copy">
                Approve positioning, identity rules, and language controls.
              </span>
            </Link>
            <Link href="/admin/summary" className="oi-pilot-surface-card">
              <span className="oi-pilot-surface-title">Executive summary</span>
              <span className="oi-pilot-surface-copy">
                Consolidate signals into a leadership operating picture.
              </span>
            </Link>
            <Link href="/admin/marketplace" className="oi-pilot-surface-card">
              <span className="oi-pilot-surface-title">Marketplace execution</span>
              <span className="oi-pilot-surface-copy">
                Validate downstream delivery readiness before opening the pilot.
              </span>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}