import { organizationProfile, supportChannels } from './organization-profile'

export type ContentSurface = 'public' | 'client' | 'admin'

export interface ContentPage {
  id: string
  slug: string
  path: string
  surface: ContentSurface
  navigationLabel: string
  title: string
  headline: string
  summary: string
  ctaLabel?: string
  ctaHref?: string
}

export interface ContentSection {
  id: string
  pageSlug: string
  key: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  ctaLabel?: string
  ctaHref?: string
}

export interface ContentPromotion {
  id: string
  key: string
  pageSlug: string
  badge: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export interface ContentFaqEntry {
  id: string
  pageSlug: string
  question: string
  answer: string
}

export interface ContentPeopleProfile {
  id: string
  name: string
  role: string
  summary: string
}

const supportEmail =
  supportChannels.find((channel) => String(channel.value).includes('@'))?.value ?? 'hello@oyeimagine.com'

const supportPhone =
  supportChannels.find((channel) => String(channel.value).includes('+91'))?.value ?? '+91 8 988 988 988'

export const contentPages: ContentPage[] = [
  {
    id: 'page-home',
    slug: 'home',
    path: '/',
    surface: 'public',
    navigationLabel: 'Home',
    title: 'Oye !magine',
    headline: 'AI-native Growth OS for ambitious brands',
    summary:
      'A premium growth operating system combining strategy, specialist execution, governed delivery, and operator-grade controls.',
    ctaLabel: 'Explore the platform',
    ctaHref: '/marketplace'
  },
  {
    id: 'page-marketplace',
    slug: 'marketplace',
    path: '/marketplace',
    surface: 'public',
    navigationLabel: 'Marketplace',
    title: 'Specialist marketplace',
    headline: 'Governed specialist access without execution ambiguity',
    summary:
      'Browse positioned specialist workflows, managed-service paths, and execution governance built for accountable growth.',
    ctaLabel: 'Explore marketplace',
    ctaHref: '/marketplace'
  },
  {
    id: 'page-contact',
    slug: 'contact',
    path: '/contact',
    surface: 'public',
    navigationLabel: 'Contact',
    title: 'Contact Oye !magine',
    headline: 'Trust-first contact and support surface',
    summary:
      'Canonical support identity, legal presence, and governed response channels for operators, clients, and prospects.',
    ctaLabel: 'Contact support',
    ctaHref: '/contact'
  },
  {
    id: 'page-login',
    slug: 'login',
    path: '/login',
    surface: 'public',
    navigationLabel: 'Login',
    title: 'Access hub',
    headline: 'Separate client and operator entry points',
    summary:
      'Choose the correct role-specific entry path with no mixed-shell ambiguity across client and admin experiences.',
    ctaLabel: 'Choose access path',
    ctaHref: '/login'
  },
  {
    id: 'page-client',
    slug: 'client',
    path: '/client',
    surface: 'client',
    navigationLabel: 'Client access',
    title: 'Client workspace',
    headline: 'Workspace-bound client experience',
    summary:
      'Client surfaces must resolve against canonical workspace truth, deliverable visibility, support routing, and commercial clarity.',
    ctaLabel: 'Client sign in',
    ctaHref: '/login/client'
  },
  {
    id: 'page-admin',
    slug: 'admin',
    path: '/admin',
    surface: 'admin',
    navigationLabel: 'Admin workspace',
    title: 'Operator workspace',
    headline: 'Governed operator control plane',
    summary:
      'Protected operator surface for content governance, support operations, configuration management, and runtime enforcement.',
    ctaLabel: 'Operator sign in',
    ctaHref: '/login/admin'
  }
]

export const contentSections: ContentSection[] = [
  {
    id: 'section-home-hero',
    pageSlug: 'home',
    key: 'hero',
    eyebrow: 'Oye !magine AI Growth OS',
    title: 'Premium operating layer for strategy, execution, and governed growth',
    description:
      'A trust-first public shell that replaces prototype messaging with premium positioning, legal identity, and clear role-based access.',
    bullets: [
      'Luxury public experience with no fake readiness language',
      'Clear separation between public, client, and operator surfaces',
      'Canonical legal, support, and governance presentation'
    ],
    ctaLabel: 'Enter the platform',
    ctaHref: '/login'
  },
  {
    id: 'section-home-trust',
    pageSlug: 'home',
    key: 'trust',
    eyebrow: 'Trust and identity',
    title: 'Canonical legal and commercial identity',
    description:
      'All trust surfaces must resolve to the locked company identity, tax identity, support mailbox, and support phone.',
    bullets: [
      organizationProfile.legalName,
      `GSTIN ${organizationProfile.gstin}`,
      `${organizationProfile.principalPlaceOfBusiness}`
    ]
  },
  {
    id: 'section-marketplace-core',
    pageSlug: 'marketplace',
    key: 'marketplace-hero',
    eyebrow: 'Specialist marketplace',
    title: 'Browse governed specialist and managed-service workflows',
    description:
      'Marketplace flows must preserve positioning, managed-service routing, and operator oversight across proposal and activation paths.',
    bullets: [
      'Specialist and managed-service entry paths',
      'Operator-visible routing and coordination',
      'No ambiguity between prospect and client journeys'
    ],
    ctaLabel: 'Explore marketplace',
    ctaHref: '/marketplace'
  },
  {
    id: 'section-contact-core',
    pageSlug: 'contact',
    key: 'contact-core',
    eyebrow: 'Support foundation',
    title: 'Canonical support and legal contact surface',
    description:
      'Contact routes must surface the same legal identity, support mailbox, support number, and address across public and operator experiences.',
    bullets: [
      String(supportEmail),
      String(supportPhone),
      organizationProfile.legalName
    ]
  },
  {
    id: 'section-login-hub',
    pageSlug: 'login',
    key: 'login-hub',
    eyebrow: 'Access split',
    title: 'Choose the correct role-specific entry path',
    description:
      'Login must direct clients and operators into separate role-safe flows with redirect awareness and no mixed-shell confusion.',
    bullets: [
      'Separate client sign-in route',
      'Separate operator sign-in route',
      'Redirect-aware protected route flow'
    ],
    ctaLabel: 'Review access options',
    ctaHref: '/login'
  },
  {
    id: 'section-client-welcome',
    pageSlug: 'client',
    key: 'client-welcome',
    eyebrow: 'Client workspace',
    title: 'Workspace-bound delivery and support visibility',
    description:
      'Client routes must resolve to canonical workspace truth before allowing access to deliverables, support, and commercial records.',
    bullets: [
      'Workspace-aware access',
      'Support and deliverable routing',
      'Commercial and strategy visibility foundations'
    ]
  },
  {
    id: 'section-admin-summary',
    pageSlug: 'admin',
    key: 'admin-summary',
    eyebrow: 'Operator workspace',
    title: 'Governed operator control plane',
    description:
      'Operator surfaces centralize content, configuration, support, runtime enforcement, and trust-safe platform governance.',
    bullets: [
      'Content governance',
      'Configuration control',
      'Support operations and runtime audit'
    ]
  }
]

export const contentPromotions: ContentPromotion[] = [
  {
    id: 'promo-home-platform',
    key: 'platform-overview',
    pageSlug: 'home',
    badge: 'Platform overview',
    title: 'AI-native growth system with premium trust signals',
    description:
      'Replace prototype shell behavior with governed public, client, and admin journeys backed by locked legal identity.',
    ctaLabel: 'See marketplace',
    ctaHref: '/marketplace'
  },
  {
    id: 'promo-login-split',
    key: 'access-split',
    pageSlug: 'login',
    badge: 'Access governance',
    title: 'Separate client and operator entry points',
    description:
      'Role-specific entry points prevent mixed-shell confusion and support redirect-safe route protection.',
    ctaLabel: 'Go to access hub',
    ctaHref: '/login'
  },
  {
    id: 'promo-admin-governance',
    key: 'operator-governance',
    pageSlug: 'admin',
    badge: 'Operator governance',
    title: 'Content, support, config, and runtime enforcement',
    description:
      'The operator shell unifies controlled publishing, support inbox management, configuration, and runtime shell audit.',
    ctaLabel: 'Open admin workspace',
    ctaHref: '/admin'
  }
]

export const contentFaqEntries: ContentFaqEntry[] = [
  {
    id: 'faq-home-identity',
    pageSlug: 'home',
    question: 'What legal identity must the platform display?',
    answer: `${organizationProfile.legalName} with GSTIN ${organizationProfile.gstin}.`
  },
  {
    id: 'faq-contact-support',
    pageSlug: 'contact',
    question: 'Which support channels are canonical?',
    answer: `Email ${String(supportEmail)} and phone ${String(supportPhone)}.`
  },
  {
    id: 'faq-login-split',
    pageSlug: 'login',
    question: 'Why are login paths separated?',
    answer: 'Client and operator flows must remain role-safe and never collapse into a mixed-shell sign-in experience.'
  },
  {
    id: 'faq-client-workspace',
    pageSlug: 'client',
    question: 'What does the client workspace require?',
    answer: 'Authenticated client access bound to canonical workspace truth.'
  },
  {
    id: 'faq-admin-governance',
    pageSlug: 'admin',
    question: 'What lives in the operator workspace?',
    answer: 'Content governance, support operations, configuration, and runtime enforcement oversight.'
  }
]

export const contentPeopleProfiles: ContentPeopleProfile[] = [
  {
    id: 'profile-operator-governance',
    name: 'Operator Governance Desk',
    role: 'Platform Governance',
    summary: 'Owns publish review, legal/trust alignment, and runtime-safe control-plane operations.'
  },
  {
    id: 'profile-client-success',
    name: 'Client Success Desk',
    role: 'Client Operations',
    summary: 'Supports workspace clarity, deliverable visibility, and governed support follow-up.'
  },
  {
    id: 'profile-support-identity',
    name: 'Support Desk',
    role: 'Support Operations',
    summary: `Primary governed contact identity using ${String(supportEmail)} and ${String(supportPhone)}.`
  }
]

export function getContentPageBySlug(slug: string) {
  return contentPages.find((page) => page.slug === slug) ?? null
}

export function getPageBySlug(slug: string) {
  return getContentPageBySlug(slug)
}

export function getContentSectionsByPageSlug(pageSlug: string) {
  return contentSections.filter((section) => section.pageSlug === pageSlug)
}

export function getSectionsForPage(pageSlug: string) {
  return getContentSectionsByPageSlug(pageSlug)
}

export function getContentPromotionsByPageSlug(pageSlug: string) {
  return contentPromotions.filter((promotion) => promotion.pageSlug === pageSlug)
}

export function getPromotionsForPage(pageSlug: string) {
  return getContentPromotionsByPageSlug(pageSlug)
}

export function getContentFaqEntriesByPageSlug(pageSlug: string) {
  return contentFaqEntries.filter((entry) => entry.pageSlug === pageSlug)
}

export function getFaqEntriesForPage(pageSlug: string) {
  return getContentFaqEntriesByPageSlug(pageSlug)
}

export function getContentPeopleProfiles() {
  return contentPeopleProfiles
}

export function getSupportIdentitySnapshot() {
  return {
    legalName: organizationProfile.legalName,
    gstin: organizationProfile.gstin,
    supportEmail: String(supportEmail),
    supportPhone: String(supportPhone),
    addressLine1: organizationProfile.principalPlaceOfBusiness,
    city: '',
    state: '',
    postalCode: ''
  }
}

export function getContentControllerSnapshot() {
  return {
    totalPages: contentPages.length,
    totalSections: contentSections.length,
    totalPromotions: contentPromotions.length,
    totalFaqEntries: contentFaqEntries.length,
    totalPeopleProfiles: contentPeopleProfiles.length,
    pageSlugs: contentPages.map((page) => page.slug),
    publicPageCount: contentPages.filter((page) => page.surface === 'public').length,
    clientPageCount: contentPages.filter((page) => page.surface === 'client').length,
    adminPageCount: contentPages.filter((page) => page.surface === 'admin').length,
    supportIdentity: getSupportIdentitySnapshot()
  }
}

export function getContentStudioSnapshot() {
  return getContentControllerSnapshot()
}

export function getContentControllerPanels() {
  const pagePanels = contentPages.map((page) => ({
    id: page.id,
    slug: page.slug,
    path: page.path,
    surface: page.surface,
    label: page.navigationLabel,
    title: page.headline,
    summary: page.summary,
  }))

  return [
    ...pagePanels,
    {
      id: 'panel-leadership-experts',
      slug: 'leadership-experts',
      path: '/admin/content',
      surface: 'admin' as const,
      label: 'Leadership and experts',
      title: 'Leadership and experts',
      summary: 'Profiles, expert positioning, and operator-visible governance surfaces.'
    }
  ]
}

function resolveRecoveryPageSlug(pageIdOrSlug: string) {
  const aliases: Record<string, string> = {
    page_public_home: 'home',
    page_public_marketplace: 'marketplace',
    page_public_contact: 'contact',
    page_public_login: 'login',
    page_client_workspace: 'client',
    page_admin_workspace: 'admin'
  }

  return (
    aliases[pageIdOrSlug] ??
    contentPages.find((page) => page.id === pageIdOrSlug)?.slug ??
    getContentPageBySlug(pageIdOrSlug)?.slug ??
    pageIdOrSlug
  )
}

export function listAiContentOperations() {
  return [
    {
      id: 'ai-op-generate-banner',
      kind: 'generate_banner',
      label: 'Generate banner',
      summary: 'Generate governed hero/banner creative for public and commercial content surfaces.'
    },
    {
      id: 'ai-op-rollback-version',
      kind: 'rollback_version',
      label: 'Rollback version',
      summary: 'Rollback content to the last governed approved version.'
    }
  ]
}

export function listContentPromotions() {
  return [...contentPromotions]
}

export function listPeopleProfiles() {
  return contentPeopleProfiles.map((profile, index) => ({
    ...profile,
    role: index === 0 ? 'leadership' : profile.role
  }))
}

export function listSectionsForPage(pageIdOrSlug: string) {
  const pageSlug = resolveRecoveryPageSlug(pageIdOrSlug)

  return getSectionsForPage(pageSlug).map((section) => ({
    ...section,
    pageId: pageIdOrSlug,
    kind: section.key
  }))
}

export function listPublishedPromotions() {
  return [...contentPromotions]
}

export function listFeaturedPeopleProfiles() {
  return [...contentPeopleProfiles]
}

export function listPublishedFaqEntries() {
  return [...contentFaqEntries]
}
