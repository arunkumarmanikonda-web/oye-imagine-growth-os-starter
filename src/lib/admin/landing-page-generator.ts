import { getPilot } from "@/lib/admin/pilot-store";
import { getStrategyBrief } from "@/lib/admin/strategy-store";
import {
  isNeejeeContext,
  neejeeBrandTruth,
} from "@/lib/admin/neejee-brand-truth";
import {
  createDefaultLandingPageBrief,
  getLandingPageBrief,
  saveLandingPageBrief,
} from "@/lib/admin/landing-page-store";
import type {
  LandingPageBriefRecord,
  LandingPageSection,
} from "@/lib/admin/landing-page-schema";
import type { NeejeePilotRecord } from "@/lib/admin/pilot-schema";
import type { StrategyBriefRecord } from "@/lib/admin/strategy-schema";

export type GenerateLandingPageBriefOptions = {
  pilotId?: string;
  forceRegenerate?: boolean;
};

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return readString(record.label ?? record.title ?? record.name ?? record.value, "");
      }
      return "";
    })
    .filter(Boolean);
}

function pickBrandName(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
): string {
  const strategyRecord = (strategy ?? null) as unknown as Record<string, unknown>;
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  return (
    readString(strategyRecord.brandName) ||
    readString(pilotRecord.brandName) ||
    readString(pilotRecord.workspaceDisplayName) ||
    "Client"
  );
}

function pickAudience(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) return [];
  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const audienceSegments = strategyRecord.audienceSegments;
  if (!Array.isArray(audienceSegments)) return [];
  return audienceSegments
    .map((segment) => {
      if (!segment || typeof segment !== "object") return "";
      const record = segment as Record<string, unknown>;
      return readString(record.name ?? record.label ?? record.title, "");
    })
    .filter(Boolean);
}

function pickChannels(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) return [];
  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const channels = strategyRecord.channelRecommendations;
  if (!Array.isArray(channels)) return [];
  return channels
    .map((channel) => {
      if (!channel || typeof channel !== "object") return "";
      const record = channel as Record<string, unknown>;
      return readString(record.channel ?? record.name ?? record.label, "");
    })
    .filter(Boolean);
}

function pickPillars(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) return [];
  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const pillars = strategyRecord.messagingPillars ?? strategyRecord.pillars;
  if (!Array.isArray(pillars)) return [];
  return pillars
    .map((pillar) => {
      if (!pillar || typeof pillar !== "object") return "";
      const record = pillar as Record<string, unknown>;
      return readString(record.title ?? record.name ?? record.label, "");
    })
    .filter(Boolean);
}

