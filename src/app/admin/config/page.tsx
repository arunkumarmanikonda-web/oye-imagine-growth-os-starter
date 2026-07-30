import Link from "next/link";
import {
  cmsSeedFaqs,
  cmsSeedPages,
  cmsSeedPeople,
  cmsSeedPromotions,
  cmsSeedSections,
  getCmsControllerSummary,
  oyeImagineOrganizationProfile,
  oyeImagineSupportChannels,
  oyeImagineSupportMailLogSeed,
} from "@/lib/foundation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const statCards = [
  { label: "Pages", value: cmsSeedPages.length.toString() },
  { label: "Sections", value: cmsSeedSections.length.toString() },
  { label: "Promotions", value: cmsSeedPromotions.length.toString() },
  { label: "People", value: cmsSeedPeople.length.toString() },
  { label: "FAQ", value: cmsSeedFaqs.length.toString() },
  { label: "Support channels", value: oyeImagineSupportChannels.length.toString() },
];

export default function AdminConfigPage() {
  const summary = getCmsControllerSummary();

  return (
    <main className="oi-shell">
      <div className="oi-main">
        <div className="oi-container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="oi-stage-head">
            <div>
              <div className="oi-pill">Mega Batch A · Wave A1</div>
              <h1 className="oi-page-title">Config and CMS control center</h1>
              <p className="oi-page-subtitle">
                Legal identity, support channels, canonical CMS seeds, banners, offers, leadership,
                experts, FAQ, and publish-control foundations.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="oi-btn oi-btn--secondary" href="/admin/settings">
                Workspace settings
              </Link>
              <Link className="oi-btn oi-btn--secondary" href="/admin/content">
                Content studio
              </Link>
              <a className="oi-btn oi-btn--primary" href="mailto:hello@oyeimagine.com">
                Email hello@oyeimagine.com
              </a>
            </div>
          </div>

          <section className="oi-grid oi-grid--stats" style={{ marginTop: 24 }}>
            {statCards.map((card) => (
              <article key={card.label} className="oi-card">
                <div className="oi-kpi-label">{card.label}</div>
                <div className="oi-kpi-value">{card.value}</div>
              </article>
            ))}
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">Legal and tax identity</div>
              <div className="oi-meta-line"><strong>Legal name:</strong> {oyeImagineOrganizationProfile.legalName}</div>
              <div className="oi-meta-line"><strong>CIN:</strong> {oyeImagineOrganizationProfile.cin}</div>
              <div className="oi-meta-line"><strong>GSTIN:</strong> {oyeImagineOrganizationProfile.gstin}</div>
              <div className="oi-meta-line"><strong>PAN:</strong> {oyeImagineOrganizationProfile.pan}</div>
              <div className="oi-meta-line"><strong>TAN:</strong> {oyeImagineOrganizationProfile.tan}</div>
              <div className="oi-meta-line">
                <strong>Address:</strong> {oyeImagineOrganizationProfile.address.line1}, {oyeImagineOrganizationProfile.address.line2},{" "}
                {oyeImagineOrganizationProfile.address.city}, {oyeImagineOrganizationProfile.address.state}{" "}
                {oyeImagineOrganizationProfile.address.postalCode}, {oyeImagineOrganizationProfile.address.country}
              </div>
              <div className="oi-meta-line"><strong>Primary email:</strong> {oyeImagineOrganizationProfile.supportMailbox}</div>
              <div className="oi-meta-line"><strong>Primary phone:</strong> {oyeImagineOrganizationProfile.contactPhones[0]?.value}</div>
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {oyeImagineOrganizationProfile.legalDocuments.map((doc) => (
                  <a key={doc.url} className="oi-btn oi-btn--secondary" href={doc.url} target="_blank" rel="noreferrer">
                    {doc.label}
                  </a>
                ))}
              </div>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">CMS controller summary</div>
              <div className="oi-meta-line"><strong>Editable surfaces:</strong> {summary.editableSurfaceCount}</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {summary.editableSurfaces.map((surface) => (
                  <li key={surface}>{surface}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">Support channels</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {oyeImagineSupportChannels.map((channel) => (
                  <li key={channel.key}>
                    <strong>{channel.label}:</strong> {channel.destination}{" "}
                    <span className="oi-muted">({channel.type}{channel.provider ? ` · ${channel.provider}` : ""})</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">Seed mail logs</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {oyeImagineSupportMailLogSeed.map((mail) => (
                  <li key={mail.id}>
                    <strong>{mail.status}</strong> · {mail.subject} · {mail.toEmail}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="oi-grid oi-grid--two" style={{ marginTop: 24 }}>
            <article className="oi-card">
              <div className="oi-card-title">Page registry</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {cmsSeedPages.map((page) => (
                  <li key={page.slug}>
                    <strong>{page.title}</strong> · {page.slug} · {page.audience} · {page.status}
                  </li>
                ))}
              </ul>
            </article>

            <article className="oi-card">
              <div className="oi-card-title">Promo and people registry</div>
              <ul className="oi-list" style={{ marginTop: 12 }}>
                {cmsSeedPromotions.map((promotion) => (
                  <li key={promotion.slug}>
                    <strong>{promotion.title}</strong> · {promotion.placement}
                  </li>
                ))}
                {cmsSeedPeople.map((person) => (
                  <li key={person.slug}>
                    <strong>{person.displayName}</strong> · {person.profileType} · {person.team}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}