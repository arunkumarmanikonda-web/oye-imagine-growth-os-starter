import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getExecutionPlanDraft: vi.fn(),
  generateExecutionPlanDraft: vi.fn(),
  RegenerateButton: vi.fn(),
}));

vi.mock("@/lib/admin/execution-plan-store", () => ({
  getExecutionPlanDraft: mocks.getExecutionPlanDraft,
}));

vi.mock("@/lib/admin/execution-plan-generator", () => ({
  generateExecutionPlanDraft: mocks.generateExecutionPlanDraft,
}));

vi.mock("@/app/admin/execution-plan/[pilotId]/regenerate-button", () => ({
  RegenerateButton: (props: { pilotId: string }) => {
    mocks.RegenerateButton(props);
    return React.createElement("div", {
      "data-testid": "regenerate-button",
      "data-pilot-id": props.pilotId,
    });
  },
}));

import ExecutionPlanPage from "@/app/admin/execution-plan/[pilotId]/page";

describe("admin execution plan draft page", () => {
  const persistedDraft = {
    id: "execution-plan-pilot-demo",
    pilotId: "pilot-demo",
    workspaceId: "workspace-demo",
    generatedAt: "2026-01-01T00:00:00.000Z",
    lastUpdatedAt: "2026-01-01T00:00:00.000Z",
    status: "draft",
    campaignName: "Acme Launch Plan",
    launchWindow: "Next 14 days",
    milestones: ["Finalize offer", "Launch traffic"],
    owners: ["Jordan Lee (pilot owner)"],
    blockers: ["Awaiting final CTA approval"],
    checklist: ["Approve assets"],
    notes: ["Primary goal: Book more consultations."],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getExecutionPlanDraft.mockReturnValue(persistedDraft);
    mocks.generateExecutionPlanDraft.mockReturnValue(persistedDraft);
  });

  it("renders a persisted execution plan draft", async () => {
    const page = await ExecutionPlanPage({
      params: Promise.resolve({ pilotId: "pilot-demo" }),
    });

    const markup = renderToStaticMarkup(page);

    expect(mocks.getExecutionPlanDraft).toHaveBeenCalledTimes(1);
    expect(mocks.generateExecutionPlanDraft).not.toHaveBeenCalled();
    expect(markup).toContain("Acme Launch Plan");
    expect(markup).toContain("Next 14 days");
    expect(markup).toContain("Finalize offer");
    expect(markup).toContain("Jordan Lee (pilot owner)");
    expect(markup).toContain("Awaiting final CTA approval");
    expect(markup).toContain("Approve assets");
    expect(markup).toContain("Primary goal: Book more consultations.");
    expect(markup).toContain('data-testid="regenerate-button"');
    expect(markup).toContain('data-pilot-id="pilot-demo"');
  });

  it("generates an execution plan draft when store data is absent or mismatched", async () => {
    mocks.getExecutionPlanDraft.mockReturnValue({
      ...persistedDraft,
      pilotId: "other-pilot",
    });

    const generatedDraft = {
      ...persistedDraft,
      pilotId: "pilot-123",
      campaignName: "Pilot 123 Launch Plan",
    };

    mocks.generateExecutionPlanDraft.mockReturnValue(generatedDraft);

    const page = await ExecutionPlanPage({
      params: Promise.resolve({ pilotId: "pilot-123" }),
    });

    const markup = renderToStaticMarkup(page);

    expect(mocks.getExecutionPlanDraft).toHaveBeenCalledTimes(1);
    expect(mocks.generateExecutionPlanDraft).toHaveBeenCalledWith({
      pilotId: "pilot-123",
    });
    expect(markup).toContain("Pilot 123 Launch Plan");
    expect(markup).toContain('data-pilot-id="pilot-123"');
  });
});