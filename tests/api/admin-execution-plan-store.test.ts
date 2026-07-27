import { beforeEach, describe, expect, it } from "vitest";

import { executionPlanDraftFixture } from "@/lib/admin/execution-plan-fixtures";
import {
  createExecutionPlanDraft,
  getExecutionPlanDraft,
  resetExecutionPlanDraftStore,
  saveExecutionPlanDraft,
  updateExecutionPlanDraft,
} from "@/lib/admin/execution-plan-store";

describe("admin execution plan store", () => {
  beforeEach(() => {
    resetExecutionPlanDraftStore();
  });

  it("creates a default execution plan draft record", () => {
    const draft = createExecutionPlanDraft({
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
    });

    expect(draft.id).toBe("execution-plan-pilot-demo");
    expect(draft.pilotId).toBe("pilot-1");
    expect(draft.workspaceId).toBe("workspace-1");
    expect(draft.status).toBe("draft");
    expect(draft.milestones.length).toBeGreaterThan(0);
    expect(draft.owners.length).toBeGreaterThan(0);
    expect(draft.blockers.length).toBeGreaterThan(0);
    expect(draft.checklist.length).toBeGreaterThan(0);
    expect(draft.notes.length).toBeGreaterThan(0);
  });

  it("saves a provided execution plan draft", () => {
    const generatedAt = "2026-01-01T00:00:00.000Z";

    const saved = saveExecutionPlanDraft({
      id: "execution-plan-pilot-1",
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
      generatedAt,
      status: "draft",
      campaignName: "Pipeline Launch Execution Plan",
      launchWindow: "Week of Feb 10",
      milestones: [
        "Finalize launch sequencing",
        "Review creative approvals",
      ],
      owners: [
        "Jordan - Growth Lead",
        "Taylor - Lifecycle Lead",
      ],
      blockers: [
        "Waiting on compliance sign-off",
      ],
      checklist: [
        "Confirm GTM handoff",
      ],
      notes: [
        "Stored draft.",
      ],
    });

    expect(saved.id).toBe("execution-plan-pilot-1");
    expect(saved.generatedAt).toBe(generatedAt);
    expect(saved.lastUpdatedAt).not.toBe(generatedAt);
    expect(saved.campaignName).toBe("Pipeline Launch Execution Plan");
    expect(saved.launchWindow).toBe("Week of Feb 10");
    expect(saved.owners).toEqual([
      "Jordan - Growth Lead",
      "Taylor - Lifecycle Lead",
    ]);
    expect(getExecutionPlanDraft().pilotId).toBe("pilot-1");
  });

  it("updates an existing execution plan draft while preserving generatedAt", () => {
    const initial = saveExecutionPlanDraft({
      id: "execution-plan-pilot-2",
      pilotId: "pilot-2",
      workspaceId: "workspace-2",
      generatedAt: "2026-02-02T00:00:00.000Z",
      campaignName: "Initial Execution Plan",
      launchWindow: "Initial Window",
      milestones: ["Initial Milestone"],
      owners: ["Initial Owner"],
      blockers: ["Initial Blocker"],
      checklist: ["Initial Checklist"],
      notes: ["Initial Note"],
    });

    const updated = updateExecutionPlanDraft({
      campaignName: "Updated Execution Plan",
      milestones: ["Updated Milestone"],
      checklist: ["Updated Checklist"],
    });

    expect(updated.generatedAt).toBe(initial.generatedAt);
    expect(updated.lastUpdatedAt).not.toBe(initial.lastUpdatedAt);
    expect(updated.campaignName).toBe("Updated Execution Plan");
    expect(updated.milestones).toEqual(["Updated Milestone"]);
    expect(updated.checklist).toEqual(["Updated Checklist"]);
    expect(updated.launchWindow).toBe("Initial Window");
  });

  it("resets the store", () => {
    saveExecutionPlanDraft({
      id: "execution-plan-custom",
      pilotId: "pilot-custom",
      workspaceId: "workspace-custom",
      campaignName: "Custom Execution Plan",
      launchWindow: "Custom Window",
      milestones: ["Custom Milestone"],
      owners: ["Custom Owner"],
      blockers: ["Custom Blocker"],
      checklist: ["Custom Checklist"],
      notes: ["Custom Note"],
    });

    const reset = resetExecutionPlanDraftStore();

    expect(reset.pilotId).toBe(executionPlanDraftFixture.pilotId);
    expect(reset.workspaceId).toBe(executionPlanDraftFixture.workspaceId);
    expect(reset.campaignName).toBe(executionPlanDraftFixture.campaignName);
    expect(reset.milestones).toEqual(executionPlanDraftFixture.milestones);
  });
});