import { beforeEach, describe, expect, it } from "vitest";

import {
  createDefaultLandingPageBrief,
  getLandingPageBrief,
  resetLandingPageBriefStore,
  saveLandingPageBrief,
  updateLandingPageBrief,
} from "@/lib/admin/landing-page-store";

describe("admin landing page store", () => {
  beforeEach(() => {
    resetLandingPageBriefStore();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
  });

  it("creates the default Neejee landing page brief with branding fallback", () => {
    const brief = createDefaultLandingPageBrief();

    expect(brief.id).toBe("neejee-landing-page-brief");
    expect(brief.workspaceDisplayName).toBe("Oye Imagine");
    expect(brief.brandName).toBe("Neejee Clinics");
    expect(brief.hero.headline).toContain("Neejee Clinics");
    expect(brief.sections.length).toBeGreaterThanOrEqual(3);
    expect(brief.ctas.length).toBeGreaterThanOrEqual(3);
    expect(brief.proofPoints.length).toBeGreaterThanOrEqual(3);
    expect(brief.assets.length).toBeGreaterThanOrEqual(3);
  });

  it("uses NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME when available", async () => {
    process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME = "Neejee OS";
    const { createDefaultLandingPageBriefFixture } = await import(
      "@/lib/admin/landing-page-fixtures"
    );

    const brief = createDefaultLandingPageBriefFixture();

    expect(brief.workspaceDisplayName).toBe("Neejee OS");
  });

  it("saves landing page sections and refreshes lastUpdatedAt", async () => {
    createDefaultLandingPageBrief();
    const before = getLandingPageBrief().lastUpdatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));

    const brief = saveLandingPageBrief({
      status: "generated",
      sections: [
        {
          id: "hero-proof",
          title: "Why operators act now",
          description: "Create urgency with measurable outcomes.",
          bullets: ["Fast launch", "Clear visibility"],
        },
      ],
      ctas: ["Book a demo"],
      proofPoints: ["Operator-ready workflow"],
    });

    expect(brief.status).toBe("generated");
    expect(brief.sections).toHaveLength(1);
    expect(brief.sections[0]?.title).toBe("Why operators act now");
    expect(brief.ctas).toEqual(["Book a demo"]);
    expect(brief.proofPoints).toEqual(["Operator-ready workflow"]);
    expect(brief.lastUpdatedAt > before).toBe(true);
  });

  it("updates the existing landing page brief without losing prior fields", () => {
    createDefaultLandingPageBrief();

    const updated = updateLandingPageBrief({
      status: "ready_for_review",
      hero: {
        headline: "Updated headline",
        subheadline: "Updated subheadline",
        primaryCta: "Primary",
        secondaryCta: "Secondary",
      },
    });

    expect(updated.status).toBe("ready_for_review");
    expect(updated.hero.headline).toBe("Updated headline");
    expect(updated.brandName).toBe("Neejee Clinics");
    expect(updated.sections.length).toBeGreaterThan(0);
    expect(updated.assets.length).toBeGreaterThan(0);
  });
});