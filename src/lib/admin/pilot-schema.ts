export const pilotStatuses = [
  "draft",
  "in_progress",
  "ready_for_review",
  "approved",
] as const;

export type PilotStatus = (typeof pilotStatuses)[number];
export type StringArrayInput = string[] | string | null | undefined;

export type NeejeePilotRecord = {
  id: string;
  workspaceDisplayName: string;
  brandName: string;
  website: string;
  industry: string;
  geo: string;
  targetAudience: string;
  offer: string;
  monthlyBudget: string;
  primaryChannels: string[];
  competitors: string[];
  goals: string[];
  successMetrics: string[];
  status: PilotStatus;
  lastUpdatedAt: string;
};

export type NeejeePilotInput = {
  id?: string;
  workspaceDisplayName?: string;
  brandName?: string;
  website?: string;
  industry?: string;
  geo?: string;
  targetAudience?: string;
  offer?: string;
  monthlyBudget?: string;
  primaryChannels?: StringArrayInput;
  competitors?: StringArrayInput;
  goals?: StringArrayInput;
  successMetrics?: StringArrayInput;
  status?: PilotStatus;
  lastUpdatedAt?: string;
};

const normalizeString = (value: unknown, fallback = ""): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeStringArray = (value: StringArrayInput): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const isPilotStatus = (value: unknown): value is PilotStatus =>
  typeof value === "string" &&
  (pilotStatuses as readonly string[]).includes(value);

export function createPilotRecord(input: NeejeePilotInput = {}): NeejeePilotRecord {
  const lastUpdatedAt =
    typeof input.lastUpdatedAt === "string" && input.lastUpdatedAt.trim().length > 0
      ? input.lastUpdatedAt
      : new Date().toISOString();

  return {
    id: normalizeString(input.id, "neejee-pilot"),
    workspaceDisplayName: normalizeString(input.workspaceDisplayName, "Oye Imagine"),
    brandName: normalizeString(input.brandName, "Neejee"),
    website: normalizeString(input.website),
    industry: normalizeString(input.industry),
    geo: normalizeString(input.geo),
    targetAudience: normalizeString(input.targetAudience),
    offer: normalizeString(input.offer),
    monthlyBudget: normalizeString(input.monthlyBudget),
    primaryChannels: normalizeStringArray(input.primaryChannels),
    competitors: normalizeStringArray(input.competitors),
    goals: normalizeStringArray(input.goals),
    successMetrics: normalizeStringArray(input.successMetrics),
    status: isPilotStatus(input.status) ? input.status : "draft",
    lastUpdatedAt,
  };
}