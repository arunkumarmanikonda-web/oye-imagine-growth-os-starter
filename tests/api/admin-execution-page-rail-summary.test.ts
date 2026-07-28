import { describe, expect, it } from "vitest";

import { getExecutionStatusDetailRailSummary } from "@/app/admin/execution/page";
import type { ExecutionStatusDetailRailSummary } from "@/app/admin/execution/execution-status-detail-rail";

describe("admin execution page rail summary helper", () => {
  it("returns null when execution status summary is absent", () => {
    const result = getExecutionStatusDetailRailSummary({} as never);

    expect(result).toBeNull();
  });

  it("returns the execution status summary when present", () => {
    const summary: ExecutionStatusDetailRailSummary = {
      pilotId: "pilot-123",
      campaignName: "Neejee Activation Sprint",
      overallStatus: "In progress",
      completedCount: 3,
      inProgressCount: 2,
      blockedCount: 1,
      upcomingCount: 4,
      lastUpdatedAt: "2026-01-02T10:30:00.000Z",
      detailHref: "/admin/execution-status/pilot-123",
    };

    const result = getExecutionStatusDetailRailSummary({
      executionStatusSummary: summary,
    } as never);

    expect(result).toEqual(summary);
  });
});