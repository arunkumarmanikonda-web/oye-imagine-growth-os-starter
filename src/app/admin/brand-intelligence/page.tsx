import Link from "next/link";
import {
  getNeejeeBrandIntelligenceSnapshot,
  type ApprovalState,
  type AudienceArchetype,
  type BrandIdentityCard,
  type LanguageRule,
  type ProofGuardrail,
  type SignalState,
} from "@/lib/admin/brand-intelligence-seed";

function signalLabel(state: SignalState) {
  switch (state) {
    case "strong":
      return "Strong";
    case "watch":
      return "Watch";
    case "restricted":
      return "Restricted";
    default:
      return state;
  }
}

function approvalLabel(state: ApprovalState) {
  switch (state) {
    case "approved":
      return "Approved";
    case "review_required":
      return "Review required";
    case "draft":
      return "Draft";
    default:
      return state;
  }
}

function proofLabel(level: ProofGuardrail["level"]) {
  switch (level) {
    case "high":
      return "High control";
    case "medium":
      return "Medium control";
    case "baseline":
      return "Baseline";
    default:
      return level;
  }
}

function IdentityCard({ item }: { item: BrandIdentityCard }) {
  return (
    <article className="oi-bi-card" data-signal={item.state}>
      <div className="oi-bi-row">
        <p className="oi-bi-overline">{item.title}</p>
        <span className="oi-bi-pill" data-signal={item.state}>
          {signalLabel(item.state)}
        </span>
      </div>
      <p className="oi-bi-muted">{item.summary}</p>
    </article>
  );
}

function LanguageColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: LanguageRule[];
  tone: "approved" | "prohibited";
}) {
  return (
    <article className="oi-bi-panel">
      <div className="oi-bi-section-head oi-bi-section-head-compact">
        <div>
          <p className="oi-bi-overline">{title}</p>
          <h2>{title === "Approved language" ? "What the brand should sound like" : "What the brand should avoid"}</h2>
        </div>
      </div>

      <div className="oi-bi-stack">
        {items.map((item) => (
          <article key={item.phrase} className="oi-bi-rule-card" data-tone={tone}>
            <h3>{item.phrase}</h3>
            <p className="oi-bi-muted">{item.reason}</p>
          </article>
        ))}
      </div>
    </article>
  );
}

