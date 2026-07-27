import { beforeEach, describe, expect, it } from "vitest";

import {
  GET as GetPilotById,
  PUT as PutPilotById,
} from "@/app/api/admin/pilot/[id]/route";
import { resetPilotStore, savePilot } from "@/lib/admin/pilot-store";

describe("admin pilot [id] route", () => {
  beforeEach(() => {
    resetPilotStore();
  });

  it("returns the pilot when the id matches", async () => {
    const response = await GetPilotById(
      new Request("http://localhost/api/admin/pilot/neejee-pilot"),
      { params: Promise.resolve({ id: "neejee-pilot" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.pilot.id).toBe("neejee-pilot");
  });

  it("returns 404 when the id does not match", async () => {
    const response = await GetPilotById(
      new Request("http://localhost/api/admin/pilot/unknown"),
      { params: Promise.resolve({ id: "unknown" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.ok).toBe(false);
  });

  it("updates the pilot when PUT is called with a matching id", async () => {
    savePilot({
      brandName: "Neejee",
      website: "https://neejee.example",
      industry: "Healthcare",
    });

    const request = new Request("http://localhost/api/admin/pilot/neejee-pilot", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        geo: "India + GCC",
        offer: "AI growth operating system",
        status: "ready_for_review",
      }),
    });

    const response = await PutPilotById(request, {
      params: Promise.resolve({ id: "neejee-pilot" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.pilot.id).toBe("neejee-pilot");
    expect(data.pilot.geo).toBe("India + GCC");
    expect(data.pilot.offer).toBe("AI growth operating system");
    expect(data.pilot.status).toBe("ready_for_review");
  });
});