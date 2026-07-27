import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { getEmailSequenceDraftMock, generateEmailSequenceDraftMock } = vi.hoisted(() => ({
  getEmailSequenceDraftMock: vi.fn(),
  generateEmailSequenceDraftMock: vi.fn(),
}));

vi.mock("@/lib/admin/email-sequence-store", () => ({
  getEmailSequenceDraft: getEmailSequenceDraftMock,
}));

vi.mock("@/lib/admin/email-sequence-generator", () => ({
  generateEmailSequenceDraft: generateEmailSequenceDraftMock,
}));

vi.mock("@/app/admin/email-sequence/[pilotId]/regenerate-button", () => ({
  default: () => null,
}));

import { createDefaultEmailSequenceDraftFixture } from "@/lib/admin/email-sequence-fixtures";
import EmailSequenceDraftPage from "@/app/admin/email-sequence/[pilotId]/page";

describe("admin email sequence draft page", () => {
  beforeEach(() => {
    getEmailSequenceDraftMock.mockReset();
    generateEmailSequenceDraftMock.mockReset();
  });

  it("renders a persisted email sequence draft", async () => {
    getEmailSequenceDraftMock.mockReturnValue(
      createDefaultEmailSequenceDraftFixture({
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
        emails: [
          {
            id: "email-1",
            subject: "Launch your growth system faster",
            previewText: "One strategy, every asset aligned",
            body: "Body copy for email one",
            ctaLabel: "Book intro",
            ctaHref: "https://example.com/neejee-growth-system",
            sendDelayDays: 0,
            goal: "Introduce the offer",
          },
        ],
        notes: ["Persisted note"],
      }),
    );

    const element = await EmailSequenceDraftPage({
      params: Promise.resolve({ pilotId: "pilot-email-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(generateEmailSequenceDraftMock).not.toHaveBeenCalled();
    expect(html).toContain("Neejee founder introduction sequence");
    expect(html).toContain("Avery Stone");
    expect(html).toContain("Launch your growth system faster");
    expect(html).toContain("Persisted note");
  });

  it("generates an email sequence draft when store data is absent or mismatched", async () => {
    getEmailSequenceDraftMock.mockReturnValue(
      createDefaultEmailSequenceDraftFixture({
        pilotId: "pilot-other",
        workspaceId: "workspace-other",
      }),
    );

    generateEmailSequenceDraftMock.mockReturnValue(
      createDefaultEmailSequenceDraftFixture({
        pilotId: "pilot-email-2",
        workspaceId: "workspace-email-2",
        sequenceName: "Generated expansion sequence",
        senderName: "Jordan Lee",
        senderEmail: "jordan@example.com",
        landingPageUrl: "https://example.com/generated-sequence",
        emails: [
          {
            id: "email-1",
            subject: "Run coordinated campaigns with less rework",
            previewText: "Keep every asset aligned",
            body: "Generated body copy",
            ctaLabel: "View page",
            ctaHref: "https://example.com/generated-sequence",
            sendDelayDays: 0,
            goal: "Show operational value",
          },
        ],
        notes: ["Generated note"],
      }),
    );

    const element = await EmailSequenceDraftPage({
      params: Promise.resolve({ pilotId: "pilot-email-2" }),
    });
    const html = renderToStaticMarkup(element);

    expect(generateEmailSequenceDraftMock).toHaveBeenCalledWith("pilot-email-2");
    expect(html).toContain("Generated expansion sequence");
    expect(html).toContain("Jordan Lee");
    expect(html).toContain("Run coordinated campaigns with less rework");
    expect(html).toContain("Generated note");
  });
});