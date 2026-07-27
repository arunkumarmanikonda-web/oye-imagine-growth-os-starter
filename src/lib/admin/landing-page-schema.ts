export const landingPageBriefStatuses = [
  "draft",
  "generated",
  "ready_for_review",
  "approved",
] as const;

export type LandingPageBriefStatus = (typeof landingPageBriefStatuses)[number];

export type LandingPageHero = {
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
};

export type LandingPageSection = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
};

export type LandingPageSeoMeta = {
  title: string;
  description: string;
  keywords: string[];
};

export type LandingPageAsset = {
  type: string;
  label: string;
  description: string;
};

export type LandingPageBriefRecord = {
  id: string;
  pilotId: string;
  strategyId: string;
  workspaceDisplayName: string;
  brandName: string;
  status: LandingPageBriefStatus;
  hero: LandingPageHero;
  sections: LandingPageSection[];
  seoMeta: LandingPageSeoMeta;
  ctas: string[];
  proofPoints: string[];
  assets: LandingPageAsset[];
  generatedAt: string;
  lastUpdatedAt: string;
};

export type LandingPageBriefInput = Partial<
  Omit<LandingPageBriefRecord, "id" | "generatedAt" | "lastUpdatedAt">
> & {
  id?: string;
  generatedAt?: string | null;
  lastUpdatedAt?: string | null;
};

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeString(entry))
    .filter((entry) => entry.length > 0);
}

function normalizeHero(value: unknown): LandingPageHero {
  const candidate =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    headline: normalizeString(candidate.headline, "Neejee growth system for modern clinics"),
    subheadline: normalizeString(
      candidate.subheadline,
      "Turn strategy into qualified patient demand with measurable, governed execution.",
    ),
    primaryCta: normalizeString(candidate.primaryCta, "Book a strategy call"),
    secondaryCta: normalizeString(candidate.secondaryCta, "View pilot brief"),
  };
}

function normalizeSections(value: unknown): LandingPageSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      const id = normalizeString(candidate.id, `section-${index + 1}`);
      const title = normalizeString(candidate.title);
      const description = normalizeString(candidate.description);
      const bullets = normalizeStringArray(candidate.bullets);

      if (!title && !description && bullets.length === 0) {
        return null;
      }

      return {
        id,
        title,
        description,
        bullets,
      } satisfies LandingPageSection;
    })
    .filter((entry): entry is LandingPageSection => Boolean(entry));
}

function normalizeSeoMeta(value: unknown): LandingPageSeoMeta {
  const candidate =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    title: normalizeString(candidate.title, "Neejee Clinics | Growth Operating System"),
    description: normalizeString(
      candidate.description,
      "Neejee Clinics growth operating system for measurable lead generation, strategy, and governed execution.",
    ),
    keywords: normalizeStringArray(candidate.keywords),
  };
}

function normalizeAssets(value: unknown): LandingPageAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      const type = normalizeString(candidate.type);
      const label = normalizeString(candidate.label);
      const description = normalizeString(candidate.description);

      if (!type && !label && !description) {
        return null;
      }

      return {
        type,
        label,
        description,
      } satisfies LandingPageAsset;
    })
    .filter((entry): entry is LandingPageAsset => Boolean(entry));
}

export function isLandingPageBriefStatus(value: unknown): value is LandingPageBriefStatus {
  return (
    typeof value === "string" &&
    (landingPageBriefStatuses as readonly string[]).includes(value)
  );
}

export function createLandingPageBriefRecord(
  input: LandingPageBriefInput = {},
): LandingPageBriefRecord {
  const now = new Date().toISOString();

  return {
    id: normalizeString(input.id, "neejee-landing-page-brief"),
    pilotId: normalizeString(input.pilotId, "neejee-pilot"),
    strategyId: normalizeString(input.strategyId, "neejee-strategy-brief"),
    workspaceDisplayName: normalizeString(input.workspaceDisplayName, "Oye Imagine"),
    brandName: normalizeString(input.brandName, "Neejee Clinics"),
    status: isLandingPageBriefStatus(input.status) ? input.status : "draft",
    hero: normalizeHero(input.hero),
    sections: normalizeSections(input.sections),
    seoMeta: normalizeSeoMeta(input.seoMeta),
    ctas: normalizeStringArray(input.ctas),
    proofPoints: normalizeStringArray(input.proofPoints),
    assets: normalizeAssets(input.assets),
    generatedAt: normalizeString(input.generatedAt ?? now, now),
    lastUpdatedAt: normalizeString(input.lastUpdatedAt ?? now, now),
  };
}