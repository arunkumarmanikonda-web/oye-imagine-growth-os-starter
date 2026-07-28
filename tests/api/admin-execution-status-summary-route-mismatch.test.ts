import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const storeMockFns = {
  getExecutionStatusDraft: vi.fn(),
};

const generatorMockFns = {
  generateExecutionStatusDraft: vi.fn(),
};

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: storeMockFns.getExecutionStatusDraft,
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: generatorMockFns.generateExecutionStatusDraft,
}));

function makeSummary(pilotId: string) {
  return {
    pilotId,
    campaignName: "Neejee Activation Sprint",
    overallStatus: "In progress",
    completedCount: 1,
    inProgressCount: 2,
    blockedCount: 0,
    upcomingCount: 3,
    lastUpdatedAt: "2026-01-02T10:30:00.000Z",
    detailHref: "/admin/execution-status/" + pilotId,
  };
}

function makePersistedDraft(pilotId: string) {
  const summary = makeSummary(pilotId);

  return {
    ...summary,
    summary,
    draft: {
      pilotId,
      updatedAt: "2026-01-02T10:30:00.000Z",
    },
    updatedAt: "2026-01-02T10:30:00.000Z",
  };
}

describe("admin execution status summary route mismatch fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();

  });

  it("regenerates when persisted execution-status summary belongs to another pilot", async () => {
    storeMockFns.getExecutionStatusDraft.mockResolvedValue(makePersistedDraft("wrong-pilot"));
    generatorMockFns.generateExecutionStatusDraft.mockResolvedValue(makePersistedDraft("pilot-123"));

    const { GET } = await import("@/app/api/admin/execution-status/summary/route");

    const request = new NextRequest(
      "http://localhost/api/admin/execution-status/summary?pilotId=pilot-123",
    );

    const response = await GET(request);
    const payload = await response.json();

    const resolvedPilotId =
      typeof payload?.pilotId === "string"
        ? payload.pilotId
        : payload?.summary?.pilotId;

    expect(response.status).toBe(200);
    expect(storeMockFns.getExecutionStatusDraft).toHaveBeenCalled();
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(resolvedPilotId).toBe("pilot-123");

  });
});