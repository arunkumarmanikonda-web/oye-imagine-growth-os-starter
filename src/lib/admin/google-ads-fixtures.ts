import { neejeeBrandTruth } from "@/lib/admin/neejee-brand-truth";
import {
  createGoogleAdsCampaignDraftRecord,
  type GoogleAdsCampaignDraftRecord,
} from "@/lib/admin/google-ads-schema";

export function createDefaultGoogleAdsCampaignDraftFixture(): GoogleAdsCampaignDraftRecord {
  return createGoogleAdsCampaignDraftRecord({
    pilotId: "neejee-pilot",
    workspaceId: "workspace_neejee_primary",
    workspaceDisplayName: process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME ?? "Oye !magine",
    brandName: neejeeBrandTruth.identity.displayName,
    objective:
      "Capture qualified product-discovery and purchase intent for Neejee while preserving provenance-led brand language.",
    landingPageUrl: neejeeBrandTruth.identity.website,
    geoTargets: ["India"],
    budgetDailyUsd: 45,
    keywordClusters: [
      {
        theme: "Indian craft discovery",
        keywords: [
          "buy Indian craft online",
          "curated Indian artisan products",
          "authentic Indian craft online",
        ],
      },
      {
        theme: "Category purchase intent",
        keywords: [
          "shop Indian sarees online",
          "Indian jewellery and accessories online",
          "Indian craft home decor online",
        ],
      },
    ],
    adCopy: [
      {
        headline1: "Discover Neejee",
        headline2: "Found. Personal.",
        description1:
          "Explore curated craft through maker, region, technique and story.",
        description2:
          "Find textiles, jewellery, accessories, home objects and meaningful gifts.",
      },
      {
        headline1: "Craft Worth Knowing",
        headline2: "Shop Curated Finds",
        description1:
          "Move from discovery to purchase with provenance-rich product context.",
        description2:
          "Quiet curation, distinctive products and a considered shopping journey.",
      },
    ],
    sitelinks: [
      "New Arrivals",
      "Founder's Edit",
      "Discover the Craft",
      "Gift Discovery",
    ],
  });
}
