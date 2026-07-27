import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPilotMock,
  getStrategyBriefMock,
  getLandingPageBriefMock,
  getGoogleAdsDraftMock,
} = vi.hoisted(() => ({
  getPilotMock: vi.fn(),
  getStrategyBriefMock: vi.fn(),
  getLandingPageBriefMock: vi.fn(),
  getGoogleAdsDraftMock: vi.fn(),
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

vi.mock("@/lib/admin/google-ads-store", () => ({
  getGoogleAdsDraft: getGoogleAdsDraftMock,
}));

import {
  buildEmailSequenceDraftFromPilot,
  generateEmailSequenceDraft,
} from "@/lib/admin/email-sequence-generator";
import {
  getEmailSequenceDraft,
  resetEmailSequenceDraftStore,
} from "@/lib/admin/email-sequence-store";

describe("admin email sequence generator", () => {
  beforeEach(() => {
    resetEmailSequenceDraftStore();
    getPilotMock.mockReset();
    getStrategyBriefMock.mockReset();
    getLandingPageBriefMock.mockReset();
    getGoogleAdsDraftMock.mockReset();
  });

  it("builds a deterministic email sequence draft from pilot inputs", () => {
    getPilotMock.mockReturnValue({
      id: "pilot-email-1",
      workspaceId: "workspace-email-1",
      companyName: "Neejee",
      contactName: "Avery Stone",
      contactEmail: "avery@neejee.com",
    });

    getStrategyBriefMock.mockReturnValue({
      pilotId: "pilot-email-1",
      audience: "Founder-led B2B growth team",
      painPoint:
        "Campaign execution is fragmented across strategy, pages, ads, and email",
      desiredOutcome: "Ship coordinated campaigns faster without rewriting each asset",
      summary:
        "Turn one clear strategy into coordinated execution across page, ads, and email.",
    });

    getLandingPageBriefMock.mockReturnValue({
      pilotId: "pilot-email-1",
      url: "https://example.com/neejee-growth-system",
      hero: {
        headline: "One strategy, every asset aligned",
        subheadline: "Turn one brief into aligned pages, ads, and email.",
        primaryCta: "Book intro",
      },
    });

    getGoogleAdsDraftMock.mockReturnValue({
      pilotId: "pilot-email-1",
      campaignName: "Neejee growth system",
      headlines: [
        "Launch your growth system faster",
        "Keep every campaign asset aligned",
      ],
      descriptions: [
        "Replace scattered execution with one coordinated operating system.",
      ],
    });

    const draft = buildEmailSequenceDraftFromPilot("pilot-email-1");

    expect(draft).toMatchObject({
      pilotId: "pilot-email-1",
      workspaceId: "workspace-email-1",
      sequenceName: "Neejee founder introduction sequence",
      senderName: "Avery Stone",
      senderEmail: "avery@neejee.com",
      strategySummary:
        "Turn one clear strategy into coordinated execution across page, ads, and email.",
      landingPageUrl: "https://example.com/neejee-growth-system",
      audience: {
        persona: "Founder-led B2B growth team",
        painPoint:
          "Campaign execution is fragmented across strategy, pages, ads, and email",
        desiredOutcome: "Ship coordinated campaigns faster without rewriting each asset",
      },
    });

    expect(draft.emails).toHaveLength(3);
    expect(draft.emails[0]).toMatchObject({
      subject: "Launch your growth system faster",
      previewText: "One strategy, every asset aligned",
      ctaLabel: "Book intro",
      ctaHref: "https://example.com/neejee-growth-system",
      sendDelayDays: 0,
    });

    expect(draft.notes).toContain(
      "Align email subject lines with proven Google Ads language.",
    );
    expect(draft.notes).toContain(
      "Landing page anchor: One strategy, every asset aligned",
    );
  });

  it("persists a generated email sequence draft in the store", () => {
    getPilotMock.mockReturnValue({
      id: "pilot-email-2",
      workspaceId: "workspace-email-2",
      companyName: "Neejee",
      contactName: "Avery Stone",
      contactEmail: "avery@neejee.com",
    });

    getStrategyBriefMock.mockReturnValue({
      pilotId: "pilot-email-2",
      audience: "Revenue operations lead",
      painPoint: "Outbound execution is inconsistent across channels",
      desiredOutcome: "Run coordinated campaigns with less rework",
      summary: "Create one campaign spine that drives page, ads, and lifecycle email.",
    });

    getLandingPageBriefMock.mockReturnValue({
      pilotId: "pilot-email-2",
      url: "https://example.com/neejee-revops",
      hero: {
        headline: "A campaign system your team can actually run",
        subheadline: "Keep every channel aligned without starting from zero.",
        primaryCta: "View page",
      },
    });

    getGoogleAdsDraftMock.mockReturnValue({
      pilotId: "pilot-email-2",
      campaignName: "Neejee revops system",
      headlines: ["Run coordinated campaigns with less rework"],
      descriptions: ["Keep every channel aligned without starting from zero."],
    });

    const draft = generateEmailSequenceDraft("pilot-email-2");
    const stored = getEmailSequenceDraft();

    expect(draft.pilotId).toBe("pilot-email-2");
    expect(stored?.pilotId).toBe("pilot-email-2");
    expect(stored?.emails[0]?.subject).toBe("Run coordinated campaigns with less rework");
  });

  it("throws when the pilot cannot be found", () => {
    getPilotMock.mockReturnValue(null);

    expect(() => generateEmailSequenceDraft("pilot-missing")).toThrow(
      "Pilot not found: pilot-missing",
    );
  });
});