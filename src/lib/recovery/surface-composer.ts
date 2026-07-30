import {
  findContentPageBySlug,
  getContentControllerPanels,
  getContentStudioSnapshot,
  listFeaturedPeopleProfiles,
  listPublishedFaqEntries,
  listPublishedPromotions,
  listPublishedSectionsForPage,
} from './content-controller'

const organization = {
  legalIdentity: {
    legalName: 'OYE IMAGINE PRIVATE LIMITED',
    cin: 'U47190UP2025PTC220916',
    pan: 'AAECO6856D',
    tan: 'MRTO02898A',
    gstin: '09AAECO6856D1Z8',
    principalPlaceOfBusiness: 'Suite No.11 A-116 Urbtech Trade Centre Sector-132 Maharishi Nagar Noida',
  },
  contactProfile: {
    supportEmail: 'hello@oyeimagine.com',
    supportPhone: '+91 8 988 988 988',
  },
  footerIdentityLine:
    'OYE IMAGINE PRIVATE LIMITED · CIN U47190UP2025PTC220916 · PAN AAECO6856D · GSTIN 09AAECO6856D1Z8',
  trustCopy:
    'Neejee remains the canonical pilot and all visible surfaces are being rebuilt around governed content, legal truth and premium operator control.',
}

const supportChannels = [
  {
    id: 'support_email',
    type: 'email',
    label: 'Primary support email',
    value: 'hello@oyeimagine.com',
    provider: 'Resend',
    href: 'mailto:hello@oyeimagine.com',
  },
  {
    id: 'support_phone',
    type: 'phone',
    label: 'Primary phone',
    value: '+91 8 988 988 988',
    provider: 'Voice',
    href: 'tel:+918988988988',
  },
]

const marketplaceServiceLanes = [
  {
    id: 'lane_growth_strategy',
    title: 'Growth strategy and operating model',
    summary: 'Structured strategic planning, commercial clarity and operating rhythm for premium client accounts.',
  },
  {
    id: 'lane_performance_systems',
    title: 'Performance marketing systems',
    summary: 'Search, paid social and reporting structures shaped for measurable execution.',
  },
  {
    id: 'lane_specialist_delivery',
    title: 'Marketplace specialist delivery',
    summary: 'Specialist matching, proposal flow, governed execution and deliverable visibility.',
  },
]

const marketplaceProcess = [
  {
    id: 'step_request',
    title: 'Submit a brief',
    summary: 'Start with a premium request surface that captures scope, urgency and service lane.',
  },
  {
    id: 'step_proposal',
    title: 'Receive a proposal',
    summary: 'The marketplace routes the brief into proposal-led commercial and specialist review.',
  },
  {
    id: 'step_delivery',
    title: 'Track governed delivery',
    summary: 'Clients and marketplace users retain visibility into status, documents and deliverables.',
  },
]

const responseStandards = [
  'Support identity is canonical and governed from a single contact profile.',
  'No dead CTA paths; every public route resolves into a real destination.',
  'Legal identity and business contact facts remain immutable across visible UI.',
]

function requirePage(slug) {
  const page = findContentPageBySlug(slug)
  if (!page) throw new Error(`Missing page: ${slug}`)
  return page
}

function getPageHero(pageId) {
  const sections = listPublishedSectionsForPage(pageId)
  return sections.find((section) => section.kind === 'hero') ?? sections[0]
}

export function getPublicHomepageExperience() {
  const page = requirePage('/')
  const sections = listPublishedSectionsForPage(page.id)

  return {
    page,
    hero: sections.find((section) => section.kind === 'hero') ?? sections[0],
    metric: sections.find((section) => section.kind === 'metrics'),
    featureSections: sections.filter((section) => section.kind === 'feature_grid'),
    promotions: listPublishedPromotions(),
    featuredPeople: listFeaturedPeopleProfiles(),
    faqEntries: listPublishedFaqEntries().filter((entry) => entry.audience === 'public' || entry.audience === 'shared'),
    organization,
    supportChannels,
    primaryCtas: [
      { label: 'Explore the marketplace', href: '/marketplace' },
      { label: 'Client login', href: '/login/client' },
      { label: 'Admin login', href: '/login/admin' },
    ],
  }
}

