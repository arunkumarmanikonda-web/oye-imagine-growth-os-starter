export type CmsStatus = "draft" | "published" | "scheduled" | "archived";
export type CmsAudience = "public" | "client" | "admin" | "operator";
export type CmsPageType =
  | "homepage"
  | "marketplace"
  | "login"
  | "dashboard"
  | "legal"
  | "support";
export type CmsSectionType =
  | "hero"
  | "grid"
  | "leadership"
  | "experts"
  | "promo-strip"
  | "faq"
  | "cta"
  | "legal"
  | "contact";
export type CmsProfileType = "leadership" | "expert" | "support";

export interface CmsSeo {
  title: string;
  description: string;
  keywords?: string[];
}

export interface CmsPage {
  slug: string;
  title: string;
  audience: CmsAudience;
  pageType: CmsPageType;
  status: CmsStatus;
  layoutKey: string;
  seo: CmsSeo;
}

export interface CmsSection {
  pageSlug: string;
  sectionKey: string;
  title: string;
  sectionType: CmsSectionType;
  status: CmsStatus;
  slotKey: string;
  sortOrder: number;
  content: Record<string, unknown>;
}

export interface CmsPromotion {
  slug: string;
  audience: CmsAudience;
  placement: string;
  title: string;
  subtitle?: string;
  status: CmsStatus;
  ctaLabel: string;
  ctaHref: string;
  offerTerms?: string;
}

export interface CmsPersonProfile {
  slug: string;
  audience: CmsAudience;
  profileType: CmsProfileType;
  displayName: string;
  title: string;
  team: string;
  status: CmsStatus;
  bio: string;
  expertise: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface CmsFaq {
  slug: string;
  audience: CmsAudience;
  category: string;
  question: string;
  answer: string;
  status: CmsStatus;
  sortOrder: number;
}

export interface CmsControllerSummary {
  pageCount: number;
  sectionCount: number;
  promotionCount: number;
  peopleCount: number;
  faqCount: number;
  editableSurfaceCount: number;
  editableSurfaces: string[];
}