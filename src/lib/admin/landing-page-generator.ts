import { getPilot } from "@/lib/admin/pilot-store";
import { getStrategyBrief } from "@/lib/admin/strategy-store";
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

function pickPrimaryService(pilot: NeejeePilotRecord): string {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const services = readStringArray(pilotRecord.services);

  if (services.length > 0) {
    return services[0];
  }

  return "care";
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
    "Neejee Clinics"
  );
}

function pickAudience(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) {
    return [];
  }

  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const audienceSegments = strategyRecord.audienceSegments;

  if (!Array.isArray(audienceSegments)) {
    return [];
  }

  return audienceSegments
    .map((segment) => {
      if (!segment || typeof segment !== "object") {
        return "";
      }

      const record = segment as Record<string, unknown>;
      return readString(record.name ?? record.label ?? record.title, "");
    })
    .filter(Boolean);
}

function pickChannels(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) {
    return [];
  }

  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const channels = strategyRecord.channelRecommendations;

  if (!Array.isArray(channels)) {
    return [];
  }

  return channels
    .map((channel) => {
      if (!channel || typeof channel !== "object") {
        return "";
      }

      const record = channel as Record<string, unknown>;
      return readString(record.channel ?? record.name ?? record.label, "");
    })
    .filter(Boolean);
}

function pickPillars(strategy?: StrategyBriefRecord | null): string[] {
  if (!strategy) {
    return [];
  }

  const strategyRecord = strategy as unknown as Record<string, unknown>;
  const pillars = strategyRecord.messagingPillars ?? strategyRecord.pillars;

  if (!Array.isArray(pillars)) {
    return [];
  }

  return pillars
    .map((pillar) => {
      if (!pillar || typeof pillar !== "object") {
        return "";
      }

      const record = pillar as Record<string, unknown>;
      return readString(record.title ?? record.name ?? record.label, "");
    })
    .filter(Boolean);
}

function buildSections(
  brandName: string,
  primaryService: string,
  audience: string[],
  pillars: string[],
): LandingPageSection[] {
  const audienceLine =
    audience.length > 0
      ? audience.join(", ")
      : "high-intent patients evaluating treatment options";

  const pillarBullets =
    pillars.length > 0
      ? pillars.slice(0, 3)
      : [
          "Clear treatment outcomes and next steps",
          "Trust-building proof and clinician credibility",
          "Low-friction conversion path to consultation",
        ];

  return [
    {
      id: "problem",
      title: `Why ${primaryService} decisions stall`,
      description: `${brandName} needs a landing page that reduces uncertainty, explains the care journey, and gives visitors a clear next action.`,
      bullets: [
        "Prospects need fast clarity on fit, outcomes, and timeline",
        "The page should remove friction before the first call",
        "Proof and process need to appear above the fold",
      ],
    },
    {
      id: "solution",
      title: `How ${brandName} helps`,
      description: `Position ${brandName} as the trusted partner for ${primaryService} with a clear, modern patient journey.`,
      bullets: pillarBullets,
    },
    {
      id: "audience",
      title: "Who this page is for",
      description: `Primary audience: ${audienceLine}.`,
      bullets: [
        "Visitors researching options",
        "Warm leads comparing providers",
        "Referrals needing faster decision support",
      ],
    },
    {
      id: "cta",
      title: "Primary conversion path",
      description:
        "Drive visitors to book a consultation with a short, confidence-building call to action.",
      bullets: [
        "Primary CTA: Book a consultation",
        "Secondary CTA: Speak to the team",
        "Keep form friction low and expectation-setting high",
      ],
    },
  ];
}

