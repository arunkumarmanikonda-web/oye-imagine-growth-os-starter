import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createDefaultPilot,
  getPilot,
  resetPilotStore,
  savePilot,
  updatePilot,
} from "@/lib/admin/pilot-store";

const originalNextPublicWorkspaceDisplayName =
  process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
const originalWorkspaceDisplayName = process.env.WORKSPACE_DISPLAY_NAME;

describe("admin pilot store", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
    resetPilotStore();
  });

  afterEach(() => {
    if (typeof originalNextPublicWorkspaceDisplayName === "string") {
      process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME =
        originalNextPublicWorkspaceDisplayName;
    } else {
      delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    }

    if (typeof originalWorkspaceDisplayName === "string") {
      process.env.WORKSPACE_DISPLAY_NAME = originalWorkspaceDisplayName;
    } else {
      delete process.env.WORKSPACE_DISPLAY_NAME;
    }

    resetPilotStore();
  });

  it("creates the default Neejee pilot with branding fallback", () => {
    const pilot = createDefaultPilot();

    expect(pilot.id).toBe("neejee-pilot");
    expect(pilot.workspaceDisplayName).toBe("Oye Imagine");
    expect(pilot.brandName).toBe("Neejee");
    expect(pilot.status).toBe("draft");
    expect(pilot.primaryChannels).toEqual(["seo", "google-ads", "meta-ads"]);
  });

  it("uses NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME when available", () => {
    process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME = "Neejee Workspace";

    const pilot = createDefaultPilot();

    expect(pilot.workspaceDisplayName).toBe("Neejee Workspace");
  });

  it("saves pilot arrays and refreshes lastUpdatedAt", () => {
    const before = getPilot().lastUpdatedAt;

    const saved = savePilot({
      brandName: "Neejee Clinics",
      website: "https://neejee.example",
      primaryChannels: ["seo", "meta-ads"],
      goals: "Qualified leads, Demo bookings",
      successMetrics: ["CPL", "CAC"],
      status: "in_progress",
    });

    expect(saved.brandName).toBe("Neejee Clinics");
    expect(saved.website).toBe("https://neejee.example");
    expect(saved.primaryChannels).toEqual(["seo", "meta-ads"]);
    expect(saved.goals).toEqual(["Qualified leads", "Demo bookings"]);
    expect(saved.successMetrics).toEqual(["CPL", "CAC"]);
    expect(saved.status).toBe("in_progress");
    expect(new Date(saved.lastUpdatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(before).getTime(),
    );
  });

  it("updates the existing pilot without losing prior fields", () => {
    const initial = savePilot({
      brandName: "Neejee",
      website: "https://neejee.example",
      industry: "Healthcare",
    });

    const updated = updatePilot({
      offer: "Growth operating system",
      geo: "India + GCC",
    });

    expect(updated.id).toBe(initial.id);
    expect(updated.brandName).toBe("Neejee");
    expect(updated.website).toBe("https://neejee.example");
    expect(updated.industry).toBe("Healthcare");
    expect(updated.offer).toBe("Growth operating system");
    expect(updated.geo).toBe("India + GCC");
  });
});