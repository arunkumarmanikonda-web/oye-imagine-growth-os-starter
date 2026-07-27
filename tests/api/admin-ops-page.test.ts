import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PilotStatusCard, type PilotStatusSummary } from "@/app/admin/ops/page";

describe("PilotStatusCard", () => {
  it("renders pilot readiness details", () => {
    const pilotStatus: PilotStatusSummary = {
      ok: true,
      workspaceDisplayName: "Oye Imagine",
      pilotId: "neejee-pilot",
      status: "ready_for_review",
      completedFields: 8,
      totalFields: 10,
      completionPercent: 80,
      missingFields: ["website", "successMetrics"],
      lastUpdatedAt: "2026-07-27T12:00:00.000Z",
    };

    const html = renderToStaticMarkup(
      React.createElement(PilotStatusCard, {
        pilotStatus,
        loading: false,
        error: null,
      }),
    );

    expect(html).toContain("Pilot readiness");
    expect(html).toContain("Neejee pilot status");
    expect(html).toContain("80% complete");
    expect(html).toContain("8 / 10");
    expect(html).toContain("ready_for_review");
    expect(html).toContain("Website");
    expect(html).toContain("Success Metrics");
    expect(html).toContain("/admin/pilot");
    expect(html).toContain("/admin/onboarding");
  });

  it("renders unavailable state when no pilot status exists", () => {
    const html = renderToStaticMarkup(
      React.createElement(PilotStatusCard, {
        pilotStatus: null,
        loading: false,
        error: null,
      }),
    );

    expect(html).toContain("Pilot readiness unavailable.");
  });
});