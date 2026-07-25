import Link from "next/link";
import { getNeejeeOnboardingSnapshotLive } from "@/lib/admin/neejee-live";
import type {
  ActivationStep,
  BlockerItem,
  IntegrationItem,
  ReadinessCard,
  ReadinessState,
  ServiceModule,
  TaskItem,
} from "@/lib/admin/onboarding-seed";

function stateLabel(state: ReadinessState) {
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

function stepLabel(step: ActivationStep["state"]) {
  switch (step) {
    case "done":
      return "Done";
    case "current":
      return "Current";
    case "next":
      return "Next";
    case "waiting":
      return "Waiting";
    default:
      return step;
  }
}

function blockerLabel(item: BlockerItem["severity"]) {
  switch (item) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    default:
      return item;
  }
}

function readinessAverage(readiness: ReadinessCard[]) {
  if (!readiness.length) return 0;
  return Math.round(
    readiness.reduce((sum, item) => sum + item.score, 0) / readiness.length,
  );
}

function countByState(items: Array<{ state: string }>, state: string) {
  return items.filter((item) => item.state === state).length;
}

function ServiceCard({ item }: { item: ServiceModule }) {
  return (
    <article className="oi-stage-panel oi-stage-panel-tight" data-state={item.state}>
      <div className="oi-stage-row oi-stage-row-start">
        <div>
          <p className="oi-stage-overline">Service module</p>
          <h3>{item.title}</h3>
        </div>
        <span className="oi-stage-pill" data-state={item.state}>
          {stateLabel(item.state)}
        </span>
      </div>
      <p className="oi-stage-muted">{item.summary}</p>
      <p className="oi-stage-meta-line">Owner Ãƒâ€šÃ‚Â· {item.owner}</p>
    </article>
  );
}

function IntegrationCard({ item }: { item: IntegrationItem }) {
  return (
    <article className="oi-stage-panel oi-stage-panel-tight" data-state={item.state}>
      <div className="oi-stage-row oi-stage-row-start">
        <div>
          <p className="oi-stage-overline">Integration</p>
          <h3>{item.title}</h3>
        </div>
        <span className="oi-stage-pill" data-state={item.state}>
          {stateLabel(item.state)}
        </span>
      </div>
      <dl className="oi-stage-definition-list">
        <div>
          <dt>Owner</dt>
          <dd>{item.owner}</dd>
        </div>
        <div>
          <dt>Dependency</dt>
          <dd>{item.dependency}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>{item.nextAction}</dd>
        </div>
      </dl>
    </article>
  );
}