function AudienceCard({ item }: { item: AudienceArchetype }) {
  return (
    <article className="oi-bi-card oi-bi-card-tall">
      <p className="oi-bi-overline">Audience archetype</p>
      <h3>{item.title}</h3>
      <p className="oi-bi-muted">{item.summary}</p>
      <ul className="oi-bi-bullet-list oi-bi-bullet-list-tight">
        {item.motivations.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </article>
  );
}

export default function BrandIntelligencePage() {
  const snapshot = getNeejeeBrandIntelligenceSnapshot();

  return (
    <main className="oi-bi-shell">
      <section className="oi-bi-hero">
        <div className="oi-bi-hero-copy">
          <div className="oi-bi-row">
            <span className="oi-bi-badge">Neejee pilot</span>
            <span className="oi-bi-badge oi-bi-badge-subtle">
              {approvalLabel(snapshot.workspace.approvalState)}
            </span>
          </div>

          <p className="oi-bi-overline">Brand intelligence workspace</p>
          <h1>{snapshot.workspace.brand} brand intelligence</h1>
          <p className="oi-bi-lead">{snapshot.positioning.narrative}</p>

          <div className="oi-bi-microgrid">
            <div className="oi-bi-metric">
              <span>Brand essence</span>
              <strong>{snapshot.positioning.essence}</strong>
            </div>
            <div className="oi-bi-metric">
              <span>Profile status</span>
              <strong>{snapshot.workspace.profileStatus}</strong>
            </div>
            <div className="oi-bi-metric">
              <span>Owner</span>
              <strong>{snapshot.workspace.owner}</strong>
            </div>
            <div className="oi-bi-metric">
              <span>Updated</span>
              <strong>{snapshot.workspace.updatedAtLabel}</strong>
            </div>
          </div>

          <div className="oi-bi-actions">
            <Link href="/admin/onboarding" className="oi-bi-button oi-bi-button-primary">
              Back to onboarding
            </Link>
            <a href="/api/admin/brand-intelligence" className="oi-bi-button oi-bi-button-secondary">
              View brand intelligence API
            </a>
          </div>
        </div>

        <aside className="oi-bi-hero-side">
          <article className="oi-bi-panel oi-bi-focus-panel">
            <p className="oi-bi-overline">Positioning core</p>
            <h2>{snapshot.positioning.promise}</h2>
            <p className="oi-bi-muted">{snapshot.positioning.marketPosture}</p>
          </article>
        </aside>
      </section>

      <section className="oi-bi-section">
        <div className="oi-bi-section-head">
          <div>
            <p className="oi-bi-overline">Identity signals</p>
            <h2>What defines the Neejee brand system</h2>
          </div>
          <p className="oi-bi-muted">
            This workspace should become the governance layer for strategy, copy, creative, landing pages and campaign decisions.
          </p>
        </div>

        <div className="oi-bi-grid oi-bi-grid-3">
          {snapshot.identityCards.map((item) => (
            <IdentityCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="oi-bi-grid oi-bi-grid-2">
        <LanguageColumn title="Approved language" items={snapshot.approvedLanguage} tone="approved" />
        <LanguageColumn title="Prohibited language" items={snapshot.prohibitedLanguage} tone="prohibited" />
      </section>

      <section className="oi-bi-section">
        <div className="oi-bi-section-head">
          <div>
            <p className="oi-bi-overline">Customer understanding</p>
            <h2>Who the brand should speak to and why they care</h2>
          </div>
        </div>

        <div className="oi-bi-grid oi-bi-grid-3">
          {snapshot.audienceArchetypes.map((item) => (
            <AudienceCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="oi-bi-grid oi-bi-grid-2">
        <article className="oi-bi-panel">
          <div className="oi-bi-section-head oi-bi-section-head-compact">
            <div>
              <p className="oi-bi-overline">Emotional drivers</p>
              <h2>What should emotionally move the customer</h2>
            </div>
          </div>
          <ul className="oi-bi-bullet-list">
            {snapshot.emotionalDrivers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="oi-bi-divider" />

          <p className="oi-bi-overline">Channel posture</p>
          <ul className="oi-bi-bullet-list oi-bi-bullet-list-tight">
            {snapshot.channelPosture.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="oi-bi-panel">
          <div className="oi-bi-section-head oi-bi-section-head-compact">
            <div>
              <p className="oi-bi-overline">Visual direction</p>
              <h2>How the brand should look and feel</h2>
            </div>
          </div>
          <ul className="oi-bi-bullet-list">
            {snapshot.visualDirection.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="oi-bi-grid oi-bi-grid-2">
        <article className="oi-bi-panel">
          <div className="oi-bi-section-head oi-bi-section-head-compact">
            <div>
              <p className="oi-bi-overline">Proof and claims guardrails</p>
              <h2>What requires elevated discipline before publication</h2>
            </div>
          </div>

          <div className="oi-bi-stack">
            {snapshot.proofGuardrails.map((item) => (
              <article key={item.title} className="oi-bi-rule-card" data-tone="guardrail">
                <div className="oi-bi-row">
                  <h3>{item.title}</h3>
                  <span className="oi-bi-pill" data-proof={item.level}>
                    {proofLabel(item.level)}
                  </span>
                </div>
                <p className="oi-bi-muted">{item.guidance}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="oi-bi-panel">
          <div className="oi-bi-section-head oi-bi-section-head-compact">
            <div>
              <p className="oi-bi-overline">Competitor signals</p>
              <h2>Where Neejee should differentiate</h2>
            </div>
          </div>

          <div className="oi-bi-stack">
            {snapshot.competitorSignals.map((item) => (
              <article key={item.brand} className="oi-bi-rule-card" data-tone="neutral">
                <h3>{item.brand}</h3>
                <p className="oi-bi-meta-line">Posture · {item.posture}</p>
                <p className="oi-bi-muted">{item.signal}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="oi-bi-panel">
        <div className="oi-bi-section-head oi-bi-section-head-compact">
          <div>
            <p className="oi-bi-overline">Decision log</p>
            <h2>Questions that should shape the next brand-intelligence pass</h2>
          </div>
        </div>

        <ul className="oi-bi-bullet-list">
          {snapshot.decisions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}