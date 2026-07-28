import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ExecutionStatusDetailRail,
  type ExecutionStatusDetailRailSummary,
} from "@/app/admin/execution/execution-status-detail-rail";

describe("execution status detail rail", () => {
  it("renders the summary state from hub data", () => {
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

    const html = renderToStaticMarkup(
      React.createElement(ExecutionStatusDetailRail, {
        loading: false,
        summary,
      })
    );

    expect(html).toContain("Neejee Activation Sprint");
    expect(html).toContain("In progress");
    expect(html).toContain("2026-01-02 10:30 UTC");
    expect(html).toContain('href="/admin/execution-status/pilot-123"');
    expect(html).toContain("Completed");
    expect(html).toContain("3");
    expect(html).toContain("Blocked");
    expect(html).toContain("1");
  });

  it("renders loading state", () => {
    const html = renderToStaticMarkup(
      React.createElement(ExecutionStatusDetailRail, {
        loading: true,
        summary: null,
      })
    );

    expect(html).toContain('data-testid="execution-status-detail-rail-loading"');
    expect(html).toContain("Loading latest execution status");
  });

  it("renders unavailable state when summary is absent after loading", () => {
    const html = renderToStaticMarkup(
      React.createElement(ExecutionStatusDetailRail, {
        loading: false,
        summary: null,
      })
    );

    expect(html).toContain('data-testid="execution-status-detail-rail-unavailable"');
    expect(html).toContain("Execution status summary is not available");
  });
});