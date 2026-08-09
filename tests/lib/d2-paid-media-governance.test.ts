import { beforeEach, describe, expect, it } from "vitest";
import { resetCommercialState } from "@/lib/commercial/store";
import { getPaidMediaGovernanceExperience } from "@/lib/recovery/paid-media-governance-foundation";

describe("d2 paid media governance foundation", () => {
  beforeEach(() => {
    resetCommercialState();
  });

  it("builds governed creative and budget evidence", () => {
    const experience = getPaidMediaGovernanceExperience();

    expect(experience.summary.mediaAccountCount).toBeGreaterThan(0);
    expect(experience.summary.totalAvailableBalance).toBeGreaterThanOrEqual(0);
    expect(experience.summary.legalReviewRequired).toBe(true);
    expect(experience.creativeDraft.complianceFlags).toContain("claim_substantiation_required");
    expect(experience.governanceChecklist.length).toBeGreaterThanOrEqual(5);
  });
});
