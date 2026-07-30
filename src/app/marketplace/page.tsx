import { MarketplaceOfferSection, SupportStrip } from "@/components/foundation/public-shell";
import { buildMarketplaceOfferCards, buildSupportStripModel } from "@/lib/foundation/public-shell";

export default function MarketplacePage() {
  return (
    <>
      <section className="oi-container" style={{ paddingTop: 40, paddingBottom: 12 }}>
        <article className="oi-card">
          <div className="oi-pill">Marketplace</div>
          <h1 className="oi-page-title" style={{ marginTop: 12 }}>
            Marketplace service surfaces backed by the Batch A CMS foundation
          </h1>
          <p className="oi-page-subtitle">
            Promotional spaces, offers, CTA blocks, and service cards now resolve from the foundation layer created in Wave A1.
          </p>
        </article>
      </section>

      <MarketplaceOfferSection offers={buildMarketplaceOfferCards()} />
      <SupportStrip support={buildSupportStripModel()} />
    </>
  );
}