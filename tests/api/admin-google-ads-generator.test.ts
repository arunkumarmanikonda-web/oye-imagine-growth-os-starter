import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPilotMock,
  getStrategyBriefMock,
  getLandingPageBriefMock,
} = vi.hoisted(() => ({
  getPilotMock: vi.fn(),
  getStrategyBriefMock: vi.fn(),
  getLandingPageBriefMock: vi.fn(),
}));

vi.mock("@/lib/admin/pilot-store", () => ({
  getPilot: getPilotMock,
}));

vi.mock("@/lib/admin/strategy-store", () => ({
  getStrategyBrief: getStrategyBriefMock,
}));

vi.mock("@/lib/admin/landing-page-store", () => ({
  getLandingPageBrief: getLandingPageBriefMock,
}));

import {
  buildGoogleAdsDraftFromPilot,
  generateGoogleAdsDraft,
} from "@/lib/admin/google-ads-generator";
import {
  getGoogleAdsDraft,
  resetGoogleAdsDraftStore,
} from "@/lib/admin/google-ads-store";
import type { NeejeePilotRecord } from "@/lib/admin/pilot-schema";
import type { StrategyBriefRecord } from "@/lib/admin/strategy-schema";

const pilotFixture = {
  pilotId: "neejee-pilot",
  workspaceId: "oye-imagine",
  workspaceDisplayName: "Oye Imagine",
  brandName: "Neejee Clinics",
  services: ["Hair Transplant", "Skin Clinic"],
  geoTargets: ["Bengaluru", "Whitefield"],
  updatedAt: "2026-07-27T12:00:00.000Z",
} as unknown as NeejeePilotRecord;

const strategyFixture = {
  pilotId: "neejee-pilot",
  brandName: "Neejee Clinics",
  objective: "Generate qualified consultation demand.",
  messagingPillars: [
    { title: "Trust and transparency" },
    { title: "Specialist-led care" },
  ],
  audienceSegments: [
    { name: "High-intent search traffic" },
    { name: "Warm referral leads" },
  ],
  updatedAt: "2026-07-27T12:30:00.000Z",
} as unknown as StrategyBriefRecord;

const landingPageFixture = {
  pilotId: "neejee-pilot",
  landingPageUrl: "/landing/neejee-pilot",
  ctas: [
    { label: "Book Consultation" },
    { label: "Treatment Options" },
  ],
};

describe("admin google ads generator", () => {
  beforeEach(() => {
    resetGoogleAdsDraftStore();
    getPilotMock.mockReset();
    getStrategyBriefMock.mockReset();
    getLandingPageBriefMock.mockReset();

    getPilotMock.mockReturnValue(pilotFixture);
    getStrategyBriefMock.mockReturnValue(strategyFixture);
    getLandingPageBriefMock.mockReturnValue(landingPageFixture);
  });

  it("builds a deterministic Google Ads draft from pilot inputs", () => {
    const draft = buildGoogleAdsDraftFromPilot(
      pilotFixture,
      strategyFixture,
      landingPageFixture,
    );
    const record = draft as unknown as Record<string, any>;

    expect(record.pilotId).toBe("neejee-pilot");
    expect(record.brandName).toBe("Neejee Clinics");
    expect(record.landingPageUrl).toBe("/landing/neejee-pilot");
    expect(record.keywordClusters.length).toBeGreaterThanOrEqual(2);
    expect(record.adCopy.length).toBeGreaterThanOrEqual(2);
  });

  it("persists a generated Google Ads draft in the store", () => {
    const draft = generateGoogleAdsDraft({ pilotId: "neejee-pilot" });
    const saved = getGoogleAdsDraft() as unknown as Record<string, any>;
    const generated = draft as unknown as Record<string, any>;

    expect(saved).toBeTruthy();
    expect(saved.objective).toBe(generated.objective);
    expect(saved.brandName).toBe("Neejee Clinics");
    expect(saved.keywordClusters.length).toBeGreaterThan(0);
  });

  it("throws when the pilot cannot be found", () => {
    getPilotMock.mockReturnValueOnce(null);

    expect(() =>
      generateGoogleAdsDraft({ pilotId: "missing-pilot", forceRegenerate: true }),
    ).toThrow("Pilot not found: missing-pilot");
  });
});