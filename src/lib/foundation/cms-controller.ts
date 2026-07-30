import type { CmsControllerSummary } from "./cms-types";
import { cmsSeedFaqs, cmsSeedPages, cmsSeedPeople, cmsSeedPromotions, cmsSeedSections } from "./cms-seed";

export const cmsEditableSurfaces = [
  "homepage",
  "marketplace",
  "login",
  "client dashboard copy",
  "admin dashboard copy",
  "leadership team",
  "key experts",
  "support blocks",
  "promotional banners",
  "offers",
  "cta blocks",
  "footer and legal",
  "faq",
  "seo metadata",
] as const;

export function getCmsControllerSummary(): CmsControllerSummary {
  return {
    pageCount: cmsSeedPages.length,
    sectionCount: cmsSeedSections.length,
    promotionCount: cmsSeedPromotions.length,
    peopleCount: cmsSeedPeople.length,
    faqCount: cmsSeedFaqs.length,
    editableSurfaceCount: cmsEditableSurfaces.length,
    editableSurfaces: [...cmsEditableSurfaces],
  };
}