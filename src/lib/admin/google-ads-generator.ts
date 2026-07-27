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
        return readString(
          record.label ?? record.title ?? record.name ?? record.value,
          "",
        );
      }

      return "";
    })
    .filter(Boolean);
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
    "Neejee Clinics"
  );
}

function pickPrimaryService(pilot: NeejeePilotRecord): string {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const services = readStringArray(pilotRecord.services);

  if (services.length > 0) {
    return services[0];
  }

  return "Consultation";
}

function pickGeoTargets(pilot: NeejeePilotRecord): string[] {
  const pilotRecord = pilot as unknown as Record<string, unknown>;

  return (
    readStringArray(pilotRecord.geoTargets) ||
    readStringArray(pilotRecord.locations) ||
    readStringArray(pilotRecord.cities)
  ).length > 0
    ? (
        readStringArray(pilotRecord.geoTargets) ||
        readStringArray(pilotRecord.locations) ||
        readStringArray(pilotRecord.cities)
      )
    : ["Bengaluru"];
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

function pickLandingPageUrl(
  pilotId: string,
  landingPage?: unknown,
): string {
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
    "Book Consultation",
    "Treatment Options",
    "Success Stories",
    "Pricing and FAQs",
  ];
}

function buildKeywordClusters(
  service: string,
  audience: string[],
): Array<{ theme: string; keywords: string[] }> {
  const lowerService = service.toLowerCase();
  const primaryAudience =
    audience.length > 0 ? audience[0].toLowerCase() : "high-intent search traffic";

  return [
    {
      theme: `${service} high intent`,
      keywords: [
        `best ${lowerService} clinic`,
        `${lowerService} consultation`,
        `${lowerService} near me`,
      ],
    },
    {
      theme: "Audience demand capture",
      keywords: [
        `${primaryAudience} ${lowerService}`,
        `${lowerService} specialist`,
        `book ${lowerService} consultation`,
      ],
    },
  ];
}

function buildAdCopy(
  brandName: string,
  service: string,
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
      : "Trust-first messaging • Low-friction booking";

  return [
    {
      headline1: `${brandName} ${service}`,
      headline2: "Book Trusted Specialist Care",
      description1: `Target high-intent demand for ${service.toLowerCase()} consultations.`,
      description2: pillarLine,
    },
    {
      headline1: `${service} Consultation`,
      headline2: `Talk To ${brandName}`,
      description1: "Drive qualified leads with direct response search messaging.",
      description2: "Strong proof, clear value, and a simple booking path.",
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
    "Oye Imagine",
  );
  const brandName = pickBrandName(pilot, strategy);
  const service = pickPrimaryService(pilot);
  const audience = pickAudience(strategy);
  const pillars = pickPillars(strategy);
  const landingPageUrl = pickLandingPageUrl(pilotId, landingPage);
  const geoTargets = pickGeoTargets(pilot);
  const objective =
    readString(strategyRecord.objective) ||
    `Generate qualified ${service.toLowerCase()} consultation demand from search campaigns.`;

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
    keywordClusters: buildKeywordClusters(service, audience),
    adCopy: buildAdCopy(brandName, service, pillars),
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