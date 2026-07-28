import { beforeEach, describe, expect, it, vi } from "vitest";

const storeMockFns = vi.hoisted(() => ({
  getExecutionStatusDraft: vi.fn(),
}));

const generatorMockFns = vi.hoisted(() => ({
  generateExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: storeMockFns.getExecutionStatusDraft,
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: generatorMockFns.generateExecutionStatusDraft,
}));

import ExecutionStatusPage from "@/app/admin/execution-status/[pilotId]/page";

function makeDraft(pilotId: string) {
  return {
    generatedAt: "2026-01-01T00:15:00.000Z",
    pilotId,
    summary: {
      pilotId,
      campaignName: "Generated execution plan",
      overallStatus: "Recovered by regeneration.",
      completedCount: 2,
      inProgressCount: 1,
      blockedCount: 1,
      upcomingCount: 2,
      lastUpdatedAt: "2026-01-01T00:15:00.000Z",
      detailHref: `/admin/execution-status/${pilotId}`,
    },
    draft: {
      pilotId,
      campaignName: "Generated execution plan",
      overallStatus: "Recovered by regeneration.",
      generatedAt: "2026-01-01T00:15:00.000Z",
      steps: [
        { status: "completed", label: "Step 1" },
        { status: "completed", label: "Step 2" },
        { status: "in_progress", label: "Step 3" },
        { status: "blocked", label: "Step 4" },
        { status: "upcoming", label: "Step 5" },
        { status: "upcoming", label: "Step 6" },
      ],
    },
  };
}

describe("admin execution status page malformed persisted draft fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("regenerates when persisted draft shape is malformed", async () => {
    const generated = makeDraft("pilot-123");
    storeMockFns.getExecutionStatusDraft.mockReturnValue({
      pilotId: "pilot-123",
      generatedAt: "2026-01-01T00:15:00.000Z",
      summary: null,
      draft: null,
    });
    generatorMockFns.generateExecutionStatusDraft.mockResolvedValue(generated);

    const page = await ExecutionStatusPage({
      params: Promise.resolve({ pilotId: "pilot-123" }),
    });

    expect(page).toBeTruthy();
    expect(storeMockFns.getExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledWith({ pilotId: "pilot-123" });
  });
});