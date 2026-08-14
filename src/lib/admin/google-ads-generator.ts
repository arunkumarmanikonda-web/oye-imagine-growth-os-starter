import { getPilot } from "@/lib/admin/pilot-store";
import { getStrategyBrief } from "@/lib/admin/strategy-store";
import { getLandingPageBrief } from "@/lib/admin/landing-page-store";
import {
  getGoogleAdsDraft,
  saveGoogleAdsDraft,
} from "@/lib/admin/google-ads-store";
import {
  isNeejeeContext,
  neejeeBrandTruth,
} from "@/lib/admin/neejee-brand-truth";
import {
  createGoogleAdsCampaignDraftRecord,
  type GoogleAdsCampaignDraftRecord,
} from "@/lib/admin/google-ads-schema";
import type { NeejeePilotRecord } from "@/lib/admin/pilot-schema";
import type { StrategyBriefRecord } from "@/lib/admin/strategy-schema";

export type GenerateGoogleAdsDraftOptions = {
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

function firstNonEmptyArray(...values: unknown[]): string[] {
  for (const value of values) {
    const items = readStringArray(value);
    if (items.length > 0) return items;
  }
  return [];
}

function pickBrandName(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
): string {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const strategyRecord = (strategy ?? null) as unknown as Record<string, unknown>;
  return (
    readString(strategyRecord.brandName) ||
    readString(pilotRecord.brandName) ||
    readString(pilotRecord.workspaceDisplayName) ||
    "Client"
  );
}

function pickOffer(pilot: NeejeePilotRecord): string {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const namedCategories = firstNonEmptyArray(
    pilotRecord.productCategories,
    pilotRecord.categories,
    pilotRecord.products,
    pilotRecord.services,
  );
  if (namedCategories.length > 0) return namedCategories[0];
  return readString(pilotRecord.offer, "core offer");
}

function pickGeoTargets(pilot: NeejeePilotRecord): string[] {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const explicit = firstNonEmptyArray(
    pilotRecord.geoTargets,
    pilotRecord.locations,
    pilotRecord.cities,
  );
  if (explicit.length > 0) return explicit;
  const geo = readString(pilotRecord.geo);
  return geo ? [geo] : [];
}

function pickAudience(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) return [];
  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const segments = strategyRecord.audienceSegments;
  if (!Array.isArray(segments)) return [];
  return segments
    .map((segment) => {
      if (typeof segment === "string") return segment.trim();
      if (!segment || typeof segment !== "object") return "";
      const record = segment as Record<string, unknown>;
      return readString(record.name ?? record.label ?? record.title, "");
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
      if (typeof pillar === "string") return pillar.trim();
      if (!pillar || typeof pillar !== "object") return "";
      const record = pillar as Record<string, unknown>;
      return readString(record.title ?? record.name ?? record.label, "");
    })
    .filter(Boolean);
}

function pickLandingPageUrl(pilotId: string, landingPage?: unknown): string {
  const record = (landingPage ?? null) as Record<string, unknown> | null;
  return readString(record?.landingPageUrl) || readString(record?.url) || `/landing/${pilotId}`;
}

function buildNeejeeDraft(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
  landingPage?: unknown,
): GoogleAdsCampaignDraftRecord {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const pilotId = readString(pilotRecord.pilotId, pilot.id || "neejee-pilot");
  const workspaceId = readString(pilotRecord.workspaceId, "workspace_neejee_primary");
  const workspaceDisplayName = readString(pilotRecord.workspaceDisplayName, "Oye !magine");
  const audience = pickAudience(strategy);
  const pillars = pickPillars(strategy);
  const audiencePhrase = audience[0]?.toLowerCase() || "craft-conscious online shoppers";
  const pillarLine = pillars.length > 0
    ? pillars.slice(0, 2).join(" • ")
    : "Founder-led curation • Provenance-rich discovery";

  return createGoogleAdsCampaignDraftRecord({
    pilotId,
    workspaceId,
    workspaceDisplayName,
    status: "draft",
    brandName: neejeeBrandTruth.identity.displayName,
    objective:
      "Capture qualified product-discovery and purchase intent for Neejee while preserving provenance-led brand language.",
    landingPageUrl: pickLandingPageUrl(pilotId, landingPage) || neejeeBrandTruth.identity.website,
    geoTargets: pickGeoTargets(pilot).length > 0 ? pickGeoTargets(pilot) : ["India"],
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
        theme: "Category and audience purchase intent",
        keywords: [
          `${audiencePhrase} Indian craft`,
          "shop Indian sarees online",
          "Indian jewellery accessories online",
          "Indian craft home decor online",
        ],
      },
    ],
    adCopy: [
      {
        headline1: "Discover Neejee",
        headline2: "Found. Personal.",
        description1: "Explore curated craft through maker, region, technique and story.",
        description2: pillarLine,
      },
      {
        headline1: "Craft Worth Knowing",
        headline2: "Shop Curated Finds",
        description1: "Find textiles, jewellery, accessories, home objects and meaningful gifts.",
        description2: "Quiet curation, distinctive products and a considered shopping journey.",
      },
    ],
    sitelinks: ["New Arrivals", "Founder's Edit", "Discover the Craft", "Gift Discovery"],
  });
}