function buildNeejeeLandingPageBrief(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
): LandingPageBriefRecord {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const strategyRecord = (strategy ?? null) as unknown as Record<string, unknown>;
  const pilotId = readString(pilotRecord.pilotId, pilot.id || "neejee-pilot");
  const workspaceId = readString(pilotRecord.workspaceId, "workspace_neejee_primary");
  const workspaceDisplayName = readString(pilotRecord.workspaceDisplayName, "Oye !magine");
  const channels = pickChannels(strategy);
  const audience = pickAudience(strategy);
  const pillars = pickPillars(strategy);

  const brief = createDefaultLandingPageBrief();
  const record = brief as unknown as Record<string, any>;

  record.pilotId = pilotId;
  record.workspaceId = workspaceId;
  record.workspaceDisplayName = workspaceDisplayName;
  record.status = "draft";
  record.brandName = neejeeBrandTruth.identity.displayName;
  record.objective =
    "Move relevant shoppers from craft and product discovery into product views, add-to-cart and completed purchases while preserving provenance and brand restraint.";
  record.audienceSummary =
    audience.length > 0 ? audience.join(", ") : neejeeBrandTruth.audience.slice(0, 3).join(", ");
  record.positioningStatement =
    "Neejee makes authentic craft easier to find, understand and buy by connecting product discovery with maker, region, technique, story and a considered commerce experience.";

  record.hero = {
    eyebrow: `${neejeeBrandTruth.identity.displayName} · ${neejeeBrandTruth.identity.tagline}`,
    headline: "Find craft worth knowing. Find something personal.",
    subheadline:
      "Discover textiles, jewellery, accessories, home objects and meaningful gifts through the people, places and techniques behind them.",
    primaryCta: "Explore the collection",
    secondaryCta: "Discover the craft",
  };

  record.ctas = [
    { label: "Explore the collection", href: neejeeBrandTruth.identity.website, variant: "primary" },
    { label: "Discover the craft", href: `${neejeeBrandTruth.identity.website}/about`, variant: "secondary" },
    { label: "Find a meaningful gift", href: neejeeBrandTruth.identity.website, variant: "secondary" },
  ];

  const pillarBullets = pillars.length > 0
    ? pillars.slice(0, 3)
    : ["Maker and origin context", "Founder-led curation", "Quiet, provenance-led commerce"];

  record.sections = [
    {
      id: "discovery",
      title: "Discovery before discount",
      description:
        "Give the shopper a reason to care about the piece before reducing it to price, promotion or generic catalogue language.",
      bullets: [
        "Maker, region, technique and material context",
        "Relevant product and collection pathways",
        "Editorial stories that deepen discovery without blocking purchase",
      ],
    },
    {
      id: "provenance",
      title: "Why this piece belongs here",
      description:
        "Use only approved product-specific provenance and authenticity evidence; do not generalise claims that are not backed by source data.",
      bullets: pillarBullets,
    },
    {
      id: "experience",
      title: "Help shoppers imagine the product in their life",
      description:
        "Use Neejee AI only where it meaningfully reduces uncertainty or helps discovery.",
      bullets: [
        "Mirror for wearable visualisation",
        "Space for home-object visualisation",
        "Concierge for guided product and gift discovery",
      ],
    },
    {
      id: "conversion",
      title: "Make the next commercial action obvious",
      description:
        "The landing experience should connect discovery to a product, collection or relevant purchase path rather than a generic lead form.",
      bullets: [
        "Primary conversion: product or collection exploration",
        "Commerce outcomes: product view, add-to-cart, checkout and purchase",
        "Secondary retention: relevant email subscription or return discovery",
      ],
    },
  ] satisfies LandingPageSection[];

  record.proofPoints = [
    {
      label: "Provenance-led discovery",
      value: "Maker, region, technique and material belong in the product story when source evidence exists.",
    },
    {
      label: "Strategic channel alignment",
      value:
        channels.length > 0
          ? `Supports relevant demand from ${channels.slice(0, 3).join(", ")}.`
          : "Supports search, visual discovery and lifecycle commerce journeys.",
    },
    {
      label: "AI with a shopping purpose",
      value: "Mirror, Space and Concierge are used as discovery/visualisation utilities rather than decorative AI claims.",
    },
  ];

  record.assets = [
    {
      type: "logo",
      label: "Neejee approved logo",
      url: "",
      description: "Resolve the approved logo from the Neejee tenant asset bucket rather than a generic Oye asset.",
    },
    {
      type: "image",
      label: "Approved product/craft imagery",
      url: "",
      description: "Use product, maker, process, material or origin imagery with rights/provenance metadata.",
    },
  ];

  record.generatedFrom = {
    strategyStatus: readString(strategyRecord.status, "draft"),
    strategyUpdatedAt: readString(strategyRecord.updatedAt),
    pilotUpdatedAt: readString(pilotRecord.updatedAt),
  };

  if (!record.seo || typeof record.seo !== "object") record.seo = {};
  record.seo.title = "Neejee | Found. Personal. | Indian craft discovery and commerce";
  record.seo.description =
    "Discover curated textiles, jewellery, accessories, home objects and gifts through maker, region, technique and story at Neejee.";
  record.seo.keywords = [
    "Neejee",
    "Indian craft",
    "artisan products",
    "sarees",
    "jewellery and accessories",
    "home craft",
    "gift discovery",
  ];

  return brief;
}

function buildGenericSections(
  brandName: string,
  offer: string,
  audience: string[],
  pillars: string[],
): LandingPageSection[] {
  const audienceLine = audience.length > 0 ? audience.join(", ") : "high-intent prospects";
  const pillarBullets = pillars.length > 0
    ? pillars.slice(0, 3)
    : ["Clear value proposition", "Trust-building proof", "Low-friction next action"];

  return [
    {
      id: "problem",
      title: `Why ${offer} decisions stall`,
      description: `${brandName} needs a landing page that reduces uncertainty and gives visitors a clear next action.`,
      bullets: [
        "Prospects need fast clarity on fit, value and timeline",
        "The page should remove friction before conversion",
        "Proof and process should appear close to the decision point",
      ],
    },
    {
      id: "solution",
      title: `How ${brandName} helps`,
      description: `Position ${brandName} around a clear, credible path to ${offer}.`,
      bullets: pillarBullets,
    },
    {
      id: "audience",
      title: "Who this page is for",
      description: `Primary audience: ${audienceLine}.`,
      bullets: ["Visitors researching options", "Warm prospects comparing alternatives", "Decision-makers needing faster clarity"],
    },
    {
      id: "cta",
      title: "Primary conversion path",
      description: "Drive visitors to one relevant next action with clear expectation setting.",
      bullets: ["Primary CTA: Continue", "Secondary CTA: Learn more", "Keep friction proportionate to user intent"],
    },
  ];
}

