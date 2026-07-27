import { beforeEach, describe, expect, it } from "vitest";

import { executionStatusDraftFixture } from "@/lib/admin/execution-status-fixtures";
import {
  createExecutionStatusDraft,
  getExecutionStatusDraft,
  resetExecutionStatusDraftStore,
  saveExecutionStatusDraft,
  updateExecutionStatusDraft,
} from "@/lib/admin/execution-status-store";

describe("admin execution status store", () => {
  beforeEach(() => {
    resetExecutionStatusDraftStore();
  });

  it("creates a default execution status draft record", () => {
    const draft = createExecutionStatusDraft();

    expect(draft).toMatchObject({
      id: "execution-status-pilot-demo",
      pilotId: "pilot-demo",
      workspaceId: "workspace-demo",
      status: "draft",
      campaignName: "Execution Status",
      overallStatus: "Draft",
      completedItems: [],
      inProgressItems: [],
      blockedItems: [],
      upcomingItems: [],
      notes: [],
    });

    expect(typeof draft.generatedAt).toBe("string");
    expect(typeof draft.lastUpdatedAt).toBe("string");
  });

  it("saves a provided execution status draft", () => {
    const draft = saveExecutionStatusDraft(executionStatusDraftFixture);

    expect(draft).toMatchObject({
      id: "execution-status-pilot-demo",
      pilotId: "pilot-demo",
      workspaceId: "workspace-demo",
      status: "on-track",
      campaignName: "Acme Launch Rollout",
      overallStatus: "On track for launch",
      completedItems: ["Approved campaign scope"],
      inProgressItems: ["Finalizing launch messaging"],
      blockedItems: ["Awaiting creative approval"],
      upcomingItems: ["Launch paid traffic"],
      notes: ["Weekly execution review scheduled."],
    });

    expect(draft.generatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(getExecutionStatusDraft()).toEqual(draft);
  });

  it("updates an existing execution status draft while preserving generatedAt", async () => {
    const saved = saveExecutionStatusDraft(executionStatusDraftFixture);

    const updated = updateExecutionStatusDraft({
      status: "blocked",
      overallStatus: "Blocked on launch dependencies",
      blockedItems: ["Creative approval overdue", "Tracking QA incomplete"],
    });

    expect(updated.generatedAt).toBe(saved.generatedAt);
    expect(updated.lastUpdatedAt).not.toBe(saved.lastUpdatedAt);
    expect(updated.status).toBe("blocked");
    expect(updated.overallStatus).toBe("Blocked on launch dependencies");
    expect(updated.blockedItems).toEqual([
      "Creative approval overdue",
      "Tracking QA incomplete",
    ]);
    expect(updated.campaignName).toBe(saved.campaignName);
  });

  it("resets the execution status store", () => {
    saveExecutionStatusDraft(executionStatusDraftFixture);

    resetExecutionStatusDraftStore();

    expect(getExecutionStatusDraft()).toBeNull();
  });
});