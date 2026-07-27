import { beforeEach, describe, expect, it } from "vitest";

import { campaignSummaryDraftFixture } from "@/lib/admin/campaign-summary-fixtures";
import {
  createCampaignSummaryDraft,
  getCampaignSummaryDraft,
  resetCampaignSummaryDraftStore,
  saveCampaignSummaryDraft,
  updateCampaignSummaryDraft,
} from "@/lib/admin/campaign-summary-store";

describe("admin campaign summary store", () => {
  beforeEach(() => {
    resetCampaignSummaryDraftStore();
  });

  it("creates a default campaign summary draft record", () => {
    const draft = createCampaignSummaryDraft({
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
    });

    expect(draft.id).toBe("campaign-summary-pilot-demo");
    expect(draft.pilotId).toBe("pilot-1");
    expect(draft.workspaceId).toBe("workspace-1");
    expect(draft.status).toBe("draft");
    expect(draft.channels.length).toBeGreaterThan(0);
    expect(draft.keyMessages.length).toBeGreaterThan(0);
    expect(draft.nextSteps.length).toBeGreaterThan(0);
    expect(draft.notes.length).toBeGreaterThan(0);
  });

  it("saves a provided campaign summary draft record", () => {
    const generatedAt = "2026-01-01T00:00:00.000Z";

    const saved = saveCampaignSummaryDraft({
      id: "campaign-summary-pilot-1",
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
      generatedAt,
      status: "draft",
      campaignName: "Pipeline Acceleration Campaign",
      primaryGoal: "Increase booked calls",
      coreOffer: "A tighter journey from click to conversation",
      channels: ["Landing Page", "Google Ads", "Email Sequence"],
      keyMessages: ["Lead with one core promise."],
      nextSteps: ["Review before launch."],
      notes: ["Stored draft."],
    });

    expect(saved.id).toBe("campaign-summary-pilot-1");
    expect(saved.generatedAt).toBe(generatedAt);
    expect(saved.lastUpdatedAt).not.toBe(generatedAt);
    expect(saved.campaignName).toBe("Pipeline Acceleration Campaign");
    expect(saved.channels).toEqual([
      "Landing Page",
      "Google Ads",
      "Email Sequence",
    ]);
    expect(getCampaignSummaryDraft().pilotId).toBe("pilot-1");
  });

  it("updates an existing campaign summary draft while preserving generatedAt", async () => {
    const initial = saveCampaignSummaryDraft({
      id: "campaign-summary-pilot-2",
      pilotId: "pilot-2",
      workspaceId: "workspace-2",
      generatedAt: "2026-02-02T00:00:00.000Z",
      campaignName: "Initial Campaign",
      primaryGoal: "Initial Goal",
      coreOffer: "Initial Offer",
      channels: ["Landing Page"],
      keyMessages: ["Initial Message"],
      nextSteps: ["Initial Step"],
      notes: ["Initial Note"],
    });

    const updated = updateCampaignSummaryDraft({
      campaignName: "Updated Campaign",
      channels: ["Landing Page", "WhatsApp"],
      nextSteps: ["Updated Step"],
    });

    expect(updated.generatedAt).toBe(initial.generatedAt);
    expect(updated.lastUpdatedAt).not.toBe(initial.lastUpdatedAt);
    expect(updated.campaignName).toBe("Updated Campaign");
    expect(updated.channels).toEqual(["Landing Page", "WhatsApp"]);
    expect(updated.nextSteps).toEqual(["Updated Step"]);
    expect(updated.primaryGoal).toBe("Initial Goal");
  });

  it("resets the store", () => {
    saveCampaignSummaryDraft({
      id: "campaign-summary-custom",
      pilotId: "pilot-custom",
      workspaceId: "workspace-custom",
      campaignName: "Custom Campaign",
      primaryGoal: "Custom Goal",
      coreOffer: "Custom Offer",
      channels: ["SMS"],
      keyMessages: ["Custom Message"],
      nextSteps: ["Custom Step"],
      notes: ["Custom Note"],
    });

    const reset = resetCampaignSummaryDraftStore();

    expect(reset.pilotId).toBe(campaignSummaryDraftFixture.pilotId);
    expect(reset.workspaceId).toBe(campaignSummaryDraftFixture.workspaceId);
    expect(reset.campaignName).toBe(campaignSummaryDraftFixture.campaignName);
    expect(reset.channels).toEqual(campaignSummaryDraftFixture.channels);
  });
});