function TaskCard({ item }: { item: TaskItem }) {
  return (
    <article className="oi-stage-task" data-state={item.state}>
      <div className="oi-stage-row oi-stage-row-start">
        <h3>{item.title}</h3>
        <span className="oi-stage-pill" data-task-state={item.state}>
          {item.state}
        </span>
      </div>
      <p className="oi-stage-meta-line">
        Owner Ãƒâ€šÃ‚Â· {item.owner} Ãƒâ€šÃ‚Â· Due Ãƒâ€šÃ‚Â· {item.due}
      </p>
    </article>
  );
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminOnboardingPage() {
  const snapshot = await getNeejeeOnboardingSnapshotLive();
  const averageScore = readinessAverage(snapshot.readiness);
  const readyServices = countByState(snapshot.services, "ready");
  const blockedIntegrations = countByState(snapshot.integrations, "blocked");

  return (
    <main className="oi-stage-shell">
      <section className="oi-stage-hero">
        <div className="oi-stage-hero-copy">
          <div className="oi-stage-row oi-stage-row-start">
            <span className="oi-stage-badge">Neejee pilot</span>
            <span className="oi-stage-badge oi-stage-badge-subtle">
              {snapshot.workspace.environment}
            </span>
          </div>

          <p className="oi-stage-overline">Oye !magine AI Growth OS</p>
          <h1>{snapshot.workspace.brand} onboarding command center</h1>
          <p className="oi-stage-lead">{snapshot.workspace.stageSummary}</p>

          <div className="oi-stage-microgrid">
            <div className="oi-stage-metric-tile">
              <span>Current stage</span>
              <strong>{snapshot.workspace.stage}</strong>
            </div>
            <div className="oi-stage-metric-tile">
              <span>Autonomy mode</span>
              <strong>{snapshot.workspace.autonomyLevel}</strong>
            </div>
            <div className="oi-stage-metric-tile">
              <span>Pilot state</span>
              <strong>{snapshot.workspace.pilotState}</strong>
            </div>
            <div className="oi-stage-metric-tile">
              <span>Last updated</span>
              <strong>{snapshot.workspace.updatedAtLabel}</strong>
            </div>
          </div>

          <div className="oi-stage-actions">
            <Link href="/admin/summary" className="oi-stage-button oi-stage-button-primary">
              Open executive summary
            </Link>
            <a href="/api/admin/onboarding" className="oi-stage-button oi-stage-button-secondary">
              View onboarding API
            </a>
          </div>
        </div>

        <aside className="oi-stage-hero-side">
          <article className="oi-stage-panel oi-stage-scoreboard">
            <p className="oi-stage-overline">Readiness posture</p>
            <h2>{averageScore}%</h2>
            <p className="oi-stage-muted">
              Average activation readiness across brand, integrations, services and commercial controls.
            </p>
            <div className="oi-stage-stat-strip">
              <div>
                <span>Ready services</span>
                <strong>{readyServices}</strong>
              </div>
              <div>
                <span>Blocked integrations</span>
                <strong>{blockedIntegrations}</strong>
              </div>
              <div>
                <span>Critical blockers</span>
                <strong>{snapshot.blockers.length}</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section className="oi-stage-section">
        <div className="oi-stage-section-head">
          <div>
            <p className="oi-stage-overline">Readiness scorecards</p>
            <h2>Where the Neejee pilot is strong and where it is still gated</h2>
          </div>
          <p className="oi-stage-muted">
            These cards should become the operator-facing truth layer for onboarding, activation and client review.
          </p>
        </div>

        <div className="oi-stage-grid oi-stage-grid-4">
          {snapshot.readiness.map((item) => (
            <article key={item.slug} className="oi-stage-panel oi-stage-readiness-card" data-state={item.state}>
              <div className="oi-stage-row oi-stage-row-start">
                <p className="oi-stage-overline">{item.title}</p>
                <span className="oi-stage-pill" data-state={item.state}>
                  {stateLabel(item.state)}
                </span>
              </div>
              <div className="oi-stage-score-line">
                <strong>{item.score}</strong>
                <span>/ 100</span>
              </div>
              <p className="oi-stage-muted">{item.summary}</p>
              <p className="oi-stage-meta-line">Owner Ãƒâ€šÃ‚Â· {item.owner}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="oi-stage-section">
        <div className="oi-stage-section-head">
          <div>
            <p className="oi-stage-overline">Service configurator</p>
            <h2>Which service lanes are ready, blocked or intentionally deferred</h2>
          </div>
          <p className="oi-stage-muted">
            This should evolve into a billable entitlement and activation-control layer.
          </p>
        </div>

        <div className="oi-stage-grid oi-stage-grid-3">
          {snapshot.services.map((item) => (
            <ServiceCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="oi-stage-section">
        <div className="oi-stage-section-head">
          <div>
            <p className="oi-stage-overline">Integration checklist</p>
            <h2>Readiness by connected system, dependency and next action</h2>
          </div>
          <p className="oi-stage-muted">
            No channel should move into live execution unless its checklist state is explicit and auditable.
          </p>
        </div>

        <div className="oi-stage-grid oi-stage-grid-2">
          {snapshot.integrations.map((item) => (
            <IntegrationCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="oi-stage-dual-grid">
        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Activation timeline</p>
              <h2>How Neejee should progress into live operation</h2>
            </div>
          </div>

          <div className="oi-stage-timeline">
            {snapshot.timeline.map((item) => (
              <div key={item.slug} className="oi-stage-timeline-item" data-step-state={item.state}>
                <div className="oi-stage-timeline-rail" />
                <div className="oi-stage-timeline-content">
                  <div className="oi-stage-row oi-stage-row-start">
                    <h3>{item.title}</h3>
                    <span className="oi-stage-pill" data-step-state={item.state}>
                      {stepLabel(item.state)}
                    </span>
                  </div>
                  <p className="oi-stage-muted">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Critical decisions</p>
              <h2>What must be explicitly settled before activation</h2>
            </div>
          </div>

          <ul className="oi-stage-bullet-list">
            {snapshot.decisions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="oi-stage-divider" />

          <p className="oi-stage-overline">Neejee brand context</p>
          <ul className="oi-stage-bullet-list oi-stage-bullet-list-tight">
            {snapshot.brandContext.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="oi-stage-dual-grid">
        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Blockers and escalation</p>
              <h2>What still prevents a clean move into activation</h2>
            </div>
          </div>

          <div className="oi-stage-stack">
            {snapshot.blockers.map((item) => (
              <article key={item.title} className="oi-stage-blocker" data-severity={item.severity}>
                <div className="oi-stage-row oi-stage-row-start">
                  <h3>{item.title}</h3>
                  <span className="oi-stage-pill" data-severity={item.severity}>
                    {blockerLabel(item.severity)}
                  </span>
                </div>
                <p className="oi-stage-meta-line">Owner Ãƒâ€šÃ‚Â· {item.owner}</p>
                <p className="oi-stage-muted">{item.action}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="oi-stage-panel">
          <div className="oi-stage-section-head oi-stage-section-head-compact">
            <div>
              <p className="oi-stage-overline">Open operating tasks</p>
              <h2>Immediate work queue for the pilot team</h2>
            </div>
          </div>

          <div className="oi-stage-stack">
            {snapshot.tasks.map((item) => (
              <TaskCard key={item.title} item={item} />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}