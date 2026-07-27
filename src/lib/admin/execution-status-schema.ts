export type ExecutionStatusValue =
  | "draft"
  | "on-track"
  | "at-risk"
  | "blocked"
  | "completed";

export type ExecutionStatusDraftRecord = {
  id: string;
  pilotId: string;
  workspaceId: string;
  generatedAt: string;
  lastUpdatedAt: string;
  status: ExecutionStatusValue;
  campaignName: string;
  overallStatus: string;
  completedItems: string[];
  inProgressItems: string[];
  blockedItems: string[];
  upcomingItems: string[];
  notes: string[];
};

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function asStatus(
  value: unknown,
  fallback: ExecutionStatusValue,
): ExecutionStatusValue {
  switch (value) {
    case "draft":
    case "on-track":
    case "at-risk":
    case "blocked":
    case "completed":
      return value;
    default:
      return fallback;
  }
}

export function createExecutionStatusDraftRecord(
  input: Partial<ExecutionStatusDraftRecord> = {},
): ExecutionStatusDraftRecord {
  const timestamp = asString(input.generatedAt, new Date().toISOString());

  return {
    id: asString(input.id, "execution-status-pilot-demo"),
    pilotId: asString(input.pilotId, "pilot-demo"),
    workspaceId: asString(input.workspaceId, "workspace-demo"),
    generatedAt: timestamp,
    lastUpdatedAt: asString(input.lastUpdatedAt, timestamp),
    status: asStatus(input.status, "draft"),
    campaignName: asString(input.campaignName, "Execution Status"),
    overallStatus: asString(input.overallStatus, "Draft"),
    completedItems: asStringArray(input.completedItems),
    inProgressItems: asStringArray(input.inProgressItems),
    blockedItems: asStringArray(input.blockedItems),
    upcomingItems: asStringArray(input.upcomingItems),
    notes: asStringArray(input.notes),
  };
}