export function buildLandingPageBriefFromPilot(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
): LandingPageBriefRecord {
  if (isNeejeeContext(pilot)) {
    return buildNeejeeLandingPageBrief(pilot, strategy);
  }

  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const strategyRecord = (strategy ?? null) as unknown as Record<string, unknown>;
  const pilotId = readString(pilotRecord.pilotId, pilot.id || "pilot");
  const workspaceId = readString(pilotRecord.workspaceId, "default-workspace");
  const workspaceDisplayName = readString(pilotRecord.workspaceDisplayName, "Oye !magine");
  const brandName = pickBrandName(pilot, strategy);
  const offer = readString(pilotRecord.offer, "the core offer");
  const audience = pickAudience(strategy);
  const pillars = pickPillars(strategy);
  const channels = pickChannels(strategy);

  const brief = createDefaultLandingPageBrief();
  const record = brief as unknown as Record<string, any>;
  record.pilotId = pilotId;
  record.workspaceId = workspaceId;
  record.workspaceDisplayName = workspaceDisplayName;
  record.status = "draft";
  record.brandName = brandName;
  record.objective = `Convert qualified demand for ${offer} into a relevant next action.`;
  record.audienceSummary = audience.length > 0 ? audience.join(", ") : "High-intent prospects actively evaluating options.";
  record.positioningStatement = `${brandName} should present a clear, trustworthy path from first visit to the next commercial action.`;
  record.hero = {
    eyebrow: `${brandName} landing page brief`,
    headline: `Take a confident next step with ${brandName}`,
    subheadline: `Turn relevant visitors into qualified action with a focused page around ${offer}.`,
    primaryCta: "Continue",
    secondaryCta: "Learn more",
  };
  record.ctas = [
    { label: "Continue", href: "/contact", variant: "primary" },
    { label: "Learn more", href: "/contact?intent=talk", variant: "secondary" },
  ];
  record.sections = buildGenericSections(brandName, offer, audience, pillars);
  record.proofPoints = [
    { label: "Clear value proposition", value: `${brandName} makes the next step clear and low friction.` },
    {
      label: "Strategic channel alignment",
      value: channels.length > 0 ? `Supports demand from ${channels.slice(0, 3).join(", ")}.` : "Supports relevant acquisition channels.",
    },
    { label: "Trust-first UX", value: "Balances credibility, clarity and conversion focus." },
  ];
  record.generatedFrom = {
    strategyStatus: readString(strategyRecord.status, "draft"),
    strategyUpdatedAt: readString(strategyRecord.updatedAt),
    pilotUpdatedAt: readString(pilotRecord.updatedAt),
  };
  if (!record.seo || typeof record.seo !== "object") record.seo = {};
  record.seo.title = `${brandName} | ${offer}`;
  record.seo.description = `Landing page brief for ${brandName} focused on qualified conversion around ${offer}.`;
  record.seo.keywords = [brandName, offer, workspaceDisplayName, "landing page brief"];
  return brief;
}

export function generateLandingPageBrief(
  options: GenerateLandingPageBriefOptions = {},
): LandingPageBriefRecord {
  const pilotId = options.pilotId ?? "neejee-pilot";

  if (!options.forceRegenerate) {
    const existing = getLandingPageBrief();
    if (existing && (existing as unknown as Record<string, unknown>).pilotId === pilotId) {
      return existing;
    }
  }

  const pilot = getPilot();
  if (!pilot || (pilot as unknown as Record<string, unknown>).pilotId !== pilotId) {
    const stableId = (pilot as unknown as Record<string, unknown> | null)?.id;
    if (stableId !== pilotId) throw new Error(`Pilot not found: ${pilotId}`);
  }

  const strategyCandidate = getStrategyBrief();
  const strategy =
    strategyCandidate &&
    (strategyCandidate as unknown as Record<string, unknown>).pilotId === pilotId
      ? strategyCandidate
      : null;
  const brief = buildLandingPageBriefFromPilot(pilot, strategy);
  return saveLandingPageBrief(brief);
}