function buildGenericDraft(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
  landingPage?: unknown,
): GoogleAdsCampaignDraftRecord {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const strategyRecord = (strategy ?? null) as unknown as Record<string, unknown>;
  const pilotId = readString(pilotRecord.pilotId, pilot.id || "pilot");
  const workspaceId = readString(pilotRecord.workspaceId, "oye-imagine");
  const workspaceDisplayName = readString(pilotRecord.workspaceDisplayName, "Oye !magine");
  const brandName = pickBrandName(pilot, strategy);
  const offer = pickOffer(pilot);
  const audience = pickAudience(strategy);
  const pillars = pickPillars(strategy);
  const lowerOffer = offer.toLowerCase();
  const audiencePhrase = audience[0]?.toLowerCase() || "high-intent prospects";
  const pillarLine = pillars.length > 0 ? pillars.slice(0, 2).join(" • ") : "Clear value • Credible next step";

  return createGoogleAdsCampaignDraftRecord({
    pilotId,
    workspaceId,
    workspaceDisplayName,
    status: "draft",
    brandName,
    objective:
      readString(strategyRecord.objective) || `Capture qualified search demand for ${brandName} and ${lowerOffer}.`,
    landingPageUrl: pickLandingPageUrl(pilotId, landingPage),
    geoTargets: pickGeoTargets(pilot),
    budgetDailyUsd: 45,
    keywordClusters: [
      {
        theme: `${offer} high intent`,
        keywords: [`best ${lowerOffer}`, `${lowerOffer} online`, `${lowerOffer} pricing`],
      },
      {
        theme: "Audience demand capture",
        keywords: [`${audiencePhrase} ${lowerOffer}`, `${brandName} ${lowerOffer}`, `compare ${lowerOffer}`],
      },
    ],
    adCopy: [
      {
        headline1: `${brandName}`,
        headline2: `Explore ${offer}`,
        description1: `Learn why ${brandName} is relevant for ${lowerOffer}.`,
        description2: pillarLine,
      },
      {
        headline1: `${offer}`,
        headline2: `Discover ${brandName}`,
        description1: "Capture qualified demand with a clear, evidence-backed message.",
        description2: "Keep the route from search to the next action simple and measurable.",
      },
    ],
    sitelinks: ["Learn More", "How It Works", "Proof", "Contact"],
  });
}

export function buildGoogleAdsDraftFromPilot(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
  landingPage?: unknown,
): GoogleAdsCampaignDraftRecord {
  return isNeejeeContext(pilot)
    ? buildNeejeeDraft(pilot, strategy, landingPage)
    : buildGenericDraft(pilot, strategy, landingPage);
}

export function generateGoogleAdsDraft(
  options: GenerateGoogleAdsDraftOptions = {},
): GoogleAdsCampaignDraftRecord {
  const pilotId = options.pilotId ?? "neejee-pilot";

  if (!options.forceRegenerate) {
    const existing = getGoogleAdsDraft();
    if (existing && (existing as unknown as Record<string, unknown>).pilotId === pilotId) {
      return existing;
    }
  }

  const pilot = getPilot();
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  if (!pilot || (pilotRecord.pilotId !== pilotId && pilotRecord.id !== pilotId)) {
    throw new Error(`Pilot not found: ${pilotId}`);
  }

  const strategyCandidate = getStrategyBrief();
  const strategy =
    strategyCandidate &&
    (strategyCandidate as unknown as Record<string, unknown>).pilotId === pilotId
      ? strategyCandidate
      : null;

  const landingPageCandidate = getLandingPageBrief();
  const landingPage =
    landingPageCandidate &&
    (landingPageCandidate as unknown as Record<string, unknown>).pilotId === pilotId
      ? landingPageCandidate
      : null;

  const draft = buildGoogleAdsDraftFromPilot(pilot, strategy, landingPage);
  return saveGoogleAdsDraft(draft);
}
