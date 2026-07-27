import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getCampaignSummaryDraft: vi.fn(),
  generateCampaignSummaryDraft: vi.fn(),
}));

vi.mock("@/lib/admin/campaign-summary-store", () => ({
  getCampaignSummaryDraft: mocks.getCampaignSummaryDraft,
}));

vi.mock("@/lib/admin/campaign-summary-generator", () => ({
  generateCampaignSummaryDraft: mocks.generateCampaignSummaryDraft,
}));

import CampaignSummaryPage from "@/app/admin/campaign-summary/[pilotId]/page";

describe("admin campaign summary draft page", () => {
  it("renders a persisted campaign summary draft", async () => {
    mocks.getCampaignSummaryDraft.mockReturnValue({
      id: "campaign-summary-pilot-1",
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
      status: "draft",
      campaignName: "Acme AI x Jordan Campaign Summary",
      primaryGoal: "Book more qualified demos",
      coreOffer: "A connected growth system for high-intent buyers",
      channels: [
        "Landing Page",
        "Google Ads",
        "Email Sequence",
      ],
      keyMessages: [
        "Turn more traffic into qualified pipeline",
        "Keep the offer clear and consistent",
      ],
      nextSteps: [
        "Review the campaign summary with stakeholders.",
        "Approve the coordinated launch plan.",
      ],
      notes: [
        "Summary generated from connected campaign assets.",
      ],
    });

    const element = await CampaignSummaryPage({
      params: Promise.resolve({ pilotId: "pilot-1" }),
    });

    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("Acme AI x Jordan Campaign Summary");
    expect(markup).toContain("Book more qualified demos");
    expect(markup).toContain("Landing Page");
    expect(markup).toContain("Turn more traffic into qualified pipeline");
    expect(markup).toContain("Approve the coordinated launch plan.");
    expect(markup).toContain("Summary generated from connected campaign assets.");
    expect(mocks.generateCampaignSummaryDraft).not.toHaveBeenCalled();
  });

  it("generates a campaign summary draft when store data is absent or mismatched", async () => {
    mocks.getCampaignSummaryDraft.mockReturnValue({
      id: "campaign-summary-other",
      pilotId: "other-pilot",
      workspaceId: "workspace-other",
      status: "draft",
      campaignName: "Other Campaign",
      primaryGoal: "Other Goal",
      coreOffer: "Other Offer",
      channels: ["SMS"],
      keyMessages: ["Other Message"],
      nextSteps: ["Other Step"],
      notes: ["Other Note"],
    });

    mocks.generateCampaignSummaryDraft.mockReturnValue({
      id: "campaign-summary-pilot-2",
      pilotId: "pilot-2",
      workspaceId: "workspace-2",
      status: "draft",
      campaignName: "Neejee Campaign Summary",
      primaryGoal: "Increase qualified replies",
      coreOffer: "A connected campaign narrative across channels",
      channels: [
        "Landing Page",
        "WhatsApp",
      ],
      keyMessages: [
        "First generated message",
      ],
      nextSteps: [
        "Generated next step",
      ],
      notes: [
        "Generated on demand.",
      ],
    });

    const element = await CampaignSummaryPage({
      params: Promise.resolve({ pilotId: "pilot-2" }),
    });

    const markup = renderToStaticMarkup(element);

    expect(mocks.generateCampaignSummaryDraft).toHaveBeenCalledWith("pilot-2");
    expect(markup).toContain("Neejee Campaign Summary");
    expect(markup).toContain("Increase qualified replies");
    expect(markup).toContain("Generated next step");
    expect(markup).toContain("Generated on demand.");
  });
});