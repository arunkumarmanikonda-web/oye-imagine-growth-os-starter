import type { CmsFaq, CmsPage, CmsPersonProfile, CmsPromotion, CmsSection } from "./cms-types";

export const cmsSeedPages: CmsPage[] = [
  {
    slug: "home",
    title: "Oye !magine Homepage",
    audience: "public",
    pageType: "homepage",
    status: "draft",
    layoutKey: "public-home-v1",
    seo: {
      title: "Oye !magine | AI-native digital marketing services",
      description: "World-class AI-enabled digital marketing services with premium operator-grade delivery.",
      keywords: ["digital marketing", "AI growth OS", "marketplace", "performance marketing"],
    },
  },
  {
    slug: "marketplace",
    title: "Marketplace",
    audience: "public",
    pageType: "marketplace",
    status: "draft",
    layoutKey: "public-marketplace-v1",
    seo: {
      title: "Oye !magine Marketplace",
      description: "Explore strategy, creative, paid media, SEO, and managed growth services.",
    },
  },
  {
    slug: "login",
    title: "Unified Login",
    audience: "public",
    pageType: "login",
    status: "draft",
    layoutKey: "auth-split-lane-v1",
    seo: {
      title: "Oye !magine Login",
      description: "Separate, clean, premium login for clients and operators.",
    },
  },
  {
    slug: "client-dashboard",
    title: "Client Dashboard",
    audience: "client",
    pageType: "dashboard",
    status: "draft",
    layoutKey: "client-dashboard-v1",
    seo: {
      title: "Client Dashboard",
      description: "Reports, invoices, ledgers, agreements, support, and AI concierge access.",
    },
  },
  {
    slug: "admin-dashboard",
    title: "Admin Dashboard",
    audience: "admin",
    pageType: "dashboard",
    status: "draft",
    layoutKey: "operator-dashboard-v1",
    seo: {
      title: "Admin Dashboard",
      description: "Control plane for content, config, legal, support, and workspace operations.",
    },
  },
];

export const cmsSeedSections: CmsSection[] = [
  {
    pageSlug: "home",
    sectionKey: "home-hero",
    title: "Homepage hero",
    sectionType: "hero",
    status: "draft",
    slotKey: "hero.primary",
    sortOrder: 10,
    content: {
      eyebrow: "AI-native growth operations",
      heading: "World-class digital marketing services powered by AI and operator-grade execution.",
      subheading: "Separate client and admin experiences, premium reporting, and centrally controlled brand surfaces.",
      ctaLabel: "Start with Oye !magine",
      ctaHref: "mailto:hello@oyeimagine.com",
    },
  },
  {
    pageSlug: "home",
    sectionKey: "leadership-team",
    title: "Leadership team",
    sectionType: "leadership",
    status: "draft",
    slotKey: "leadership.primary",
    sortOrder: 20,
    content: {
      description: "CMS-backed leadership area editable from admin controller.",
    },
  },
  {
    pageSlug: "home",
    sectionKey: "key-experts",
    title: "Key experts",
    sectionType: "experts",
    status: "draft",
    slotKey: "experts.primary",
    sortOrder: 30,
    content: {
      description: "CMS-backed specialist roster for digital marketing support and delivery.",
    },
  },
  {
    pageSlug: "home",
    sectionKey: "promo-strip",
    title: "Promotional surfaces",
    sectionType: "promo-strip",
    status: "draft",
    slotKey: "promo.global-top",
    sortOrder: 40,
    content: {
      description: "Banner and offer rail managed from admin controller.",
    },
  },
  {
    pageSlug: "home",
    sectionKey: "faq",
    title: "FAQ",
    sectionType: "faq",
    status: "draft",
    slotKey: "faq.primary",
    sortOrder: 50,
    content: {
      description: "CMS-backed FAQ for service, billing, and support queries.",
    },
  },
  {
    pageSlug: "home",
    sectionKey: "contact",
    title: "Contact and CTA",
    sectionType: "contact",
    status: "draft",
    slotKey: "contact.primary",
    sortOrder: 60,
    content: {
      email: "hello@oyeimagine.com",
      phone: "+91 8 988 988 988",
      ctaLabel: "Email Oye !magine",
      ctaHref: "mailto:hello@oyeimagine.com",
    },
  },
];

export const cmsSeedPromotions: CmsPromotion[] = [
  {
    slug: "promo-growth-audit",
    audience: "public",
    placement: "homepage-hero-side",
    title: "AI growth audit",
    subtitle: "One-click discovery and strategy intake for serious brands.",
    status: "draft",
    ctaLabel: "Request audit",
    ctaHref: "mailto:hello@oyeimagine.com?subject=Growth%20Audit",
    offerTerms: "Initial consult and scope discovery subject to qualification.",
  },
  {
    slug: "promo-marketplace-launch",
    audience: "public",
    placement: "marketplace-banner",
    title: "Marketplace launch support",
    subtitle: "Strategy, media, creative, analytics, and managed services under one operating layer.",
    status: "draft",
    ctaLabel: "Talk to Oye !magine",
    ctaHref: "mailto:hello@oyeimagine.com?subject=Marketplace%20Launch",
  },
];

export const cmsSeedPeople: CmsPersonProfile[] = [
  {
    slug: "leadership-slot-01",
    audience: "public",
    profileType: "leadership",
    displayName: "Leadership profile placeholder",
    title: "Founder / leadership slot",
    team: "Leadership",
    status: "draft",
    bio: "Editable from admin controller. Replace with real approved profile.",
    expertise: ["Vision", "Commercials", "Delivery oversight"],
    ctaLabel: "Contact leadership office",
    ctaHref: "mailto:hello@oyeimagine.com",
  },
  {
    slug: "expert-slot-01",
    audience: "public",
    profileType: "expert",
    displayName: "Key expert placeholder",
    title: "Performance marketing specialist slot",
    team: "Growth Delivery",
    status: "draft",
    bio: "Editable from admin controller. Replace with approved expert profile.",
    expertise: ["Performance marketing", "Analytics", "Campaign operations"],
    ctaLabel: "Request expert support",
    ctaHref: "mailto:hello@oyeimagine.com",
  },
];

export const cmsSeedFaqs: CmsFaq[] = [
  {
    slug: "faq-services",
    audience: "public",
    category: "services",
    question: "What does Oye !magine offer?",
    answer: "Digital marketing strategy, creative, paid media, SEO, analytics, lifecycle support, and AI-enabled managed execution.",
    status: "draft",
    sortOrder: 10,
  },
  {
    slug: "faq-billing",
    audience: "public",
    category: "billing",
    question: "Where should clients reach billing or support?",
    answer: "Use hello@oyeimagine.com or the official phone line +91 8 988 988 988.",
    status: "draft",
    sortOrder: 20,
  },
];