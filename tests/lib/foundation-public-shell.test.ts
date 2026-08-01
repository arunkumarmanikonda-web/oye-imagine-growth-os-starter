import { describe, expect, it } from "vitest";
import {
  buildFooterMeta,
  buildLoginLaneModels,
  buildMarketplaceOfferCards,
  buildPublicHeroModel,
  buildPublicTrustMarkers,
  buildSupportStripModel,
} from "../../src/lib/foundation/public-shell";

describe("foundation public shell", () => {
  it("builds hero model from foundation content", () => {
    const hero = buildPublicHeroModel();

    expect(hero.heading).toContain("World-class digital marketing services");
    expect(hero.primaryCtaHref).toBe("mailto:hello@oyeimagine.com");
    expect(hero.supportEmail).toBe("hello@oyeimagine.com");
  });

  it("returns separate access lanes", () => {
    const lanes = buildLoginLaneModels();

    expect(lanes).toHaveLength(2);
    expect(lanes.map((lane) => lane.href)).toEqual(["/login/client", "/login/admin"]);
  });

  it("returns marketplace cards and trust markers", () => {
    const offers = buildMarketplaceOfferCards();
    const trustMarkers = buildPublicTrustMarkers();

    expect(offers.length).toBeGreaterThanOrEqual(5);
    expect(trustMarkers).toContain("CMS-backed public surfaces");
  });

  it("returns footer and support details", () => {
    const footer = buildFooterMeta();
    const support = buildSupportStripModel();

    expect(footer.gstin).toBe("09AAECO6856D1Z8");
    expect(support.primaryPhone).toBe("+91 8 988 988 988");
    expect(support.supportChannels.length).toBeGreaterThan(0);
  });
});