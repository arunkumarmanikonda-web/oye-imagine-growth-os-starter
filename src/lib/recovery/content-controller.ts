import type {
  AiContentOperation,
  ContentAuditEvent,
  ContentFaqEntry,
  ContentPage,
  ContentPromotion,
  ContentPublishVersion,
  ContentSection,
  ContentStudioSnapshot,
  FaqEntry,
  PeopleProfile,
} from './recovery-types'

export const contentPages: ContentPage[] = [
  {
    id: 'page_public_home',
    slug: '/',
    title: 'Public homepage',
    kind: 'public_page',
    visibility: 'public',
    lifecycleStatus: 'published',
    seoTitle: 'Oye !magine - Premium AI-native growth operating system',
    seoDescription: 'Luxury corporate growth operating system with central config, support visibility and governed content control.',
  },
  {
    id: 'page_public_marketplace',
    slug: '/marketplace',
    title: 'Marketplace entry',
    kind: 'marketplace_page',
    visibility: 'public',
    lifecycleStatus: 'published',
    seoTitle: 'Marketplace - Oye !magine',
    seoDescription: 'Discover service lanes, specialists, offers and request-led growth engagements.',
  },
  {
    id: 'page_login_client',
    slug: '/login/client',
    title: 'Client login',
    kind: 'auth_page',
    visibility: 'public',
    lifecycleStatus: 'draft',
    seoTitle: 'Client login - Oye !magine',
    seoDescription: 'Secure client entry for agreements, invoices, reports and concierge access.',
  },
  {
    id: 'page_login_admin',
    slug: '/login/admin',
    title: 'Admin login',
    kind: 'auth_page',
    visibility: 'public',
    lifecycleStatus: 'draft',
    seoTitle: 'Admin login - Oye !magine',
    seoDescription: 'Secure operator access for content control, configuration and operations.',
  },
  {
    id: 'page_help_center',
    slug: '/help',
    title: 'Help center',
    kind: 'system_page',
    visibility: 'shared',
    lifecycleStatus: 'draft',
    seoTitle: 'Help center - Oye !magine',
    seoDescription: 'Support, contact, billing help and governed FAQs.',
  },
]

export const contentSections: ContentSection[] = [
  {
    id: 'section_home_hero',
    pageId: 'page_public_home',
    key: 'hero',
    title: 'Luxury public hero',
    kind: 'hero',
    order: 1,
    lifecycleStatus: 'published',
    summary: 'World-class AI-native growth platform headline, trust copy and CTA stack.',
  },
  {
    id: 'section_home_trust',
    pageId: 'page_public_home',
    key: 'trust-ribbon',
    title: 'Trust and legal identity ribbon',
    kind: 'proof',
    order: 2,
    lifecycleStatus: 'published',
    summary: 'CIN, GSTIN, support identity and premium trust signals.',
  },
  {
    id: 'section_home_people',
    pageId: 'page_public_home',
    key: 'leadership-and-experts',
    title: 'Leadership and experts rail',
    kind: 'people',
    order: 3,
    lifecycleStatus: 'draft',
    summary: 'Leadership team, expert profiles and trust-by-people surface.',
  },
  {
    id: 'section_marketplace_promo',
    pageId: 'page_public_marketplace',
    key: 'marketplace-launch-strip',
    title: 'Marketplace promo strip',
    kind: 'promo',
    order: 1,
    lifecycleStatus: 'draft',
    summary: 'Offer banners, service lane CTAs and request-intake framing.',
  },
  {
    id: 'section_help_contact',
    pageId: 'page_help_center',
    key: 'support-contact-block',
    title: 'Support and contact panel',
    kind: 'support',
    order: 1,
    lifecycleStatus: 'draft',
    summary: 'Public support phone, support email and response expectations.',
  },
]

export const contentPromotions: ContentPromotion[] = [
  {
    id: 'promo_strategy_consult',
    key: 'strategy-consult',
    kind: 'banner',
    title: 'Book a premium growth consultation',
    summary: 'High-trust CTA for public and marketplace surfaces.',
    ctaLabel: 'Talk to Oye !magine',
    ctaHref: '/contact',
    lifecycleStatus: 'draft',
  },
  {
    id: 'promo_marketplace_launch',
    key: 'marketplace-launch',
    kind: 'announcement',
    title: 'Marketplace specialist lanes now opening',
    summary: 'Promotional launch strip for specialist-led discovery.',
    ctaLabel: 'Explore the marketplace',
    ctaHref: '/marketplace',
    lifecycleStatus: 'draft',
  },
]

export const contentPeopleProfiles: PeopleProfile[] = [
  {
    id: 'person_growth_strategy_lead',
    role: 'leadership',
    displayName: 'Growth Strategy Lead',
    title: 'Leadership surface seed',
    summary: 'Governed placeholder for the leadership rail under admin control.',
    lifecycleStatus: 'draft',
    featured: true,
  },
  {
    id: 'person_performance_expert',
    role: 'expert',
    displayName: 'Performance Marketing Expert',
    title: 'Expert surface seed',
    summary: 'Governed placeholder for digital marketing specialist profiles.',
    lifecycleStatus: 'draft',
    featured: true,
  },
  {
    id: 'person_client_success_support',
    role: 'support',
    displayName: 'Client Success Support',
    title: 'Support surface seed',
    summary: 'Governed placeholder for support and account success profile surfaces.',
    lifecycleStatus: 'draft',
    featured: false,
  },
]

