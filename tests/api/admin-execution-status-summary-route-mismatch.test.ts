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
    detailHref: \/admin/execution-status/\\,
  };
}

describe("admin execution status summary route mismatch fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();

  });

  it("regenerates when persisted execution-status summary belongs to another pilot", async () => {
    storeMockFns.getExecutionStatusDraft.mockResolvedValue(makeSummary("wrong-pilot"));
    generatorMockFns.generateExecutionStatusDraft.mockResolvedValue(makeSummary("pilot-123"));

    const { GET } = await import("@/app/api/admin/execution-status/summary/route");

    const request = new NextRequest(
      "http://localhost/api/admin/execution-status/summary?pilotId=pilot-123",
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(storeMockFns.getExecutionStatusDraft).toHaveBeenCalled();
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
  });
});