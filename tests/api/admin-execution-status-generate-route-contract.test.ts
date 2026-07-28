import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: mocks.generateExecutionStatusDraft,
}));

import { POST } from "@/app/api/admin/execution-status/generate/route";

describe("admin execution status generate route contract cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trims surrounding whitespace from pilotId before generation", async () => {
    mocks.generateExecutionStatusDraft.mockReturnValue({
      pilotId: "pilot-123",
      generatedAt: "2026-01-01T00:15:00.000Z",
      summary: {
        pilotId: "pilot-123",
        campaignName: "Neejee rollout",
        overallStatus: "Execution active.",
        completedCount: 2,
        inProgressCount: 1,
        blockedCount: 1,
        upcomingCount: 2,
        lastUpdatedAt: "2026-01-01T00:15:00.000Z",
        detailHref: "/admin/execution-status/pilot-123",
      },
      draft: {
        pilotId: "pilot-123",
        campaignName: "Neejee rollout",
        overallStatus: "Execution active.",
        generatedAt: "2026-01-01T00:15:00.000Z",
        steps: [],
      },
    });

    const request = new Request("http://localhost/api/admin/execution-status/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ pilotId: "  pilot-123  " }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(mocks.generateExecutionStatusDraft).toHaveBeenCalledWith({
      pilotId: "pilot-123",
    });
    expect(json).toMatchObject({
      pilotId: "pilot-123",
    });
  });

  it("falls back to default generation when pilotId is blank after trimming", async () => {
    mocks.generateExecutionStatusDraft.mockReturnValue({
      pilotId: "pilot-default",
      generatedAt: "2026-01-01T00:15:00.000Z",
      summary: {
        pilotId: "pilot-default",
        campaignName: "Default rollout",
        overallStatus: "Execution active.",
        completedCount: 1,
        inProgressCount: 1,
        blockedCount: 0,
        upcomingCount: 1,
        lastUpdatedAt: "2026-01-01T00:15:00.000Z",
        detailHref: "/admin/execution-status/pilot-default",
      },
      draft: {
        pilotId: "pilot-default",
        campaignName: "Default rollout",
        overallStatus: "Execution active.",
        generatedAt: "2026-01-01T00:15:00.000Z",
        steps: [],
      },
    });

    const request = new Request("http://localhost/api/admin/execution-status/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ pilotId: "   " }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(mocks.generateExecutionStatusDraft).toHaveBeenCalledWith({
      pilotId: undefined,
    });
    expect(json).toMatchObject({
      pilotId: "pilot-default",
    });
  });
});