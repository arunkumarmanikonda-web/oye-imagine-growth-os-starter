import { beforeEach, describe, expect, it, vi } from "vitest";

const storeMockFns = vi.hoisted(() => ({
  getExecutionStatusDraft: vi.fn(),
  saveExecutionStatusDraft: vi.fn(),
}));

const generatorMockFns = vi.hoisted(() => ({
  generateExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: storeMockFns.getExecutionStatusDraft,
  saveExecutionStatusDraft: storeMockFns.saveExecutionStatusDraft,
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: generatorMockFns.generateExecutionStatusDraft,
}));

import { GET } from "@/app/api/admin/execution-status/summary/route";

type Summary = {
  pilotId: string;
  campaignName: string;
  overallStatus: string;
  completedCount: number;
  inProgressCount: number;
  blockedCount: number;
  upcomingCount: number;
  lastUpdatedAt: string;
  detailHref: string;
};

function makeSummary(pilotId: string, overrides: Partial<Summary> = {}): Summary {
  return {
    pilotId,
    campaignName: "Neejee execution rollout",
    overallStatus: "Launch motion is active with one blocker under review.",
    completedCount: 2,
    inProgressCount: 1,
    blockedCount: 1,
    upcomingCount: 2,
    lastUpdatedAt: "2026-01-01T00:15:00.000Z",
    detailHref: `/admin/execution-status/${pilotId}`,
    ...overrides,
  };
}

function makeDraft(summary: Summary) {
  return {
    generatedAt: "2026-01-01T00:15:00.000Z",
    pilotId: summary.pilotId,
    summary,
    draft: {
      pilotId: summary.pilotId,
      campaignName: summary.campaignName,
      overallStatus: summary.overallStatus,
      generatedAt: summary.lastUpdatedAt,
      steps: [
        { status: "completed", label: "Creative brief approved" },
        { status: "completed", label: "Audience shortlist finalized" },
        { status: "in_progress", label: "Landing page revision in flight" },
        { status: "blocked", label: "Pixel validation blocked by access" },
        { status: "upcoming", label: "Paid launch checklist" },
        { status: "upcoming", label: "Retargeting audience sync" },
      ],
    },
  };
}

describe("admin execution status summary route edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reuses a matching persisted draft when pilotId query matches", async () => {
    const persisted = makeDraft(makeSummary("pilot-123"));
    storeMockFns.getExecutionStatusDraft.mockReturnValue(persisted);

    const response = await GET(
      new Request("http://localhost/api/admin/execution-status/summary?pilotId=pilot-123")
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(storeMockFns.getExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).not.toHaveBeenCalled();
    expect(json).toEqual(persisted.summary);
  });

  it("regenerates when persisted draft is malformed", async () => {
    const generated = makeDraft(
      makeSummary("pilot-123", {
        campaignName: "Generated fallback summary",
        overallStatus: "Recovered by regeneration.",
      })
    );

    storeMockFns.getExecutionStatusDraft.mockReturnValue({
      pilotId: "pilot-123",
      generatedAt: "2026-01-01T00:15:00.000Z",
      summary: null,
      draft: null,
    });
    generatorMockFns.generateExecutionStatusDraft.mockResolvedValue(generated);

    const response = await GET(
      new Request("http://localhost/api/admin/execution-status/summary?pilotId=pilot-123")
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(storeMockFns.getExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledWith({ pilotId: "pilot-123" });
    expect(json).toEqual(generated.summary);
  });

  it("returns 500 when generation throws a non-not-found error", async () => {
    storeMockFns.getExecutionStatusDraft.mockReturnValue(null);
    generatorMockFns.generateExecutionStatusDraft.mockRejectedValue(new Error("database offline"));

    const response = await GET(
      new Request("http://localhost/api/admin/execution-status/summary?pilotId=pilot-123")
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to load execution status summary." });
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledWith({ pilotId: "pilot-123" });
  });
});