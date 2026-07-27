import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildLandingPageBriefFromPilot,
  generateLandingPageBrief,
} from "@/lib/admin/landing-page-generator";
import {
  getLandingPageBrief,
  resetLandingPageBriefStore,
} from "@/lib/admin/landing-page-store";
import type { NeejeePilotRecord } from "@/lib/admin/pilot-schema";
import type { StrategyBriefRecord } from "@/lib/admin/strategy-schema";

const getPilotMock = vi.fn();
const getStrategyBriefMock = vi.fn();

vi.mock("@/lib/admin/pilot-store", () => ({
  getPilot: getPilotMock,
}));

vi.mock("@/lib/admin/strategy-store", () => ({
  getStrategyBrief: getStrategyBriefMock,
}));

const pilotFixture = {
  pilotId: "neejee-pilot",
  workspaceId: "oye-imagine",
  workspaceDisplayName: "Oye Imagine",
  brandName: "Neejee Clinics",
  services: ["Hair Transplant", "Skin Clinic"],
  updatedAt: "2026-07-27T12:00:00.000Z",
} as unknown as NeejeePilotRecord;

const strategyFixture = {
  pilotId: "neejee-pilot",
  brandName: "Neejee Clinics",
  status: "approved",
  updatedAt: "2026-07-27T12:30:00.000Z",
  messagingPillars: [
    { title: "Trust and transparency" },
    { title: "Specialist-led care" },
    { title: "Simple next steps" },
  ],
  audienceSegments: [
    { name: "High-intent search traffic" },
    { name: "Warm referral leads" },
  ],
  channelRecommendations: [
    { channel: "Google Search" },
    { channel: "Meta Retargeting" },
  ],
} as unknown as StrategyBriefRecord;

describe("landing-page-generator", () => {
  beforeEach(() => {
    resetLandingPageBriefStore();
    getPilotMock.mockReset();
    getStrategyBriefMock.mockReset();
    getPilotMock.mockReturnValue(pilotFixture);
    getStrategyBriefMock.mockReturnValue(strategyFixture);
  });

  it("builds a deterministic landing page brief from pilot and strategy data", () => {
    const brief = buildLandingPageBriefFromPilot(pilotFixture, strategyFixture);
    const record = brief as unknown as Record<string, any>;

    expect(record.pilotId).toBe("neejee-pilot");
    expect(record.brandName).toBe("Neejee Clinics");
    expect(record.hero.headline).toContain("Neejee Clinics");
    expect(record.sections.length).toBeGreaterThanOrEqual(4);
    expect(record.seo.title).toContain("Hair Transplant");
  });

  it("persists a generated landing page brief in the store", () => {
    const brief = generateLandingPageBrief({ pilotId: "neejee-pilot" });
    const saved = getLandingPageBrief("neejee-pilot") as unknown as Record<string, any>;
    const generated = brief as unknown as Record<string, any>;

    expect(saved).toBeTruthy();
    expect(saved.hero.headline).toBe(generated.hero.headline);
    expect(saved.status).toBe("draft");
  });

  it("throws when the pilot cannot be found", () => {
    getPilotMock.mockReturnValueOnce(null);

    expect(() =>
      generateLandingPageBrief({ pilotId: "missing-pilot", forceRegenerate: true }),
    ).toThrow("Pilot not found: missing-pilot");
  });
});