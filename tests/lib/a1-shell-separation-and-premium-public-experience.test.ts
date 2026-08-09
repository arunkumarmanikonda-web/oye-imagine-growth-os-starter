import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import {
  getContactExperience,
  getMarketplaceExperience,
  getPublicHomepageExperience,
  publicPrototypeDenylist,
} from "@/lib/recovery/public-premium-experience";

describe("A1 shell separation and premium public experience", () => {
  it("exposes premium public navigation with valid client-facing targets", () => {
    const experience = getPublicHomepageExperience();

    expect(experience.navigation.map((item) => item.label)).toEqual([
      "Platform",
      "Marketplace",
      "Solutions",
      "Contact",
      "Client login",
    ]);

    expect(experience.navigation.map((item) => item.href)).toEqual([
      "/platform",
      "/marketplace",
      "/solutions",
      "/contact",
      "/login/client",
    ]);

    expect(experience.navigation.every((item) => !item.href.startsWith("/admin"))).toBe(true);
  });

  it("keeps public experience copy free of prototype residue", () => {
    const bundledExperienceText = JSON.stringify({
      homepage: getPublicHomepageExperience(),
      marketplace: getMarketplaceExperience(),
      contact: getContactExperience(),
    });

    for (const phrase of publicPrototypeDenylist) {
      expect(bundledExperienceText).not.toContain(phrase);
    }
  });

  it("preserves contact and trust details for premium public runtime", () => {
    const contact = getContactExperience();

    expect(JSON.stringify(contact)).toContain("hello@oyeimagine.com");
    expect(JSON.stringify(contact)).toContain("OYE IMAGINE PRIVATE LIMITED");
  });

  it("keeps critical public route files present", () => {
    expect(existsSync("src/app/page.tsx")).toBe(true);
    expect(existsSync("src/app/marketplace/page.tsx")).toBe(true);
    expect(existsSync("src/app/contact/page.tsx")).toBe(true);
  });
});