export function buildLandingPageBriefFromPilot(
  pilot: NeejeePilotRecord,
  strategy?: StrategyBriefRecord | null,
): LandingPageBriefRecord {
  const pilotRecord = pilot as unknown as Record<string, unknown>;
  const strategyRecord = (strategy ?? null) as unknown as Record<string, unknown>;

  const pilotId = readString(pilotRecord.pilotId, "neejee-pilot");
  const workspaceId = readString(pilotRecord.workspaceId, "default-workspace");
  const workspaceDisplayName = readString(
    pilotRecord.workspaceDisplayName,
    "Oye Imagine",
  );
  const brandName = pickBrandName(pilot, strategy);
  const primaryService = pickPrimaryService(pilot);
  const audience = pickAudience(strategy);
  const pillars = pickPillars(strategy);
  const channels = pickChannels(strategy);

  const brief = createDefaultLandingPageBrief(pilotId);
  const record = brief as unknown as Record<string, any>;

  record.workspaceId = workspaceId;
  record.workspaceDisplayName = workspaceDisplayName;
  record.status = "draft";
  record.brandName = brandName;
  record.objective = `Convert qualified ${primaryService.toLowerCase()} demand into booked consultations.`;
  record.audienceSummary =
    audience.length > 0
      ? audience.join(", ")
      : "High-intent prospects actively evaluating providers.";
  record.positioningStatement = `${brandName} offers a clear, trustworthy path from first visit to booked consultation for patients exploring ${primaryService.toLowerCase()}.`;

  record.hero = {
    eyebrow: `${brandName} landing page brief`,
    headline: `Book a confident next step with ${brandName}`,
    subheadline: `Turn high-intent visitors into consultation bookings with a focused page for ${primaryService.toLowerCase()}.`,
    primaryCta: "Book a consultation",
    secondaryCta: "Speak to the team",
  };

  record.ctas = [
    {
      label: "Book a consultation",
      href: "/contact",
      variant: "primary",
    },
    {
      label: "Speak to the team",
      href: "/contact?intent=talk",
      variant: "secondary",
    },
  ];

  record.sections = buildSections(brandName, primaryService, audience, pillars);

  record.proofPoints = [
    {
      label: "Clear value proposition",
      value: `${brandName} makes the next step simple and low friction.`,
    },
    {
      label: "Strategic channel alignment",
      value:
        channels.length > 0
          ? `Supports demand capture from ${channels.slice(0, 3).join(", ")}.`
          : "Supports demand capture from search, referrals, and remarketing.",
    },
    {
      label: "Trust-first UX",
      value: "Balances credibility, clarity, and conversion focus.",
    },
  ];

  record.assets = [
    {
      type: "logo",
      label: "Primary logo",
      url: "/logo.svg",
    },
    {
      type: "image",
      label: "Hero image",
      url: "/images/hero-placeholder.jpg",
    },
  ];

  record.generatedFrom = {
    strategyStatus: readString(strategyRecord.status, "draft"),
    strategyUpdatedAt: readString(strategyRecord.updatedAt),
    pilotUpdatedAt: readString(pilotRecord.updatedAt),
  };

  if (!record.seo || typeof record.seo !== "object") {
    record.seo = {};
  }

  record.seo.title = `${brandName} | ${primaryService} Consultation`;
  record.seo.description = `Landing page brief for ${brandName} focused on ${primaryService.toLowerCase()} conversion and consultation booking.`;
  record.seo.keywords = [
    brandName,
    primaryService,
    workspaceDisplayName,
    "consultation",
    "landing page brief",
  ];

  return brief;
}

export function generateLandingPageBrief(
  options: GenerateLandingPageBriefOptions = {},
): LandingPageBriefRecord {
  const pilotId = options.pilotId ?? "neejee-pilot";

  if (!options.forceRegenerate) {
    const existing = getLandingPageBrief(pilotId);
    if (existing) {
      return existing;
    }
  }

  const pilot = getPilot(pilotId);
  if (!pilot) {
    throw new Error(`Pilot not found: ${pilotId}`);
  }

  const strategy = getStrategyBrief(pilotId);
  const brief = buildLandingPageBriefFromPilot(pilot, strategy);
  return saveLandingPageBrief(brief);
}