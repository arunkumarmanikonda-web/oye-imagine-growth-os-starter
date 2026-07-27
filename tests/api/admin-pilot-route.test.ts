import { beforeEach, describe, expect, it } from "vitest";

import { GET, POST } from "@/app/api/admin/pilot/route";
import { getPilot, resetPilotStore } from "@/lib/admin/pilot-store";

describe("admin pilot route", () => {
  beforeEach(() => {
    resetPilotStore();
  });

  it("returns the current pilot from GET", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.workspaceDisplayName).toBe("Oye Imagine");
    expect(data.pilot.id).toBe("neejee-pilot");
    expect(data.pilot.brandName).toBe("Neejee");
  });

  it("creates or replaces pilot fields from POST", async () => {
    const request = new Request("http://localhost/api/admin/pilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        brandName: "Neejee Clinics",
        website: "https://neejee.example",
        targetAudience: "Founders and clinic operators",
        offer: "Growth operating system",
        monthlyBudget: "250000",
        primaryChannels: ["seo", "google-ads"],
        goals: ["Qualified leads", "Demo bookings"],
        successMetrics: ["CPL", "CAC"],
        status: "in_progress",
      }),
    });

    const response = await POST(request);
    const data = await response.json();
    const pilot = getPilot();

    expect(response.status).toBe(201);
    expect(data.ok).toBe(true);
    expect(data.pilot.brandName).toBe("Neejee Clinics");
    expect(data.pilot.website).toBe("https://neejee.example");
    expect(data.pilot.status).toBe("in_progress");
    expect(pilot.brandName).toBe("Neejee Clinics");
    expect(pilot.primaryChannels).toEqual(["seo", "google-ads"]);
  });
});