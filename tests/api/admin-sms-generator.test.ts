import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getPilotMock,
  getStrategyBriefMock,
  getLandingPageBriefMock,
  getGoogleAdsDraftMock,
  getEmailSequenceDraftMock,
} = vi.hoisted(() => ({
  getPilotMock: vi.fn(),
  getStrategyBriefMock: vi.fn(),
  getLandingPageBriefMock: vi.fn(),
  getGoogleAdsDraftMock: vi.fn(),
  getEmailSequenceDraftMock: vi.fn(),
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

vi.mock("@/lib/admin/email-sequence-store", async () => {
  const actual = await vi.importActual<typeof import("@/lib/admin/email-sequence-store")>(
    "@/lib/admin/email-sequence-store",
  );

  return {
    ...actual,
    getEmailSequenceDraft: getEmailSequenceDraftMock,
  };
});

import {
  buildSmsDraftFromPilot,
  generateSmsDraft,
} from "@/lib/admin/sms-generator";
import {
  getSmsDraft,
  resetSmsDraftStore,
} from "@/lib/admin/sms-store";

describe("admin sms generator", () => {
  beforeEach(() => {
    resetSmsDraftStore();
    getPilotMock.mockReset();
    getStrategyBriefMock.mockReset();
    getLandingPageBriefMock.mockReset();
    getGoogleAdsDraftMock.mockReset();
    getEmailSequenceDraftMock.mockReset();
  });

  it("builds a deterministic SMS draft from pilot inputs", () => {
    getPilotMock.mockReturnValue({
      id: "pilot-sms-1",
      workspaceId: "workspace-sms-1",
      companyName: "Neejee",
      contactName: "Avery Stone",
    });

    getStrategyBriefMock.mockReturnValue({
      pilotId: "pilot-sms-1",
      audience: "Founder-led B2B growth team",
      painPoint:
        "Campaign execution is fragmented across strategy, pages, ads, and follow-up",
      desiredOutcome: "Launch coordinated campaigns faster without rewriting each asset",
    });

    getLandingPageBriefMock.mockReturnValue({
      pilotId: "pilot-sms-1",
      hero: {
        headline: "One strategy, every asset aligned",
        subheadline: "Turn one brief into aligned pages, ads, email, and follow-up.",
      },
    });

    getGoogleAdsDraftMock.mockReturnValue({
      pilotId: "pilot-sms-1",
      headlines: [
        "Launch your growth system faster",
        "Keep every campaign asset aligned",
      ],
      descriptions: [
        "Replace scattered execution with one coordinated operating system.",
      ],
    });

    getEmailSequenceDraftMock.mockReturnValue({
      pilotId: "pilot-sms-1",
      emails: [
        { subject: "Launch your growth system faster" },
        { subject: "How Neejee keeps campaign execution aligned" },
      ],
    });

    const draft = buildSmsDraftFromPilot("pilot-sms-1");

    expect(draft).toMatchObject({
      pilotId: "pilot-sms-1",
      workspaceId: "workspace-sms-1",
      senderName: "Avery Stone",
      audience: {
        persona: "Founder-led B2B growth team",
        painPoint:
          "Campaign execution is fragmented across strategy, pages, ads, and follow-up",
        desiredOutcome: "Launch coordinated campaigns faster without rewriting each asset",
      },
    });

    expect(draft.messages).toHaveLength(3);
    expect(draft.messages[0]?.body).toContain("Avery Stone here");
    expect(draft.messages[0]?.body).toContain("Launch your growth system faster");
    expect(draft.messages[1]?.body).toContain("Keep every campaign asset aligned");
    expect(draft.notes).toContain("Landing page anchor: One strategy, every asset aligned");
  });

  it("persists a generated SMS draft in the store", () => {
    getPilotMock.mockReturnValue({
      id: "pilot-sms-2",
      workspaceId: "workspace-sms-2",
      companyName: "Neejee",
      contactName: "Jordan Lee",
    });

    getStrategyBriefMock.mockReturnValue({
      pilotId: "pilot-sms-2",
      audience: "Revenue operations lead",
      painPoint: "Outbound execution is inconsistent across channels",
      desiredOutcome: "Run coordinated campaigns with less rework",
    });

    getLandingPageBriefMock.mockReturnValue({
      pilotId: "pilot-sms-2",
      hero: {
        headline: "A campaign system your team can actually run",
        subheadline: "Keep every channel aligned without starting from zero.",
      },
    });

    getGoogleAdsDraftMock.mockReturnValue({
      pilotId: "pilot-sms-2",
      headlines: ["Run coordinated campaigns with less rework"],
      descriptions: ["Keep every channel aligned without starting from zero."],
    });

    getEmailSequenceDraftMock.mockReturnValue({
      pilotId: "pilot-sms-2",
      emails: [{ subject: "Run coordinated campaigns with less rework" }],
    });

    const draft = generateSmsDraft("pilot-sms-2");
    const stored = getSmsDraft();

    expect(draft.pilotId).toBe("pilot-sms-2");
    expect(stored?.pilotId).toBe("pilot-sms-2");
    expect(stored?.messages[0]?.body).toContain("Jordan Lee here");
  });

  it("throws when the pilot cannot be found", () => {
    getPilotMock.mockReturnValue(null);

    expect(() => generateSmsDraft("pilot-missing")).toThrow(
      "Pilot not found: pilot-missing",
    );
  });
});