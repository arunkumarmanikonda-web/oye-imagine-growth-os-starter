import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: mocks.generateExecutionStatusDraft,
}));

import { POST } from "@/app/api/admin/execution-status/generate/route";

describe("admin execution status generate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.generateExecutionStatusDraft.mockReturnValue({
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
  });

  it("generates and returns an execution status draft", async () => {
    const request = new Request(
      "http://localhost/api/admin/execution-status/generate",
      {
        method: "POST",
        body: JSON.stringify({ pilotId: "pilot-123" }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.generateExecutionStatusDraft).toHaveBeenCalledWith({
      pilotId: "pilot-123",
    });
    expect(json).toMatchObject({
      id: "execution-status-pilot-demo",
      pilotId: "pilot-demo",
      campaignName: "Acme Launch Rollout",
    });
  });

  it("uses defaults when request body is empty", async () => {
    const request = new Request(
      "http://localhost/api/admin/execution-status/generate",
      {
        method: "POST",
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.generateExecutionStatusDraft).toHaveBeenCalledWith({
      pilotId: "pilot-demo",
    });
  });

  it("returns 404 when the pilot does not exist", async () => {
    mocks.generateExecutionStatusDraft.mockImplementation(() => {
      throw new Error("Pilot not found: missing-pilot");
    });

    const request = new Request(
      "http://localhost/api/admin/execution-status/generate",
      {
        method: "POST",
        body: JSON.stringify({ pilotId: "missing-pilot" }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({
      error: 'Execution status draft could not be generated for "missing-pilot".',
    });
  });

  it("returns 400 when the request body is not a JSON object", async () => {
    const request = new Request(
      "http://localhost/api/admin/execution-status/generate",
      {
        method: "POST",
        body: JSON.stringify(["pilot-demo"]),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      error: "Request body must be a JSON object.",
    });
    expect(mocks.generateExecutionStatusDraft).not.toHaveBeenCalled();
  });
});