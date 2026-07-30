import { describe, expect, it } from "vitest";
import {
  buildCmsMutationPlan,
  buildCmsStudioSectionCards,
  getCmsRegistrySummary,
  listCmsRegistryCollections,
} from "../../src/lib/cms/control-plane";

describe("foundation cms control plane", () => {
  it("returns registry summary and collections", () => {
    const summary = getCmsRegistrySummary();
    const collections = listCmsRegistryCollections();

    expect(summary.totalCollections).toBeGreaterThanOrEqual(7);
    expect(summary.totalManagedItems).toBeGreaterThan(0);
    expect(collections.some((item) => item.entityType === "legal")).toBe(true);
    expect(collections.some((item) => item.entityType === "support")).toBe(true);
  });

  it("builds mutation plans with review flags", () => {
    const publishPlan = buildCmsMutationPlan("promotion", "promo-growth-audit", "publish");
    const updatePlan = buildCmsMutationPlan("page", "home", "update");

    expect(publishPlan.requiresReview).toBe(true);
    expect(publishPlan.status).toBe("ready");
    expect(updatePlan.requiresReview).toBe(false);
    expect(updatePlan.status).toBe("draft");
  });

  it("builds studio cards for the admin content studio", () => {
    const cards = buildCmsStudioSectionCards();

    expect(cards.length).toBeGreaterThanOrEqual(7);
    expect(cards.some((card) => card.entityType === "promotion")).toBe(true);
  });
});