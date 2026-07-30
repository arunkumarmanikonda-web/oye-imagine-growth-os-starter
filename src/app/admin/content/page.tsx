import Link from "next/link";
import {
  buildCmsMutationPlan,
  buildCmsStudioSectionCards,
  getCmsRegistrySummary,
} from "@/lib/cms/control-plane";
import { buildCmsAiSuggestionBundle, listCmsAiCapabilities } from "@/lib/cms/ai-assist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminContentPage() {
  const summary = getCmsRegistrySummary();
  const studioCards = buildCmsStudioSectionCards();
  const aiCapabilities = listCmsAiCapabilities();
  const samplePlan = buildCmsMutationPlan("promotion", "promo-growth-audit", "publish");
  const sampleAi = buildCmsAiSuggestionBundle({
    entityType: "promotion",
    prompt: "AI growth audit offer for premium brands",
  });

  return (
    <main className="oi-shell">
      <div className="oi-main">
        <div className="oi-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="oi-stage-head">
            <div>
              <div className="oi-pill">Mega Batch A · A3</div>
              <h1 className="oi-page-title">Admin content studio</h1>
              <p className="oi-page-subtitle">
                CMS registry, publish planning, and AI-assisted content operations for visible UI surfaces.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="oi-btn oi-btn--secondary" href="/admin/config">
                Config control
              </Link>
              <Link className="oi-btn oi-btn--secondary" href="/admin/support">
                Support ops
              </Link>
              <a className="oi-btn oi-btn--primary" href="mailto:hello@oyeimagine.com">
                Content escalation
              </a>
            </div>
          </div>

          <section className="oi-grid oi-grid--stats" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-kpi-label">Collections</div>
              <div className="oi-kpi-value">{summary.totalCollections}</div>
            </article>
            <article className="oi-card">
              <div className="oi-kpi-label">Managed items</div>
              <div className="oi-kpi-value">{summary.totalManagedItems}</div>
            </article>
            <article className="oi-card">
              <div className="oi-kpi-label">Surface families</div>
              <div className="oi-kpi-value">{summary.totalVisibleSurfaceFamilies}</div>
            </article>
          </section>

          <section className="oi-grid oi-grid--three" style={{ marginTop: 24 }}>
            {studioCards.map((card) => (
              <article key={card.entityType} className="oi-card">
                <div className="oi-card-title">{card.title}</div>
                <p className="oi-page-subtitle" style={{ marginTop: 8 }}>{card.description}</p>
                <div className="oi-meta-line" style={{ marginTop: 12 }}>
                  <strong>Count:</strong> {card.itemCount}
                </div>
              </article>
            ))}
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">Publish and mutation planning</div>
              <div className="oi-meta-line" style={{ marginTop: 12 }}>
                <strong>Entity:</strong> {samplePlan.entityType}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Slug:</strong> {samplePlan.slug}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Action:</strong> {samplePlan.action}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Review required:</strong> {String(samplePlan.requiresReview)}
              </div>
              <div className="oi-meta-line" style={{ marginTop: 8 }}>
                <strong>Status:</strong> {samplePlan.status}
              </div>
              <p className="oi-page-subtitle" style={{ marginTop: 12 }}>{samplePlan.summary}</p>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">AI-assisted content suggestion</div>
              <div className="oi-meta-line" style={{ marginTop: 12 }}>
                <strong>Title:</strong> {sampleAi.title}
              </div>
              <p className="oi-page-subtitle" style={{ marginTop: 8 }}>{sampleAi.summary}</p>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {sampleAi.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <div className="oi-meta-line" style={{ marginTop: 12 }}>
                <strong>CTA:</strong> {sampleAi.ctaLabel}
              </div>
            </article>
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">AI capabilities</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {aiCapabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">Batch A closure hardening</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                <li>Support operations workspace linked</li>
                <li>Resend runtime status visible to operators</li>
                <li>Mail-log lifecycle visible to admin users</li>
                <li>Config, content, support, and route protection now form the full Batch A spine</li>
              </ul>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}