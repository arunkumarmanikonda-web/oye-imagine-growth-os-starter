import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { ExecutionStatusSummaryCard } from "./execution-status-summary-card";
import Link from "next/link";
import { ExecutionStatusSummaryCard } from "./execution-status-summary-card";
import {
  getNeejeeOnboardingSnapshot,
  type ReadinessState,
} from "@/lib/admin/onboarding-seed";

function averageScore(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function countState(items: Array<{ state: string }>, state: string) {
  return items.filter((item) => item.state === state).length;
}

function toneLabel(state: ReadinessState) {
  switch (state) {
    case "ready":
      return "Ready";
    case "in_progress":
      return "In progress";
    case "blocked":
      return "Blocked";
    case "later":
      return "Later phase";
    default:
      return state;
  }
}

export default function AdminSummaryPage() {
  const snapshot = getNeejeeOnboardingSnapshot();
  const workspaceDisplayName = getWorkspaceDisplayName();

  const readinessAverage = averageScore(snapshot.readiness.map((item) => item.score));
  const blockedCount = countState(snapshot.readiness, "blocked");
  const readyIntegrations = countState(snapshot.integrations, "ready");
  const inProgressServices = countState(snapshot.services, "in_progress");
  const nextPriorities = snapshot.tasks.slice(0, 3);

  return (
    <main className="oi-stage-shell oi-stage-shell-summary">
      <section className="oi-stage-hero oi-stage-hero-summary">
        <div className="oi-stage-hero-copy">
          <div className="oi-stage-row oi-stage-row-start">
            <span className="oi-stage-badge">Executive readiness</span>
            <span className="oi-stage-badge oi-stage-badge-subtle">
              {snapshot.workspace.brand}
            </span>
          </div>
          <p className="oi-stage-overline">Oye !magine operator summary</p>
          <h1>Neejee activation summary</h1>
          <p className="oi-stage-eyebrow">Workspace: {workspaceDisplayName}</p>
          <p className="oi-stage-lead">
            A calmer executive view of what is ready, what is blocked and what must happen next before Neejee can move into controlled activation.
          </p>

          <div className="oi-stage-actions">
            <Link href="/admin/onboarding" className="oi-stage-button oi-stage-button-primary">
              Open onboarding command center
            </Link>
            <a href="/api/admin/onboarding" className="oi-stage-button oi-stage-button-secondary">
              Inspect structured readiness JSON
            </a>
          </div>
        </div>

        <aside className="oi-stage-hero-side">
          <article className="oi-stage-panel oi-stage-scoreboard">
            <p className="oi-stage-overline">Overall readiness</p>
            <h2>{readinessAverage}%</h2>
            <p className="oi-stage-muted">
              A single operator-grade view of how close the Neejee pilot is to a safe, explainable and approval-driven activation state.
            </p>
          </article>
        </aside>
      </section>

      <section className="oi-stage-grid oi-stage-grid-4">
        <article className="oi-stage-panel oi-stage-kpi">
          <p className="oi-stage-overline">Blocked scorecards</p>
          <h2>{blockedCount}</h2>
          <p className="oi-stage-muted">Critical readiness areas still preventing clean activation.</p>
        </article>

        <article className="oi-stage-panel oi-stage-kpi">
          <p className="oi-stage-overline">Ready integrations</p>
          <h2>{readyIntegrations}</h2>
          <p className="oi-stage-muted">Connected systems that can support the next delivery lane today.</p>
        </article>

        <article className="oi-stage-panel oi-stage-kpi">
          <p className="oi-stage-overline">Services in progress</p>
          <h2>{inProgressServices}</h2>
          <p className="oi-stage-muted">Modules currently moving from design readiness into operating readiness.</p>
        </article>

        <article className="oi-stage-panel oi-stage-kpi">
          <p className="oi-stage-overline">Last update</p>
          <h2>{snapshot.workspace.updatedAtLabel}</h2>
          <p className="oi-stage-muted">Current checkpoint for this seeded pilot summary.</p>
        </article>
      </section>

      <section className="oi-stage-dual-grid">
        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Executive interpretation</p>
              <h2>What this means right now</h2>
            </div>
          </div>

          <div className="oi-stage-stack">
            <p className="oi-stage-muted">
              The Neejee pilot is strong enough to move confidently through brand-led planning, premium creative direction and draft-mode execution design.
            </p>
            <p className="oi-stage-muted">
              The main constraints are not shell quality anymore; they are connector verification, finance and contract controls, and readiness for governed activation.
            </p>
            <p className="oi-stage-muted">
              The next product priority is to turn this command layer into a true onboarding engine backed by live integration states, approval logic and commercial workflows.
            </p>
          </div>
        </article>

        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Immediate priorities</p>
              <h2>The next three operating moves</h2>
            </div>
          </div>

          <div className="oi-stage-stack">
            {nextPriorities.map((item) => (
              <article key={item.title} className="oi-stage-task" data-state={item.state}>
                <div className="oi-stage-row oi-stage-row-start">
                  <h3>{item.title}</h3>
                  <span className="oi-stage-pill" data-task-state={item.state}>
                    {item.state}
                  </span>
                </div>
                <p className="oi-stage-meta-line">
                  Owner ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· {item.owner} ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· Due ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· {item.due}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="oi-stage-grid oi-stage-grid-2">
        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Readiness by lane</p>
              <h2>Which areas are strong and which need executive attention</h2>
            </div>
          </div>

          <div className="oi-stage-stack">
            {snapshot.readiness.map((item) => (
              <article key={item.slug} className="oi-stage-readiness-row" data-state={item.state}>
                <div className="oi-stage-row oi-stage-row-start">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="oi-stage-meta-line">{item.owner}</p>
                  </div>
                  <span className="oi-stage-pill" data-state={item.state}>
                    {toneLabel(item.state)}
                  </span>
                </div>
                <div className="oi-stage-progress-track">
                  <span className="oi-stage-progress-fill" style={{ width: `${item.score}%` }} />
                </div>
                <p className="oi-stage-muted">{item.summary}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Decision pressure points</p>
              <h2>Questions that must be settled before activation</h2>
            </div>
          </div>

          <ul className="oi-stage-bullet-list">
            {snapshot.decisions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="oi-stage-divider" />

          <p className="oi-stage-overline">Brand posture reminder</p>
          <ul className="oi-stage-bullet-list oi-stage-bullet-list-tight">
            {snapshot.brandContext.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
      <ExecutionStatusSummaryCard />
</main>
  );
}