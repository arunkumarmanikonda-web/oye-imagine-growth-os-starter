import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPilot: vi.fn(),
  getStrategyDraft: vi.fn(),
  getLandingPageBrief: vi.fn(),
  getGoogleAdsDraft: vi.fn(),
  getEmailSequenceDraft: vi.fn(),
  getSmsDraft: vi.fn(),
  getWhatsappDraft: vi.fn(),
  saveCampaignSummaryDraft: vi.fn((draft) => draft),
}));

vi.mock("@/lib/admin/pilot-store", () => ({
  getPilot: mocks.getPilot,
}));

vi.mock("@/lib/admin/strategy-store", () => ({
  getStrategy: mocks.getStrategyDraft,
  getStrategyDraft: mocks.getStrategyDraft,
}));

vi.mock("@/lib/admin/landing-page-store", () => ({
  getLandingPageBrief: mocks.getLandingPageBrief,
}));

vi.mock("@/lib/admin/google-ads-store", () => ({
  getGoogleAdsDraft: mocks.getGoogleAdsDraft,
}));

vi.mock("@/lib/admin/email-sequence-store", () => ({
  getEmailSequenceDraft: mocks.getEmailSequenceDraft,
}));

vi.mock("@/lib/admin/sms-store", () => ({
  getSmsDraft: mocks.getSmsDraft,
}));

vi.mock("@/lib/admin/whatsapp-store", () => ({
  getWhatsappDraft: mocks.getWhatsappDraft,
}));

vi.mock("@/lib/admin/campaign-summary-store", () => ({
  saveCampaignSummaryDraft: mocks.saveCampaignSummaryDraft,
}));

import {
  buildCampaignSummaryDraftFromPilot,
  generateCampaignSummaryDraft,
} from "@/lib/admin/campaign-summary-generator";

describe("campaign-summary-generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getPilot.mockReturnValue({
      id: "pilot-1",
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
      companyName: "Acme AI",
      contactName: "Jordan",
    });

    mocks.getStrategyDraft.mockReturnValue({
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
      goal: "Book more qualified demos",
      offer: "A connected growth system for high-intent buyers",
      cta: "Approve the coordinated launch plan.",
    });

    mocks.getLandingPageBrief.mockReturnValue({
      pilotId: "pilot-1",
      headline: "Turn more traffic into qualified pipeline",
      subheadline: "A tighter landing page story helps the right buyers self-select faster.",
    });

    mocks.getGoogleAdsDraft.mockReturnValue({
      pilotId: "pilot-1",
      headlines: ["High-intent campaigns with clearer conversion paths"],
    });

    mocks.getEmailSequenceDraft.mockReturnValue({
      pilotId: "pilot-1",
      messages: [
        {
          subject: "A sharper follow-up for high-intent leads",
          body: "This sequence keeps the offer clear and consistent.",
        },
      ],
    });

    mocks.getSmsDraft.mockReturnValue({
      pilotId: "pilot-1",
      messages: [
        {
          body: "Short SMS follow-up keeps the same conversion message in front of buyers.",
        },
      ],
    });

    mocks.getWhatsappDraft.mockReturnValue({
      pilotId: "pilot-1",
      messages: [
        {
          body: "WhatsApp follow-up adds richer context without losing clarity.",
        },
      ],
    });
  });

  it("builds a deterministic campaign summary draft from pilot inputs", () => {
    const first = buildCampaignSummaryDraftFromPilot("pilot-1");
    const second = buildCampaignSummaryDraftFromPilot("pilot-1");

    expect(first.pilotId).toBe("pilot-1");
    expect(first.workspaceId).toBe("workspace-1");
    expect(first.campaignName).toBe("Acme AI x Jordan Campaign Summary");
    expect(first.primaryGoal).toBe("Book more qualified demos");
    expect(first.coreOffer).toBe("A connected growth system for high-intent buyers");
    expect(first.channels).toEqual([
      "Landing Page",
      "Google Ads",
      "Email Sequence",
      "SMS",
      "WhatsApp",
    ]);
    expect(first.keyMessages).toEqual(second.keyMessages);
    expect(first.nextSteps).toEqual(second.nextSteps);
    expect(first.notes).toEqual(second.notes);
    expect(first.keyMessages[0]).toContain("Turn more traffic into qualified pipeline");
  });

  it("persists the generated draft to the store", () => {
    const draft = generateCampaignSummaryDraft("pilot-1");

    expect(mocks.saveCampaignSummaryDraft).toHaveBeenCalledTimes(1);
    expect(mocks.saveCampaignSummaryDraft).toHaveBeenCalledWith(draft);
    expect(draft.channels).toContain("WhatsApp");
  });

  it("throws when the pilot is missing", () => {
    mocks.getPilot.mockReturnValueOnce(null);

    expect(() => buildCampaignSummaryDraftFromPilot("missing-pilot")).toThrow(
      /Pilot not found/i,
    );
    expect(mocks.saveCampaignSummaryDraft).not.toHaveBeenCalled();
  });
});