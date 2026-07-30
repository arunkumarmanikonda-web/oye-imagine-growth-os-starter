import { describe, expect, it } from "vitest";
import { getCmsControllerSummary } from "../../src/lib/foundation/cms-controller";

describe("foundation cms controller", () => {
  it("returns summary for visible editable surfaces", () => {
    const summary = getCmsControllerSummary();

    expect(summary.pageCount).toBeGreaterThanOrEqual(5);
    expect(summary.sectionCount).toBeGreaterThanOrEqual(6);
    expect(summary.promotionCount).toBeGreaterThanOrEqual(2);
    expect(summary.peopleCount).toBeGreaterThanOrEqual(2);
    expect(summary.faqCount).toBeGreaterThanOrEqual(2);
    expect(summary.editableSurfaceCount).toBeGreaterThanOrEqual(10);
    expect(summary.editableSurfaces).toContain("leadership team");
    expect(summary.editableSurfaces).toContain("promotional banners");
  });
});