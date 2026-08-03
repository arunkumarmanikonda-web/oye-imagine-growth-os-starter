import type { CmsFaq, CmsPersonProfile } from "./cms-types";
import { cmsSeedFaqs, cmsSeedPeople, cmsSeedPromotions, cmsSeedSections } from "./cms-seed";
import { neejeeCanonicalBrandProfile } from "./neejee-profile";
import { oyeImagineOrganizationProfile, oyeImagineSupportChannels } from "./organization-profile";

export interface PublicHeroModel {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  supportEmail: string;
  supportPhone: string;
}

export interface LoginLaneModel {
  key: "client" | "admin";
  title: string;
  summary: string;
  href: string;
  features: string[];
}

export interface MarketplaceOfferCard {
  slug: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  placement: string;
}

export interface FooterMeta {
  legalName: string;
  gstin: string;
  cin: string;
  supportEmail: string;
  supportPhone: string;
}

export interface SupportStripModel {
  primaryEmail: string;
  primaryPhone: string;
  supportChannels: string[];
}

function readSectionContent(sectionKey: string): Record<string, unknown> {
  return cmsSeedSections.find((section) => section.sectionKey === sectionKey)?.content ?? {};
}

export function buildPublicHeroModel(): PublicHeroModel {
  const hero = readSectionContent("home-hero");
  const contact = readSectionContent("contact");

  return {
    eyebrow: String(hero.eyebrow ?? "AI-native growth operations"),
    heading: String(hero.heading ?? "World-class digital marketing services powered by AI."),
    subheading: String(
      hero.subheading ??
        "Premium public, client, and operator surfaces governed through distinct, role-safe foundations."
    ),
    primaryCtaLabel: String(hero.ctaLabel ?? "Start with Oye !magine"),
    primaryCtaHref: String(hero.ctaHref ?? "mailto:hello@oyeimagine.com"),
    secondaryCtaLabel: "Explore marketplace",
    secondaryCtaHref: "/marketplace",
    supportEmail: String(contact.email ?? oyeImagineOrganizationProfile.supportMailbox),
    supportPhone: String(contact.phone ?? oyeImagineOrganizationProfile.contactPhones[0]?.value ?? ""),
  };
}

export function buildLoginLaneModels(): LoginLaneModel[] {
  return [
    {
      key: "client",
      title: "Client access",
      summary: "Reports, agreements, invoices, support, performance summaries, and AI assistance.",
      href: "/login/client",
      features: [
        "Performance reporting",
        "Commercial visibility",
        "Support and delivery tracking",
      ],
    },
    {
      key: "admin",
      title: "Operator access",
      summary: "Content, legal identity, support operations, CMS control, and workspace administration.",
      href: "/login/admin",
      features: [
        "CMS and config control",
        "Workspace operations",
        "Support and commercial oversight",
      ],
    },
  ];
}

export function buildMarketplaceOfferCards(): MarketplaceOfferCard[] {
  const seeded = cmsSeedPromotions.map((promotion) => ({
    slug: promotion.slug,
    title: promotion.title,
    subtitle: promotion.subtitle ?? "Premium growth operating support.",
    ctaLabel: promotion.ctaLabel,
    ctaHref: promotion.ctaHref,
    placement: promotion.placement,
  }));

  const coreServices: MarketplaceOfferCard[] = [
    {
      slug: "service-strategy-systems",
      title: "Strategy and growth systems",
      subtitle: "Discovery, positioning, channel strategy, operating plans, and approval-aligned execution design.",
      ctaLabel: "Discuss strategy",
      ctaHref: "mailto:hello@oyeimagine.com?subject=Strategy%20Systems",
      placement: "marketplace-core",
    },
    {
      slug: "service-performance-marketing",
      title: "Performance marketing and analytics",
      subtitle: "Search, paid media, reporting, KPI frameworks, dashboards, and optimization loops.",
      ctaLabel: "Discuss performance",
      ctaHref: "mailto:hello@oyeimagine.com?subject=Performance%20Marketing",
      placement: "marketplace-core",
    },
    {
      slug: "service-creative-content",
      title: "Creative, content, and landing experiences",
      subtitle: "Creative systems, landing experiences, content planning, and campaign-ready digital assets.",
      ctaLabel: "Discuss creative",
      ctaHref: "mailto:hello@oyeimagine.com?subject=Creative%20Content",
      placement: "marketplace-core",
    },
  ];

  return [...seeded, ...coreServices];
}

export function buildLeadershipProfiles(): CmsPersonProfile[] {
  return cmsSeedPeople.filter((profile) => profile.profileType === "leadership");
}

export function buildExpertProfiles(): CmsPersonProfile[] {
  return cmsSeedPeople.filter((profile) => profile.profileType === "expert");
}

export function buildFaqEntries(): CmsFaq[] {
  return [...cmsSeedFaqs].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function buildFooterMeta(): FooterMeta {
  return {
    legalName: oyeImagineOrganizationProfile.legalName,
    gstin: oyeImagineOrganizationProfile.gstin,
    cin: oyeImagineOrganizationProfile.cin,
    supportEmail: oyeImagineOrganizationProfile.supportMailbox,
    supportPhone: oyeImagineOrganizationProfile.contactPhones[0]?.value ?? "",
  };
}

export function buildSupportStripModel(): SupportStripModel {
  return {
    primaryEmail: oyeImagineOrganizationProfile.supportMailbox,
    primaryPhone: oyeImagineOrganizationProfile.contactPhones[0]?.value ?? "",
    supportChannels: oyeImagineSupportChannels.map((channel) => `${channel.label}: ${channel.destination}`),
  };
}

export function buildPublicTrustMarkers(): string[] {
  return [
    "CMS-backed public surfaces",
    "Canonical legal and tax identity",
    "Dedicated client and operator access lanes",
    `Trusted operating environment for ${neejeeCanonicalBrandProfile.brandName}`,
  ];
}