export const contentFaqEntries: FaqEntry[] = [
  {
    id: 'faq_services',
    audience: 'public',
    question: 'What services does Oye !magine offer?',
    answer: 'Growth strategy, premium digital marketing, specialist marketplace support, reporting and AI-native operating system workflows.',
    lifecycleStatus: 'draft',
  },
  {
    id: 'faq_support',
    audience: 'shared',
    question: 'How can I contact support?',
    answer: 'Use hello@oyeimagine.com, the support phone line, or the governed contact form.',
    lifecycleStatus: 'draft',
  },
]

export const contentPublishVersions: ContentPublishVersion[] = [
  {
    id: 'version_home_v1',
    targetType: 'page',
    targetId: 'page_public_home',
    versionLabel: 'home-v1',
    lifecycleStatus: 'published',
    publishedAt: '2026-07-30T08:00:00.000Z',
  },
  {
    id: 'version_marketplace_v1',
    targetType: 'page',
    targetId: 'page_public_marketplace',
    versionLabel: 'marketplace-v1',
    lifecycleStatus: 'draft',
  },
  {
    id: 'version_people_rail_v1',
    targetType: 'section',
    targetId: 'section_home_people',
    versionLabel: 'people-rail-v1',
    lifecycleStatus: 'scheduled',
    scheduledFor: '2026-08-02T10:00:00.000Z',
  },
]

export const contentAuditEvents: ContentAuditEvent[] = [
  {
    id: 'audit_001',
    targetType: 'config',
    targetId: 'org_oye_imagine',
    action: 'seeded',
    actorLabel: 'Recovery batch A1',
    createdAt: '2026-07-30T08:05:00.000Z',
    detail: 'Seeded organization legal identity and support contact foundation.',
  },
  {
    id: 'audit_002',
    targetType: 'page',
    targetId: 'page_public_home',
    action: 'published',
    actorLabel: 'Recovery batch A1',
    createdAt: '2026-07-30T08:10:00.000Z',
    detail: 'Registered public homepage as a governed content page.',
  },
]

export const aiContentOperations: AiContentOperation[] = [
  {
    id: 'ai_generate_draft',
    kind: 'generate_draft',
    label: 'Generate draft',
    description: 'Create a governed first-pass section draft.',
    governed: true,
  },
  {
    id: 'ai_rewrite_brand_tone',
    kind: 'rewrite',
    label: 'Rewrite in brand tone',
    description: 'Rewrite controlled content in premium Oye !magine tone.',
    governed: true,
  },
  {
    id: 'ai_expand_copy',
    kind: 'expand',
    label: 'Expand copy',
    description: 'Expand compact copy into richer premium narrative blocks.',
    governed: true,
  },
  {
    id: 'ai_generate_banner',
    kind: 'generate_banner',
    label: 'Generate banner copy',
    description: 'Create promotional banner/title/CTA combinations.',
    governed: true,
  },
  {
    id: 'ai_generate_bio',
    kind: 'generate_bio',
    label: 'Generate leadership/expert bio',
    description: 'Turn internal notes into governed people-profile summaries.',
    governed: true,
  },
  {
    id: 'ai_generate_faq',
    kind: 'generate_faq',
    label: 'Generate FAQ entries',
    description: 'Turn support intent into controlled FAQ answers.',
    governed: true,
  },
  {
    id: 'ai_schedule_publish',
    kind: 'schedule_publish',
    label: 'Schedule publish',
    description: 'Prepare a governed publish scheduling request.',
    governed: true,
  },
  {
    id: 'ai_rollback_version',
    kind: 'rollback_version',
    label: 'Rollback published version',
    description: 'Create a governed rollback instruction for the selected target.',
    governed: true,
  },
]

export function listContentPages(): ContentPage[] {
  return contentPages
}

export function listSectionsForPage(pageId: string): ContentSection[] {
  return contentSections
    .filter((section) => section.pageId === pageId)
    .sort((left, right) => left.order - right.order)
}

export function listContentPromotions(): ContentPromotion[] {
  return contentPromotions
}

export function listPeopleProfiles(): PeopleProfile[] {
  return contentPeopleProfiles
}

export function listFaqEntries(): FaqEntry[] {
  return contentFaqEntries
}

export function listAiContentOperations(): AiContentOperation[] {
  return aiContentOperations
}

export function getContentStudioSnapshot(): ContentStudioSnapshot {
  return {
    totalPages: contentPages.length,
    totalSections: contentSections.length,
    totalPromotions: contentPromotions.length,
    totalPeopleProfiles: contentPeopleProfiles.length,
    totalFaqEntries: contentFaqEntries.length,
    totalPublishVersions: contentPublishVersions.length,
    scheduledCount: contentPublishVersions.filter((version) => version.lifecycleStatus === 'scheduled').length,
    publishedCount: contentPublishVersions.filter((version) => version.lifecycleStatus === 'published').length,
    aiOperationCount: aiContentOperations.length,
  }
}

export function getContentControllerPanels() {
  const snapshot = getContentStudioSnapshot()

  return [
    {
      id: 'panel_site_content',
      label: 'Site content',
      value: snapshot.totalPages,
      summary: 'Public pages, marketplace entry, auth pages and shared help surfaces.',
    },
    {
      id: 'panel_people',
      label: 'Leadership and experts',
      value: snapshot.totalPeopleProfiles,
      summary: 'Leadership, expert, support and advisor profiles under governed control.',
    },
    {
      id: 'panel_promotions',
      label: 'Promotions and offers',
      value: snapshot.totalPromotions,
      summary: 'Banner units, offers, announcements and campaign strips.',
    },
    {
      id: 'panel_ai_ops',
      label: 'AI content actions',
      value: snapshot.aiOperationCount,
      summary: 'One-click governed AI actions for drafts, rewrites, banners, FAQs and rollback preparation.',
    },
  ]
}