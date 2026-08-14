import { getPilot } from "@/lib/admin/pilot-store";
import { getStrategyBrief } from "@/lib/admin/strategy-store";
import { getLandingPageBrief } from "@/lib/admin/landing-page-store";
import {
  getGoogleAdsDraft,
  saveGoogleAdsDraft,
} from "@/lib/admin/google-ads-store";
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
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

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
    if (items.length > 0) {
      return items;
    }
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
    "Neejee"
  );
}

function pickPrimaryOffer(pilot: NeejeePilotRecord): string {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const namedCategories = firstNonEmptyArray(
    pilotRecord.productCategories,
    pilotRecord.categories,
    pilotRecord.products,
    pilotRecord.services,
  );

  if (namedCategories.length > 0) {
    return namedCategories[0];
  }

  return (
    readString(pilotRecord.offer) ||
    "Indian ethnic fashion, jewellery and accessories"
  );
}

function pickGeoTargets(pilot: NeejeePilotRecord): string[] {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const explicit = firstNonEmptyArray(
    pilotRecord.geoTargets,
    pilotRecord.locations,
    pilotRecord.cities,
  );

  if (explicit.length > 0) {
    return explicit;
  }

  const geo = readString(pilotRecord.geo);
  return geo ? [geo] : ["India"];
}

function pickAudience(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) {
    return [];
  }

  const strategyRecord = strategy as unknown as Record<string, unknown>;
  return readStringArray(strategyRecord.audienceSegments);
}

function pickPillars(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) {
    return [];
  }

  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const pillars = strategyRecord.messagingPillars ?? strategyRecord.pillars;
  return readStringArray(pillars);
}

function pickLandingPageUrl(pilotId: string, landingPage?: unknown): string {
  const landingPageRecord = (landingPage ?? null) as Record<string, unknown> | null;

  return (
    readString(landingPageRecord?.landingPageUrl) ||
    readString(landingPageRecord?.url) ||
    `/landing/${pilotId}`
  );
}

function pickSitelinks(landingPage?: unknown): string[] {
  const landingPageRecord = (landingPage ?? null) as Record<string, unknown> | null;
  const labels = readStringArray(landingPageRecord?.ctas);

  if (labels.length > 0) {
    return labels.slice(0, 4);
  }

  return [
    "Shop New Arrivals",
    "Jewellery & Accessories",
    "Indian Craft Collections",
    "Shipping & Support",
  ];
}

function buildKeywordClusters(
  offer: string,
  audience: string[],
): Array<{ theme: string; keywords: string[] }> {
  const normalizedOffer = offer.toLowerCase();
  const primaryAudience =
    audience.length > 0 ? audience[0].toLowerCase() : "online shoppers";

  return [
    {
      theme: `${offer} purchase intent`,
      keywords: [
        `buy ${normalizedOffer} online`,
        `shop ${normalizedOffer}`,
        `${normalizedOffer} India`,
      ],
    },
    {
      theme: "Audience product discovery",
      keywords: [
        `${primaryAudience} ${normalizedOffer}`,
        `premium ${normalizedOffer} online`,
        `discover ${normalizedOffer}`,
      ],
    },
  ];
}

function buildAdCopy(
  brandName: string,
  offer: string,
  pillars: string[],
): Array<{
  headline1: string;
  headline2: string;
  description1: string;
  description2: string;
}> {
  const pillarLine =
    pillars.length > 0
      ? pillars.slice(0, 2).join(" • ")
      : "Curated Indian craft • Easy online discovery";

  return [
    {
      headline1: `${brandName} Online`,
      headline2: "Discover Indian Craft & Style",
      description1: `Explore ${offer.toLowerCase()} with a clear path from discovery to purchase.`,
      description2: pillarLine,
    },
    {
      headline1: `Shop ${brandName}`,
      headline2: "Curated Indian Collections",
      description1: "Reach high-intent shoppers with product-led search messaging.",
      description2: "Clear value, credible product context and a low-friction shopping path.",
    },
  ];
}

export function buildGoogleAdsDraftFromPilot(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
  landingPage?: unknown,
): GoogleAdsCampaignDraftRecord {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const strategyRecord = (strategy ?? null) as unknown as Record<string, unknown>;

  const pilotId = readString(pilotRecord.pilotId, "neejee-pilot");
  const workspaceId = readString(pilotRecord.workspaceId, "oye-imagine");
  const workspaceDisplayName = readString(
    pilotRecord.workspaceDisplayName,
    "Oye !magine",
  );
  const brandName = pickBrandName(pilot, strategy);
  const offer = pickPrimaryOffer(pilot);
  const audience = pickAudience(strategy);
  const pillars = pickPillars(strategy);
  const landingPageUrl = pickLandingPageUrl(pilotId, landingPage);
  const geoTargets = pickGeoTargets(pilot);
  const objective =
    readString(strategyRecord.objective) ||
    `Grow qualified ecommerce traffic and purchases for ${brandName} through search campaigns.`;

  return createGoogleAdsCampaignDraftRecord({
    pilotId,
    workspaceId,
    workspaceDisplayName,
    status: "draft",
    brandName,
    objective,
    landingPageUrl,
    geoTargets,
    budgetDailyUsd: 45,
    keywordClusters: buildKeywordClusters(offer, audience),
    adCopy: buildAdCopy(brandName, offer, pillars),
    sitelinks: pickSitelinks(landingPage),
  });
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
  if (!pilot || (pilot as unknown as Record<string, unknown>).pilotId !== pilotId) {
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
