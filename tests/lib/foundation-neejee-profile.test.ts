import { describe, expect, it } from "vitest";
import { neejeeCanonicalBrandProfile } from "../../src/lib/foundation/neejee-profile";

describe("foundation neejee profile", () => {
  it("keeps premium lifestyle brand truth", () => {
    expect(neejeeCanonicalBrandProfile.brandName).toBe("Neejee");
    expect(neejeeCanonicalBrandProfile.workspaceSlug).toBe("neejee-pilot");
    expect(neejeeCanonicalBrandProfile.industry).toContain("Premium lifestyle");
    expect(neejeeCanonicalBrandProfile.positioning.posture).toContain("Quiet luxury");
  });

  it("preserves channels and metrics", () => {
    expect(neejeeCanonicalBrandProfile.channels).toEqual(["seo", "google-ads", "meta-ads"]);
    expect(neejeeCanonicalBrandProfile.successMetrics).toContain("CPL");
  });
});