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
  "legal identity and trust documents",
  "publishing governance and approval workflow",
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

export function cmsControllerSupportsPageOperatingSystem(): boolean {
  return cmsEditableSurfaces.includes('publishing governance and approval workflow')
    && cmsEditableSurfaces.includes('seo metadata')
    && cmsEditableSurfaces.includes('legal identity and trust documents');
}
