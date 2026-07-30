export const contentPages = [
  {
    id: 'page_public_home',
    slug: '/',
    title: 'AI-native growth operating system',
    kind: 'public_page',
    visibility: 'public',
    lifecycleStatus: 'published',
    seoTitle: 'Oye !magine - AI-native growth operating system',
    seoDescription: 'Premium AI-native growth platform with governed content, legal confidence and operator control.',
  },
  {
    id: 'page_public_marketplace',
    slug: '/marketplace',
    title: 'Marketplace for premium growth specialists',
    kind: 'marketplace_page',
    visibility: 'public',
    lifecycleStatus: 'published',
    seoTitle: 'Marketplace - Oye !magine',
    seoDescription: 'Discover specialist lanes, request entry and proposal-led premium delivery.',
  },
  {
    id: 'page_contact',
    slug: '/contact',
    title: 'Contact and support',
    kind: 'public_page',
    visibility: 'public',
    lifecycleStatus: 'published',
    seoTitle: 'Contact - Oye !magine',
    seoDescription: 'Governed contact surface for support, consultation and commercial routing.',
  },
  {
    id: 'page_login_client',
    slug: '/login/client',
    title: 'Secure client login',
    kind: 'auth_page',
    visibility: 'public',
    lifecycleStatus: 'published',
    seoTitle: 'Client login - Oye !magine',
    seoDescription: 'Client entry for agreements, invoices, reports, support and concierge.',
  },
  {
    id: 'page_login_admin',
    slug: '/login/admin',
    title: 'Protected operator login',
    kind: 'auth_page',
    visibility: 'public',
    lifecycleStatus: 'published',
    seoTitle: 'Admin login - Oye !magine',
    seoDescription: 'Protected operator entry for content, config and workspace command.',
  },
  {
    id: 'page_operator_home',
    slug: '/admin',
    title: 'Operator command deck',
    kind: 'operator_page',
    visibility: 'operator',
    lifecycleStatus: 'published',
    seoTitle: 'Operator command deck - Oye !magine',
    seoDescription: 'Internal command surface for content, config, support and canonical workspace control.',
  },
]

export const contentSections = [
  {
    id: 'section_home_hero',
    pageId: 'page_public_home',
    key: 'hero-main',
    title: 'AI-native growth operating system for brands that refuse mediocrity',
    kind: 'hero',
    order: 1,
    lifecycleStatus: 'published',
    summary: 'Premium positioning, legal trust, governed UI control and clear commercial paths in one platform shell.',
  },
  {
    id: 'section_home_metrics',
    pageId: 'page_public_home',
    key: 'trust-ribbon',
    title: 'Central truth, legal confidence and governed business control',
    kind: 'metrics',
    order: 2,
    lifecycleStatus: 'published',
    summary: 'One identity spine for legal facts, support readiness, premium presentation and future commercial workflows.',
  },
  {
    id: 'section_home_config',
    pageId: 'page_public_home',
    key: 'config-spine',
    title: 'One control surface for identity, content, support and provider readiness',
    kind: 'feature_grid',
    order: 3,
    lifecycleStatus: 'published',
    summary: 'Operator control for visible UI, company identity, support plumbing and premium content publishing.',
  },
  {
    id: 'section_home_commercial',
    pageId: 'page_public_home',
    key: 'commercial-clarity',
    title: 'Commercial clarity from agreement to invoice to reporting',
    kind: 'feature_grid',
    order: 4,
    lifecycleStatus: 'published',
    summary: 'Client-facing flows prepared for agreement truth, invoice visibility, reporting continuity and support history.',
  },
  {
    id: 'section_home_concierge',
    pageId: 'page_public_home',
    key: 'ai-concierge',
    title: 'AI concierge ready for search, retrieval, explanation and action',
    kind: 'feature_grid',
    order: 5,
    lifecycleStatus: 'published',
    summary: 'The experience layer is prepared for permission-aware search, help, navigation shortcuts and guided actions.',
  },
  {
    id: 'section_home_people',
    pageId: 'page_public_home',
    key: 'leadership-experts',
    title: 'Leadership, specialists and support under governed visibility',
    kind: 'people',
    order: 6,
    lifecycleStatus: 'published',
    summary: 'Trust surfaces for leadership, experts, marketplace specialists and support.',
  },
  {
    id: 'section_marketplace_hero',
    pageId: 'page_public_marketplace',
    key: 'marketplace-hero',
    title: 'Discover specialist lanes, managed growth models and premium engagement paths',
    kind: 'hero',
    order: 1,
    lifecycleStatus: 'published',
    summary: 'Marketplace discovery focused on real service lanes, premium requests and proposal-led execution.',
  },
  {
    id: 'section_contact_hero',
    pageId: 'page_contact',
    key: 'contact-hero',
    title: 'Talk to Oye !magine through a governed premium contact surface',
    kind: 'hero',
    order: 1,
    lifecycleStatus: 'published',
    summary: 'Support, consultation and mailbox identity exposed cleanly without dead CTA behavior.',
  },
]

