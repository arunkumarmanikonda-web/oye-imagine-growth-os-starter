import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPilot: vi.fn(),
  getStrategyDraft: vi.fn(),
  getLandingPageDraft: vi.fn(),
  getGoogleAdsDraft: vi.fn(),
  getEmailSequenceDraft: vi.fn(),
  getSmsDraft: vi.fn(),
  saveWhatsappDraft: vi.fn((draft) => draft),
}));

vi.mock("@/lib/admin/pilot-store", () => ({
  getPilot: mocks.getPilot,
}));

vi.mock("@/lib/admin/strategy-store", () => ({
  getStrategy: mocks.getStrategyDraft,
  getStrategyDraft: mocks.getStrategyDraft,
}));

vi.mock("@/lib/admin/landing-page-store", () => ({
  getLandingPageDraft: mocks.getLandingPageDraft,
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
  saveWhatsappDraft: mocks.saveWhatsappDraft,
}));

import {
  buildWhatsappDraftFromPilot,
  generateWhatsappDraft,
} from "@/lib/admin/whatsapp-generator";

describe("whatsapp-generator", () => {
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
      audience: "growth teams",
      goal: "Book more qualified demos",
      cta: "Open to a quick reply?",
    });

    mocks.getLandingPageDraft.mockReturnValue({
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
  });

  it("builds a deterministic WhatsApp draft from pilot inputs", () => {
    const first = buildWhatsappDraftFromPilot("pilot-1");
    const second = buildWhatsappDraftFromPilot("pilot-1");

    expect(first.pilotId).toBe("pilot-1");
    expect(first.senderName).toBe("Jordan at Acme AI");
    expect(first.goal).toBe("Book more qualified demos");

    expect(first.messages.map((message: { body: string }) => message.body)).toEqual(
      second.messages.map((message: { body: string }) => message.body),
    );

    expect(first.messages).toHaveLength(3);
    expect(first.messages[0].body).toContain("Turn more traffic into qualified pipeline");
    expect(first.messages[0].body).toContain("growth teams");
    expect(first.messages[1].body).toContain("High-intent campaigns with clearer conversion paths");
    expect(first.messages[1].body).toContain("A sharper follow-up for high-intent leads");
    expect(first.messages[2].body).toContain("Open to a quick reply?");
  });

  it("persists the generated draft to the WhatsApp store", () => {
    const draft = generateWhatsappDraft("pilot-1");

    expect(mocks.saveWhatsappDraft).toHaveBeenCalledTimes(1);
    expect(mocks.saveWhatsappDraft).toHaveBeenCalledWith(draft);
    expect(draft.messages).toHaveLength(3);
  });

  it("throws when the pilot is missing", () => {
    mocks.getPilot.mockReturnValueOnce(null);

    expect(() => buildWhatsappDraftFromPilot("missing-pilot")).toThrow(
      /Pilot not found/i,
    );
    expect(mocks.saveWhatsappDraft).not.toHaveBeenCalled();
  });
});