export function getMarketplaceExperience() {
  const page = requirePage('/marketplace')
  return {
    page,
    hero: getPageHero(page.id),
    lanes: marketplaceServiceLanes,
    process: marketplaceProcess,
    promotions: listPublishedPromotions().filter(
      (promotion) => promotion.ctaHref === '/marketplace' || promotion.ctaHref === '/contact',
    ),
    featuredPeople: listFeaturedPeopleProfiles().filter(
      (person) => person.role === 'specialist' || person.role === 'expert',
    ),
    faqEntries: listPublishedFaqEntries().filter((entry) => entry.audience === 'public' || entry.audience === 'shared'),
    supportChannels,
    entryCtas: [
      { label: 'Talk to Oye !magine', href: '/contact' },
      { label: 'Client login', href: '/login/client' },
    ],
  }
}

export function getContactExperience() {
  const page = requirePage('/contact')
  return {
    page,
    hero: getPageHero(page.id),
    supportChannels,
    contactCards: [
      {
        id: 'card_email',
        label: 'Email support',
        value: organization.contactProfile.supportEmail,
        summary: 'Primary mailbox for commercial, support and routed platform communication.',
      },
      {
        id: 'card_phone',
        label: 'Phone line',
        value: organization.contactProfile.supportPhone,
        summary: 'Primary phone entry for guided support and premium routing.',
      },
      {
        id: 'card_address',
        label: 'Registered business address',
        value: organization.legalIdentity.principalPlaceOfBusiness,
        summary: 'Canonical company location surfaced through governed UI.',
      },
    ],
    responseStandards,
    organization,
  }
}

export function getLoginHubExperience() {
  return {
    title: 'Choose a secure entry',
    summary:
      'Clients and operators enter through dedicated protected routes with canonical workspace and governed session handling.',
    options: [
      {
        id: 'client',
        label: 'Client login',
        href: '/login/client',
        summary: 'Agreements, invoices, reports, support and concierge access.',
      },
      {
        id: 'admin',
        label: 'Admin login',
        href: '/login/admin',
        summary: 'Operator control for content, config, workspaces and governed platform actions.',
      },
    ],
    supportChannels,
  }
}

export function getLoginSurfaceExperience(role) {
  const slug = role === 'operator' ? '/login/admin' : '/login/client'
  const page = requirePage(slug)

  return {
    page,
    role,
    formAction: '/api/auth/login',
    hiddenRole: role === 'operator' ? 'operator' : 'client',
    title: page.title,
    summary: page.seoDescription,
    supportEmail: organization.contactProfile.supportEmail,
    supportPhone: organization.contactProfile.supportPhone,
    fallbackHref: role === 'operator' ? '/login/client' : '/contact',
  }
}

export function getOperatorDashboardExperience() {
  return {
    page: requirePage('/admin'),
    contentPanels: getContentControllerPanels(),
    studioSnapshot: getContentStudioSnapshot(),
    workspaceOptions: [
      {
        workspaceId: 'workspace_neejee',
        label: 'Neejee canonical workspace',
        description: 'Canonical pilot workspace and default operator anchor.',
      },
      {
        workspaceId: 'workspace_global',
        label: 'Global recovery workspace',
        description: 'Cross-tenant command context for governed rollout.',
      },
    ],
    commandCenterCards: [
      {
        id: 'cfg_identity',
        label: 'Legal identity',
        summary: 'Immutable company identity and footer trust copy.',
      },
      {
        id: 'cfg_support',
        label: 'Support plumbing',
        summary: 'Mailbox, phone and governed contact surfaces.',
      },
      {
        id: 'cfg_content',
        label: 'Content studio',
        summary: 'Hero, promos, people, FAQs and publish visibility.',
      },
    ],
    providerSummary: { connectedCount: 2, totalCount: 3 },
    supportSummary: { totalMessages: 12, inboundCount: 7, outboundCount: 5 },
    organization,
  }
}