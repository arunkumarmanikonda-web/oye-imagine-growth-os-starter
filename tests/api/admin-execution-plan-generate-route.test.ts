import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  generateExecutionPlanDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-plan-generator", () => ({
  generateExecutionPlanDraft: mocks.generateExecutionPlanDraft,
}));

import { POST } from "@/app/api/admin/execution-plan/generate/route";

describe("admin execution plan generate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.generateExecutionPlanDraft.mockReturnValue({
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
      blockers: [],
      checklist: ["Approve assets"],
      notes: ["Primary goal: Book more consultations."],
    });
  });

  it("generates and returns an execution plan draft", async () => {
    const request = new Request("http://localhost/api/admin/execution-plan/generate", {
      method: "POST",
      body: JSON.stringify({ pilotId: "pilot-123" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.generateExecutionPlanDraft).toHaveBeenCalledWith({
      pilotId: "pilot-123",
    });
    expect(json).toMatchObject({
      id: "execution-plan-pilot-demo",
      pilotId: "pilot-demo",
      campaignName: "Acme Launch Plan",
    });
  });

  it("uses defaults when request body is empty", async () => {
    const request = new Request("http://localhost/api/admin/execution-plan/generate", {
      method: "POST",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.generateExecutionPlanDraft).toHaveBeenCalledWith({
      pilotId: "pilot-demo",
    });
  });

  it("returns 404 when the pilot does not exist", async () => {
    mocks.generateExecutionPlanDraft.mockImplementation(() => {
      throw new Error("Pilot not found: missing-pilot");
    });

    const request = new Request("http://localhost/api/admin/execution-plan/generate", {
      method: "POST",
      body: JSON.stringify({ pilotId: "missing-pilot" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({
      error: 'Execution plan draft could not be generated for "missing-pilot".',
    });
  });

  it("returns 400 when the request body is not a JSON object", async () => {
    const request = new Request("http://localhost/api/admin/execution-plan/generate", {
      method: "POST",
      body: JSON.stringify(["pilot-demo"]),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      error: "Request body must be a JSON object.",
    });
    expect(mocks.generateExecutionPlanDraft).not.toHaveBeenCalled();
  });
});