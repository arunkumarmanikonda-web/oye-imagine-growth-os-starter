export const strategyBriefStatuses = [
  "draft",
  "generated",
  "ready_for_review",
  "approved",
] as const;

export type StrategyBriefStatus = (typeof strategyBriefStatuses)[number];

export type StrategyPillar = {
  title: string;
  description: string;
};

export type AudienceSegment = {
  name: string;
  painPoints: string[];
  buyingSignals: string[];
};

export type ChannelRecommendation = {
  channel: string;
  objective: string;
  rationale: string;
};

export type StrategyMilestone = {
  label: string;
  actions: string[];
};

export type StrategyBriefRecord = {
  id: string;
  workspaceDisplayName: string;
  pilotId: string;
  brandName: string;
  status: StrategyBriefStatus;
  positioning: string;
  offerSummary: string;
  marketSummary: string;
  messagingPillars: StrategyPillar[];
  audienceSegments: AudienceSegment[];
  channelRecommendations: ChannelRecommendation[];
  plan30Days: StrategyMilestone[];
  plan60Days: StrategyMilestone[];
  plan90Days: StrategyMilestone[];
  successMetrics: string[];
  assumptions: string[];
  blockers: string[];
  generatedAt: string;
  lastUpdatedAt: string;
};

export type StrategyBriefInput = Partial<
  Omit<StrategyBriefRecord, "id" | "generatedAt" | "lastUpdatedAt">
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

function normalizeStrategyPillars(value: unknown): StrategyPillar[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      const title = normalizeString(candidate.title);
      const description = normalizeString(candidate.description);

      if (!title && !description) {
        return null;
      }

      return {
        title,
        description,
      } satisfies StrategyPillar;
    })
    .filter((entry): entry is StrategyPillar => Boolean(entry));
}

function normalizeAudienceSegments(value: unknown): AudienceSegment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      const name = normalizeString(candidate.name);
      const painPoints = normalizeStringArray(candidate.painPoints);
      const buyingSignals = normalizeStringArray(candidate.buyingSignals);

      if (!name && painPoints.length === 0 && buyingSignals.length === 0) {
        return null;
      }

      return {
        name,
        painPoints,
        buyingSignals,
      } satisfies AudienceSegment;
    })
    .filter((entry): entry is AudienceSegment => Boolean(entry));
}

function normalizeChannelRecommendations(value: unknown): ChannelRecommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      const channel = normalizeString(candidate.channel);
      const objective = normalizeString(candidate.objective);
      const rationale = normalizeString(candidate.rationale);

      if (!channel && !objective && !rationale) {
        return null;
      }

      return {
        channel,
        objective,
        rationale,
      } satisfies ChannelRecommendation;
    })
    .filter((entry): entry is ChannelRecommendation => Boolean(entry));
}

function normalizeStrategyMilestones(value: unknown): StrategyMilestone[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      const label = normalizeString(candidate.label);
      const actions = normalizeStringArray(candidate.actions);

      if (!label && actions.length === 0) {
        return null;
      }

      return {
        label,
        actions,
      } satisfies StrategyMilestone;
    })
    .filter((entry): entry is StrategyMilestone => Boolean(entry));
}

export function isStrategyBriefStatus(value: unknown): value is StrategyBriefStatus {
  return (
    typeof value === "string" &&
    (strategyBriefStatuses as readonly string[]).includes(value)
  );
}

export function createStrategyBriefRecord(
  input: StrategyBriefInput = {},
): StrategyBriefRecord {
  const now = new Date().toISOString();

  return {
    id: normalizeString(input.id, "neejee-strategy-brief"),
    workspaceDisplayName: normalizeString(input.workspaceDisplayName, "Oye Imagine"),
    pilotId: normalizeString(input.pilotId, "neejee-pilot"),
    brandName: normalizeString(input.brandName, "Neejee"),
    status: isStrategyBriefStatus(input.status) ? input.status : "draft",
    positioning: normalizeString(
      input.positioning,
      "AI-native growth operating system for healthcare and service brands.",
    ),
    offerSummary: normalizeString(
      input.offerSummary,
      "Pilot engagement focused on onboarding, strategy, landing page planning, SEO, and paid media readiness.",
    ),
    marketSummary: normalizeString(
      input.marketSummary,
      "Healthcare and clinic operators need compliant, measurable growth with strong lead quality and operational visibility.",
    ),
    messagingPillars: normalizeStrategyPillars(input.messagingPillars),
    audienceSegments: normalizeAudienceSegments(input.audienceSegments),
    channelRecommendations: normalizeChannelRecommendations(input.channelRecommendations),
    plan30Days: normalizeStrategyMilestones(input.plan30Days),
    plan60Days: normalizeStrategyMilestones(input.plan60Days),
    plan90Days: normalizeStrategyMilestones(input.plan90Days),
    successMetrics: normalizeStringArray(input.successMetrics),
    assumptions: normalizeStringArray(input.assumptions),
    blockers: normalizeStringArray(input.blockers),
    generatedAt: normalizeString(input.generatedAt ?? now, now),
    lastUpdatedAt: normalizeString(input.lastUpdatedAt ?? now, now),
  };
}