import { beforeEach, describe, expect, it } from "vitest";

import { generateStrategyBrief } from "@/lib/admin/strategy-generator";
import { resetPilotStore } from "@/lib/admin/pilot-store";
import { getStrategyBrief, resetStrategyBriefStore } from "@/lib/admin/strategy-store";

describe("admin strategy generator", () => {
  beforeEach(() => {
    resetPilotStore({
      id: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      website: "https://neejee.example",
      industry: "Healthcare",
      geo: "India + GCC",
      targetAudience: "Founders and clinic operators",
      offer: "Growth operating system",
      monthlyBudget: "250000",
      primaryChannels: ["seo", "google-ads", "meta-ads"],
      competitors: ["Competitor One", "Competitor Two"],
      goals: ["Qualified leads", "Demo bookings"],
      successMetrics: ["CPL", "Consultation rate"],
      status: "in_progress",
    });

    resetStrategyBriefStore();
  });

  it("builds a deterministic strategy brief from the current pilot", () => {
    const strategy = generateStrategyBrief("neejee-pilot");

    expect(strategy.id).toBe("neejee-strategy-brief");
    expect(strategy.pilotId).toBe("neejee-pilot");
    expect(strategy.brandName).toBe("Neejee Clinics");
    expect(strategy.status).toBe("generated");
    expect(strategy.positioning).toContain("Neejee Clinics");
    expect(strategy.marketSummary).toContain("Healthcare");
    expect(strategy.messagingPillars.length).toBe(3);
    expect(strategy.audienceSegments.length).toBe(2);
    expect(strategy.channelRecommendations.map((entry) => entry.channel)).toEqual([
      "SEO",
      "Google Ads",
      "Meta Ads",
    ]);
    expect(strategy.plan30Days[0]?.label).toBe("Foundation");
    expect(strategy.plan60Days[0]?.label).toBe("Launch");
    expect(strategy.plan90Days[0]?.label).toBe("Optimization");
    expect(strategy.successMetrics).toEqual(["CPL", "Consultation rate"]);
    expect(strategy.assumptions.length).toBeGreaterThanOrEqual(3);
    expect(strategy.blockers.length).toBeGreaterThanOrEqual(2);
  });

  it("persists the generated brief into the strategy store", () => {
    const generated = generateStrategyBrief("neejee-pilot");
    const persisted = getStrategyBrief();

    expect(persisted.status).toBe("generated");
    expect(persisted.brandName).toBe("Neejee Clinics");
    expect(persisted.positioning).toBe(generated.positioning);
    expect(persisted.channelRecommendations).toHaveLength(3);
  });

  it("throws when a different pilot id is requested", () => {
    expect(() => generateStrategyBrief("other-pilot")).toThrow(
      "Pilot 'other-pilot' not found.",
    );
  });
});