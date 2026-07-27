import { beforeEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/admin/strategy/generate/route";
import { resetPilotStore } from "@/lib/admin/pilot-store";
import { getStrategyBrief, resetStrategyBriefStore } from "@/lib/admin/strategy-store";

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/admin/strategy/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("admin strategy generate route", () => {
  beforeEach(() => {
    resetPilotStore({
      id: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      website: "https://neejee.example",
      industry: "Healthcare",
      geo: "India + GCC",
      targetAudience: "Founders and clinic operators",
      offer: "Growth operating system",
      monthlyBudget: "250000",
      primaryChannels: ["seo", "google-ads", "meta-ads"],
      competitors: ["Competitor One", "Competitor Two"],
      goals: ["Qualified leads", "Demo bookings"],
      successMetrics: ["CPL", "Consultation rate"],
      status: "in_progress",
    });

    resetStrategyBriefStore();
  });

  it("generates and returns a strategy brief for the current pilot", async () => {
    const response = await POST(
      createRequest({
        pilotId: "neejee-pilot",
      }),
    );

    expect(response.status).toBe(201);

    const json = await response.json();

    expect(json.ok).toBe(true);
    expect(json.workspaceDisplayName).toBe("Oye Imagine");
    expect(json.strategy.pilotId).toBe("neejee-pilot");
    expect(json.strategy.brandName).toBe("Neejee Clinics");
    expect(json.strategy.status).toBe("generated");
    expect(json.strategy.channelRecommendations).toHaveLength(3);
    expect(json.strategy.plan30Days[0]?.label).toBe("Foundation");
  });

  it("persists the generated strategy brief into the store", async () => {
    const response = await POST(createRequest({ pilotId: "neejee-pilot" }));
    expect(response.status).toBe(201);

    const strategy = getStrategyBrief();

    expect(strategy.status).toBe("generated");
    expect(strategy.brandName).toBe("Neejee Clinics");
    expect(strategy.positioning).toContain("Neejee Clinics");
    expect(strategy.successMetrics).toEqual(["CPL", "Consultation rate"]);
  });

  it("returns 404 when the requested pilot does not exist", async () => {
    const response = await POST(
      createRequest({
        pilotId: "missing-pilot",
      }),
    );

    expect(response.status).toBe(404);

    const json = await response.json();

    expect(json.ok).toBe(false);
    expect(json.error).toContain("Pilot 'missing-pilot' not found.");
  });

  it("returns 400 when the request body is not a JSON object", async () => {
    const request = new Request("http://localhost/api/admin/strategy/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(["bad-body"]),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const json = await response.json();

    expect(json.ok).toBe(false);
    expect(json.error).toBe("Request body must be a JSON object.");
  });
});