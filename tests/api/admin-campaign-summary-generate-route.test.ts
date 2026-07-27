import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateCampaignSummaryDraft: vi.fn(),
}));

vi.mock("@/lib/admin/campaign-summary-generator", () => ({
  generateCampaignSummaryDraft: mocks.generateCampaignSummaryDraft,
}));

import { POST } from "@/app/api/admin/campaign-summary/generate/route";

describe("admin campaign summary generate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.generateCampaignSummaryDraft.mockReturnValue({
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
        "SMS",
        "WhatsApp",
      ],
      keyMessages: ["Turn more traffic into qualified pipeline"],
      nextSteps: ["Approve the coordinated launch plan."],
      notes: ["Summary generated from connected campaign assets."],
    });
  });

  it("generates and returns a campaign summary draft", async () => {
    const request = new Request("http://localhost/api/admin/campaign-summary/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pilotId: "pilot-1" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.generateCampaignSummaryDraft).toHaveBeenCalledWith("pilot-1");
    expect(json.pilotId).toBe("pilot-1");
    expect(json.channels).toContain("WhatsApp");
  });

  it("uses defaults when request body is empty", async () => {
    const request = new Request("http://localhost/api/admin/campaign-summary/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.generateCampaignSummaryDraft).toHaveBeenCalledWith("pilot-demo");
  });

  it("returns 404 when the pilot does not exist", async () => {
    mocks.generateCampaignSummaryDraft.mockImplementation(() => {
      throw new Error('Pilot not found for ID "missing-pilot"');
    });

    const request = new Request("http://localhost/api/admin/campaign-summary/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pilotId: "missing-pilot" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toMatch(/Pilot not found/i);
  });

  it("returns 400 when the request body is not a JSON object", async () => {
    const request = new Request("http://localhost/api/admin/campaign-summary/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(["pilot-1"]),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/JSON object/i);
    expect(mocks.generateCampaignSummaryDraft).not.toHaveBeenCalled();
  });
});