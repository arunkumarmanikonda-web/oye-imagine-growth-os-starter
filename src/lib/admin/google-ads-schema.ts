export type GoogleAdsDraftStatus = "draft" | "review" | "approved";

export type GoogleAdsKeywordCluster = {
  theme: string;
  keywords: string[];
};

export type GoogleAdsAdCopy = {
  headline1: string;
  headline2: string;
  description1: string;
  description2: string;
};

export type GoogleAdsCampaignDraftRecord = {
  pilotId: string;
  workspaceId: string;
  workspaceDisplayName: string;
  status: GoogleAdsDraftStatus;
  brandName: string;
  objective: string;
  landingPageUrl: string;
  geoTargets: string[];
  budgetDailyUsd: number;
  keywordClusters: GoogleAdsKeywordCluster[];
  adCopy: GoogleAdsAdCopy[];
  sitelinks: string[];
  generatedAt: string;
  lastUpdatedAt: string;
};

export type GoogleAdsCampaignDraftInput = Partial<
  Omit<GoogleAdsCampaignDraftRecord, "generatedAt" | "lastUpdatedAt">
>;

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function readStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function readKeywordClusters(value: unknown): GoogleAdsKeywordCluster[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      return {
        theme: readString(record.theme, "General intent"),
        keywords: readStringArray(record.keywords),
      } satisfies GoogleAdsKeywordCluster;
    })
    .filter((item): item is GoogleAdsKeywordCluster => Boolean(item));
}

function readAdCopy(value: unknown): GoogleAdsAdCopy[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      return {
        headline1: readString(record.headline1, "Trusted care"),
        headline2: readString(record.headline2, "Book a consultation"),
        description1: readString(
          record.description1,
          "Clear value proposition and conversion-focused messaging.",
        ),
        description2: readString(
          record.description2,
          "Low-friction next step for qualified prospects.",
        ),
      } satisfies GoogleAdsAdCopy;
    })
    .filter((item): item is GoogleAdsAdCopy => Boolean(item));
}

function resolveWorkspaceDisplayName(explicitName?: string): string {
  return (
    readString(explicitName, "") ||
    readString(process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME, "") ||
    readString(process.env.WORKSPACE_DISPLAY_NAME, "") ||
    "Oye Imagine"
  );
}

export function createGoogleAdsCampaignDraftRecord(
  input: GoogleAdsCampaignDraftInput = {},
): GoogleAdsCampaignDraftRecord {
  const now = new Date().toISOString();

  return {
    pilotId: readString(input.pilotId, "neejee-pilot"),
    workspaceId: readString(input.workspaceId, "oye-imagine"),
    workspaceDisplayName: resolveWorkspaceDisplayName(input.workspaceDisplayName),
    status:
      input.status === "review" || input.status === "approved" ? input.status : "draft",
    brandName: readString(input.brandName, "Neejee Clinics"),
    objective: readString(
      input.objective,
      "Generate qualified consultation bookings from high-intent search demand.",
    ),
    landingPageUrl: readString(input.landingPageUrl, "/landing/neejee-pilot"),
    geoTargets: readStringArray(input.geoTargets, ["Bengaluru"]),
    budgetDailyUsd:
      typeof input.budgetDailyUsd === "number" && Number.isFinite(input.budgetDailyUsd)
        ? input.budgetDailyUsd
        : 35,
    keywordClusters: readKeywordClusters(input.keywordClusters),
    adCopy: readAdCopy(input.adCopy),
    sitelinks: readStringArray(input.sitelinks, [
      "Book Consultation",
      "Treatment Options",
      "Before and After",
      "Pricing and FAQs",
    ]),
    generatedAt: now,
    lastUpdatedAt: now,
  };
}