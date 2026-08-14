import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { neejeeBrandTruth } from "@/lib/admin/neejee-brand-truth";
import {
  createStrategyBriefRecord,
  type StrategyBriefRecord,
} from "./strategy-schema";

export function createDefaultStrategyBriefFixture(): StrategyBriefRecord {
  const workspaceDisplayName = getWorkspaceDisplayName();

  return createStrategyBriefRecord({
    workspaceDisplayName,
    brandName: neejeeBrandTruth.identity.displayName,
    pilotId: "neejee-pilot",
    status: "draft",
    positioning:
      "Neejee should win through founder-led discovery, provenance and quiet editorial commerce: make the maker, region, technique and meaning of each product easier to discover without turning the experience into a generic discount marketplace.",
    offerSummary: neejeeBrandTruth.business.model,
    marketSummary:
      "Customers can find Indian craft across many marketplaces, but Neejee's opportunity is to make authentic, provenance-led discovery feel curated, personal and trustworthy across textiles, jewellery, accessories, home objects, art, decor and gifting.",
    messagingPillars: [
      {
        title: "Found with provenance",
        description:
          "Lead with maker, region, technique, material and origin so discovery carries meaning rather than only a product title and price.",
      },
      {
        title: "Personal discovery",
        description:
          "Use founder curation, editorial storytelling, gifting and AI-assisted discovery to help shoppers find products that feel considered rather than anonymous.",
      },
      {
        title: "Commerce with restraint",
        description:
          "Build conversion around clarity, trust, product context and ease of purchase without allowing discount language to dominate the brand.",
      },
    ],
    audienceSegments: [
      {
        name: "Craft- and design-conscious shoppers",
        painPoints: [
          "Authentic products are difficult to discover online",
          "Mass marketplaces strip away maker and provenance context",
          "It is hard to judge distinctiveness and trust from anonymous listings",
        ],
        buyingSignals: [
          "Searches by craft, region, technique, material or category",
          "Engages with maker stories, journal content or curated edits",
          "Uses product visualisation or comparison before purchase",
        ],
      },
      {
        name: "Meaning-led gift and home buyers",
        painPoints: [
          "Generic gifts feel impersonal",
          "Home and lifestyle purchases are hard to imagine in context",
          "Curated, story-rich products are scattered across sources",
        ],
        buyingSignals: [
          "Browses founder edits and new arrivals",
          "Uses Concierge or Space for guided discovery",
          "Returns to journal, collections or email drops",
        ],
      },
    ],
    channelRecommendations: [
      {
        channel: "SEO",
        objective: "Capture product, craft, technique, region and care/discovery intent",
        rationale: neejeeBrandTruth.growth.channelIntent.seo,
      },
      {
        channel: "Google Ads",
        objective: "Capture purchase and high-intent product discovery",
        rationale: neejeeBrandTruth.growth.channelIntent.googleAds,
      },
      {
        channel: "Meta Ads",
        objective: "Drive visual discovery, retargeting and commerce conversion",
        rationale: neejeeBrandTruth.growth.channelIntent.metaAds,
      },
    ],
    plan30Days: [
      {
        label: "Truth and measurement",
        actions: [
          "Lock category, provenance and claims taxonomy from live catalogue data",
          "Map ecommerce events from product view through purchase",
          "Build initial search and creative themes from real products, crafts and regions",
        ],
      },
    ],
    plan60Days: [
      {
        label: "Controlled launch",
        actions: [
          "Launch provenance-rich SEO and landing experiments",
          "Run approved paid-search and visual-discovery tests only after provider verification",
          "Start lifecycle journeys around new arrivals, discovery and cart/purchase behaviour",
        ],
      },
    ],
    plan90Days: [
      {
        label: "Learn and scale",
        actions: [
          "Scale categories, queries and creative themes with verified purchase evidence",
          "Increase use of Mirror, Space and Concierge where they improve discovery",
          "Refine acquisition and retention by product, craft, audience and channel economics",
        ],
      },
    ],
    successMetrics: [...neejeeBrandTruth.growth.primaryMetrics],
    assumptions: [
      "Product, catalogue and ecommerce analytics data can be ingested with sufficient freshness",
      "Provenance and product claims used in campaigns are backed by approved source data",
      "External channel execution remains approval-gated until provider-side verification is complete",
    ],
    blockers: [
      "Live paid-media execution remains blocked until provider account and external resource-ID verification exists",
      "Time-sensitive commercial claims must be refreshed from Neejee before publication",
    ],
  });
}

export const defaultStrategyBriefFixture = createDefaultStrategyBriefFixture();