export const contentPromotions = [
  {
    id: 'promo_strategy_consult',
    key: 'strategy-consult',
    kind: 'banner',
    title: 'Book a premium growth consultation',
    summary: 'High-trust CTA for premium consultation and discovery.',
    ctaLabel: 'Talk to Oye !magine',
    ctaHref: '/contact',
    lifecycleStatus: 'published',
  },
  {
    id: 'promo_marketplace_launch',
    key: 'marketplace-launch',
    kind: 'announcement',
    title: 'Marketplace specialist lanes are opening',
    summary: 'Discover premium specialist and managed-service lanes.',
    ctaLabel: 'Explore the marketplace',
    ctaHref: '/marketplace',
    lifecycleStatus: 'published',
  },
  {
    id: 'promo_client_entry',
    key: 'client-entry',
    kind: 'offer',
    title: 'Clients access one place for agreements, invoices, reports and support',
    summary: 'Client login becomes the trusted single entry to commercial truth.',
    ctaLabel: 'Client login',
    ctaHref: '/login/client',
    lifecycleStatus: 'published',
  },
]

export const contentPeopleProfiles = [
  {
    id: 'person_growth_strategy_director',
    role: 'leadership',
    displayName: 'Growth Strategy Director',
    title: 'Leadership',
    summary: 'Owns strategic positioning, commercial clarity and premium operating-system outcomes.',
    lifecycleStatus: 'published',
    featured: true,
  },
  {
    id: 'person_performance_architect',
    role: 'expert',
    displayName: 'Performance Architect',
    title: 'Digital growth expert',
    summary: 'Shapes conversion systems, campaign structure and reporting clarity.',
    lifecycleStatus: 'published',
    featured: true,
  },
  {
    id: 'person_marketplace_specialist',
    role: 'specialist',
    displayName: 'Marketplace Specialist Lead',
    title: 'Specialist operations',
    summary: 'Connects marketplace requests to the right specialist and delivery lane.',
    lifecycleStatus: 'published',
    featured: true,
  },
]

export const contentFaqEntries = [
  {
    id: 'faq_services',
    audience: 'public',
    question: 'What services does Oye !magine offer?',
    answer: 'Growth strategy, premium digital marketing, marketplace specialist support, reporting, support and AI-native operating-system workflows.',
    lifecycleStatus: 'published',
  },
  {
    id: 'faq_marketplace',
    audience: 'public',
    question: 'How does the marketplace work?',
    answer: 'The marketplace routes a brief into specialist lanes, proposal flow and governed delivery visibility.',
    lifecycleStatus: 'published',
  },
  {
    id: 'faq_support',
    audience: 'shared',
    question: 'How can I contact support?',
    answer: 'Use hello@oyeimagine.com, the primary phone line or the governed contact surface.',
    lifecycleStatus: 'published',
  },
]

export const contentPublishVersions = [
  { id: 'version_home_v2', targetType: 'page', targetId: 'page_public_home', versionLabel: 'home-v2-premium', lifecycleStatus: 'published' },
  { id: 'version_marketplace_v2', targetType: 'page', targetId: 'page_public_marketplace', versionLabel: 'marketplace-v2-premium', lifecycleStatus: 'published' },
  { id: 'version_contact_v1', targetType: 'page', targetId: 'page_contact', versionLabel: 'contact-v1', lifecycleStatus: 'published' },
]

export const contentAuditEvents = [
  { id: 'audit_001', targetType: 'page', targetId: 'page_public_home', action: 'published', actorLabel: 'Recovery batch A3' },
  { id: 'audit_002', targetType: 'promotion', targetId: 'promo_marketplace_launch', action: 'scheduled', actorLabel: 'Recovery batch A3' },
]

export const aiContentOperations = [
  { id: 'ai_generate_draft', kind: 'generate_draft', label: 'Generate draft', governed: true },
  { id: 'ai_rewrite_brand_tone', kind: 'rewrite', label: 'Rewrite in brand tone', governed: true },
  { id: 'ai_generate_banner', kind: 'generate_banner', label: 'Generate banner copy', governed: true },
  { id: 'ai_generate_faq', kind: 'generate_faq', label: 'Generate FAQ entries', governed: true },
]

export function listContentPages() {
  return contentPages
}

export function findContentPageBySlug(slug) {
  return contentPages.find((page) => page.slug === slug)
}

export function listSectionsForPage(pageId) {
  return contentSections
    .filter((section) => section.pageId === pageId)
    .sort((a, b) => a.order - b.order)
}

export function listPublishedSectionsForPage(pageId) {
  return listSectionsForPage(pageId).filter((section) => section.lifecycleStatus === 'published')
}

export function listPublishedPromotions() {
  return contentPromotions.filter((promotion) => promotion.lifecycleStatus === 'published')
}

export function listFeaturedPeopleProfiles() {
  return contentPeopleProfiles.filter((person) => person.featured && person.lifecycleStatus === 'published')
}

export function listPublishedFaqEntries() {
  return contentFaqEntries.filter((entry) => entry.lifecycleStatus === 'published')
}

export function getContentStudioSnapshot() {
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
      summary: 'Public pages, marketplace entry, contact surfaces, auth pages and operator-facing surfaces.',
    },
    {
      id: 'panel_people',
      label: 'Leadership and experts',
      value: snapshot.totalPeopleProfiles,
      summary: 'Leadership, expert and specialist trust surfaces.',
    },
    {
      id: 'panel_promotions',
      label: 'Promotions and offers',
      value: snapshot.totalPromotions,
      summary: 'Banner units, offers and announcements.',
    },
    {
      id: 'panel_ai_ops',
      label: 'AI content actions',
      value: snapshot.aiOperationCount,
      summary: 'Governed AI operations for drafts, rewrites, banners and FAQs.',
    },
  ]
}