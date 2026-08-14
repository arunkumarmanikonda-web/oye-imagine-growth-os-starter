import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { neejeeBrandTruth } from "@/lib/admin/neejee-brand-truth";
import {
  createLandingPageBriefRecord,
  type LandingPageBriefRecord,
} from "./landing-page-schema";

export function createDefaultLandingPageBriefFixture(): LandingPageBriefRecord {
  const workspaceDisplayName = getWorkspaceDisplayName();

  return createLandingPageBriefRecord({
    workspaceDisplayName,
    brandName: neejeeBrandTruth.identity.displayName,
    pilotId: "neejee-pilot",
    strategyId: "neejee-strategy-brief",
    status: "draft",
    hero: {
      headline: "Find craft worth knowing. Find something personal.",
      subheadline:
        "A provenance-led commerce page for discovering textiles, jewellery, accessories, home objects and meaningful gifts through maker, region, technique and story.",
      primaryCta: "Explore the collection",
      secondaryCta: "Discover the craft",
    },
    sections: [
      {
        id: "discovery",
        title: "Discovery before discount",
        description:
          "Help shoppers understand what makes a piece distinctive before asking them to buy it.",
        bullets: [
          "Maker, region, technique and material context",
          "Founder-led curation and editorial storytelling",
          "Clear route from discovery to relevant product detail",
        ],
      },
      {
        id: "commerce",
        title: "A clear path to purchase",
        description:
          "Keep the page commercially useful while preserving Neejee's quiet, personal and provenance-led brand posture.",
        bullets: [
          "Product discovery and collection pathways",
          "Trust and product-specific proof near the decision point",
          "Low-friction route to product, cart and checkout",
        ],
      },
      {
        id: "experience",
        title: "See it. Place it. Find the right one.",
        description:
          "Use relevant Neejee AI experiences to reduce uncertainty and deepen discovery rather than as generic AI decoration.",
        bullets: [
          "Mirror for wearable visualisation",
          "Space for home-object visualisation",
          "Concierge for guided product and gift discovery",
        ],
      },
    ],
    seoMeta: {
      title: "Neejee | Found. Personal. | Indian craft discovery and commerce",
      description:
        "Discover curated craft, textiles, jewellery, accessories, home objects and gifts through maker, region, technique and story at Neejee.",
      keywords: [
        "Neejee",
        "Indian craft",
        "artisan products",
        "sarees",
        "jewellery and accessories",
        "home craft",
        "gift discovery",
      ],
    },
    ctas: [
      "Explore the collection",
      "Discover the craft",
      "Find a meaningful gift",
    ],
    proofPoints: [
      "Maker, region and technique belong in approved product context",
      "Founder-led curation and editorial discovery",
      "AI-assisted try-on, home visualisation and gift discovery",
    ],
    assets: [
      {
        type: "logo",
        label: "Neejee approved logo",
        description: "Use the current approved Neejee brand asset from the client asset library.",
      },
      {
        type: "image",
        label: "Product and craft imagery",
        description:
          "Use approved product, maker, material, process or origin imagery with recorded rights/provenance.",
      },
      {
        type: "illustration",
        label: "Neejee AI discovery experience",
        description:
          "Show Mirror, Space or Concierge only when the relevant experience is actually available for the promoted product journey.",
      },
    ],
  });
}

export const defaultLandingPageBriefFixture = createDefaultLandingPageBriefFixture();
