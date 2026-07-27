import { beforeEach, describe, expect, it } from "vitest";

import {
  createDefaultStrategyBrief,
  getStrategyBrief,
  resetStrategyBriefStore,
  saveStrategyBrief,
  updateStrategyBrief,
} from "@/lib/admin/strategy-store";

describe("admin strategy store", () => {
  beforeEach(() => {
    resetStrategyBriefStore();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
  });

  it("creates the default Neejee strategy brief with branding fallback", () => {
    const strategy = createDefaultStrategyBrief();

    expect(strategy.id).toBe("neejee-strategy-brief");
    expect(strategy.workspaceDisplayName).toBe("Oye Imagine");
    expect(strategy.brandName).toBe("Neejee Clinics");
    expect(strategy.messagingPillars.length).toBeGreaterThanOrEqual(3);
    expect(strategy.audienceSegments.length).toBeGreaterThanOrEqual(2);
    expect(strategy.channelRecommendations.length).toBeGreaterThanOrEqual(3);
    expect(strategy.plan30Days.length).toBeGreaterThanOrEqual(1);
    expect(strategy.plan60Days.length).toBeGreaterThanOrEqual(1);
    expect(strategy.plan90Days.length).toBeGreaterThanOrEqual(1);
  });

  it("uses NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME when available", async () => {
    process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME = "Neejee OS";
    const { createDefaultStrategyBriefFixture } = await import(
      "@/lib/admin/strategy-fixtures"
    );

    const strategy = createDefaultStrategyBriefFixture();

    expect(strategy.workspaceDisplayName).toBe("Neejee OS");
  });

  it("saves strategy arrays and refreshes lastUpdatedAt", async () => {
    createDefaultStrategyBrief();
    const before = getStrategyBrief().lastUpdatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));

    const strategy = saveStrategyBrief({
      status: "generated",
      messagingPillars: [
        {
          title: "Trust",
          description: "Build trust with clear compliance and measurement.",
        },
      ],
      audienceSegments: [
        {
          name: "Clinic owners",
          painPoints: ["Lead inconsistency"],
          buyingSignals: ["Needs pipeline visibility"],
        },
      ],
      channelRecommendations: [
        {
          channel: "SEO",
          objective: "Capture intent",
          rationale: "Rank for clinic and treatment searches.",
        },
      ],
      successMetrics: ["CPL", "Booked consultations"],
      blockers: ["Awaiting legal review"],
    });

    expect(strategy.status).toBe("generated");
    expect(strategy.messagingPillars).toHaveLength(1);
    expect(strategy.audienceSegments[0]?.name).toBe("Clinic owners");
    expect(strategy.channelRecommendations[0]?.channel).toBe("SEO");
    expect(strategy.successMetrics).toEqual(["CPL", "Booked consultations"]);
    expect(strategy.lastUpdatedAt > before).toBe(true);
  });

  it("updates the existing strategy without losing prior fields", () => {
    createDefaultStrategyBrief();

    const updated = updateStrategyBrief({
      status: "ready_for_review",
      offerSummary: "Updated offer summary",
    });

    expect(updated.status).toBe("ready_for_review");
    expect(updated.offerSummary).toBe("Updated offer summary");
    expect(updated.brandName).toBe("Neejee Clinics");
    expect(updated.channelRecommendations.length).toBeGreaterThan(0);
    expect(updated.plan90Days.length).toBeGreaterThan(0);
  });
});