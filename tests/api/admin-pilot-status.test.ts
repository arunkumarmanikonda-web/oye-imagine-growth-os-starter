import { beforeEach, describe, expect, it } from "vitest";

import { GET } from "@/app/api/admin/pilot/status/route";
import { resetPilotStore, savePilot } from "@/lib/admin/pilot-store";

describe("admin pilot status route", () => {
  beforeEach(() => {
    resetPilotStore();
  });

  it("returns completeness details for the default pilot", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.workspaceDisplayName).toBe("Oye Imagine");
    expect(data.pilotId).toBe("neejee-pilot");
    expect(data.totalFields).toBe(10);
    expect(data.completedFields).toBeGreaterThan(0);
    expect(Array.isArray(data.missingFields)).toBe(true);
  });

  it("increases completeness as more pilot fields are filled", async () => {
    savePilot({
      website: "https://neejee.example",
      targetAudience: "Founders and clinic operators",
      offer: "Growth operating system",
      monthlyBudget: "250000",
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.completedFields).toBeGreaterThanOrEqual(8);
    expect(data.completionPercent).toBeGreaterThanOrEqual(80);
    expect(data.missingFields).not.toContain("website");
    expect(data.missingFields).not.toContain("offer");
  });
});