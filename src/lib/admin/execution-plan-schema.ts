export type ExecutionPlanStatus = "draft" | "approved";

export type ExecutionPlanDraftRecord = {
  id: string;
  pilotId: string;
  workspaceId: string;
  generatedAt: string;
  lastUpdatedAt: string;
  status: ExecutionPlanStatus;
  campaignName: string;
  launchWindow: string;
  milestones: string[];
  owners: string[];
  blockers: string[];
  checklist: string[];
  notes: string[];
};

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const items = value
    .map((entry) => `${entry}`.trim())
    .filter((entry) => entry.length > 0);

  return items.length > 0 ? items : [...fallback];
}

export function createExecutionPlanDraftRecord(
  input: Partial<ExecutionPlanDraftRecord> = {},
): ExecutionPlanDraftRecord {
  const now = new Date().toISOString();

  return {
    id: input.id ?? "execution-plan-pilot-demo",
    pilotId: input.pilotId ?? "pilot-demo",
    workspaceId: input.workspaceId ?? "workspace-demo",
    generatedAt: input.generatedAt ?? now,
    lastUpdatedAt: input.lastUpdatedAt ?? input.generatedAt ?? now,
    status: input.status ?? "draft",
    campaignName: input.campaignName ?? "Growth Campaign Execution Plan",
    launchWindow: input.launchWindow ?? "Next 14 days",
    milestones: asStringArray(input.milestones, [
      "Finalize campaign strategy and summary alignment.",
      "Approve launch-ready creative and messaging assets.",
      "Schedule launch communications and performance checkpoints.",
    ]),
    owners: asStringArray(input.owners, [
      "Growth Lead",
      "Lifecycle Lead",
      "Paid Media Lead",
    ]),
    blockers: asStringArray(input.blockers, [
      "Awaiting stakeholder approval on final launch timing.",
    ]),
    checklist: asStringArray(input.checklist, [
      "Confirm campaign naming and launch window.",
      "Validate cross-channel asset consistency.",
      "Review operational dependencies before launch.",
    ]),
    notes: asStringArray(input.notes, [
      "Use this execution plan as the operating checklist for launch readiness.",
    ]),
  };
}