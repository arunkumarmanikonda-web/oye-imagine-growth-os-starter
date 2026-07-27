import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDefaultGoogleAdsDraft,
  getGoogleAdsDraft,
  resetGoogleAdsDraftStore,
  saveGoogleAdsDraft,
  updateGoogleAdsDraft,
} from "@/lib/admin/google-ads-store";
import { createGoogleAdsCampaignDraftRecord } from "@/lib/admin/google-ads-schema";

describe("admin google ads store", () => {
  beforeEach(() => {
    resetGoogleAdsDraftStore();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
  });

  afterEach(() => {
    resetGoogleAdsDraftStore();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
  });

  it("creates the default Neejee Google Ads draft with branding fallback", () => {
    const draft = createDefaultGoogleAdsDraft();

    expect(draft.pilotId).toBe("neejee-pilot");
    expect(draft.workspaceDisplayName).toBe("Oye Imagine");
    expect(draft.brandName).toBe("Neejee Clinics");
    expect(draft.keywordClusters.length).toBeGreaterThan(0);
    expect(draft.adCopy.length).toBeGreaterThan(0);
  });

  it("uses NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME when available", () => {
    process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME = "Oye Growth OS";

    const draft = createDefaultGoogleAdsDraft();

    expect(draft.workspaceDisplayName).toBe("Oye Growth OS");
  });

  it("saves Google Ads draft arrays and refreshes lastUpdatedAt", async () => {
    const base = createGoogleAdsCampaignDraftRecord({
      keywordClusters: [
        {
          theme: "Original theme",
          keywords: ["original keyword"],
        },
      ],
      adCopy: [
        {
          headline1: "Original headline",
          headline2: "Original CTA",
          description1: "Original description one",
          description2: "Original description two",
        },
      ],
      sitelinks: ["Original sitelink"],
    });

    const saved = saveGoogleAdsDraft(base);

    expect(saved.keywordClusters[0].theme).toBe("Original theme");
    expect(saved.adCopy[0].headline1).toBe("Original headline");
    expect(saved.sitelinks).toEqual(["Original sitelink"]);
    expect(typeof saved.lastUpdatedAt).toBe("string");
  });

  it("updates the existing Google Ads draft without losing prior fields", async () => {
    const initial = createDefaultGoogleAdsDraft();
    const updated = updateGoogleAdsDraft({
      status: "review",
      objective: "Increase qualified consultation leads.",
      geoTargets: ["Bengaluru", "HSR Layout"],
      budgetDailyUsd: 60,
    });

    const stored = getGoogleAdsDraft();

    expect(updated.generatedAt).toBe(initial.generatedAt);
    expect(updated.status).toBe("review");
    expect(updated.objective).toBe("Increase qualified consultation leads.");
    expect(updated.geoTargets).toEqual(["Bengaluru", "HSR Layout"]);
    expect(updated.brandName).toBe(initial.brandName);
    expect(stored?.budgetDailyUsd).toBe(60);
  });
});