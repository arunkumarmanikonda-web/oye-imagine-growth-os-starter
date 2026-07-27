import { createExecutionStatusDraftRecord } from "@/lib/admin/execution-status-schema";

export const executionStatusDraftFixture = createExecutionStatusDraftRecord({
  id: "execution-status-pilot-demo",
  pilotId: "pilot-demo",
  workspaceId: "workspace-demo",
  generatedAt: "2026-01-01T00:00:00.000Z",
  lastUpdatedAt: "2026-01-01T00:00:00.000Z",
  status: "on-track",
  campaignName: "Acme Launch Rollout",
  overallStatus: "On track for launch",
  completedItems: ["Approved campaign scope"],
  inProgressItems: ["Finalizing launch messaging"],
  blockedItems: ["Awaiting creative approval"],
  upcomingItems: ["Launch paid traffic"],
  notes: ["Weekly execution review scheduled."],
});