export type PublicAction = {
  label: string
  href: string
  emphasis: 'primary' | 'secondary' | 'ghost'
}

export type PublicTrustSignal = {
  label: string
  value: string
}

export type PublicSection = {
  id: string
  eyebrow: string
  title: string
  body: string
  bullets: string[]
}

export type MarketplaceCategory = {
  name: string
  description: string
  href: string
  proofPoint: string
}

export type ContactChannel = {
  label: string
  value: string
  href: string
  supportWindow: string
}

export const publicPrototypeDenylist = [
  'PRODUCT SHELL OVERHAUL',
  'SETUP READINESS',
  '100%',
  '6/6 checks ready',
  'Open admin workspace'
] as const

const legalIdentity = {
  legalName: 'OYE IMAGINE PRIVATE LIMITED',
  brandName: 'Oye !magine',
  descriptor: 'Oye !magine AI Growth OS',
  cin: 'U47190UP2025PTC220916',
  pan: 'AAECO6856D',
  tan: 'MRTO02898A',
  gstin: '09AAECO6856D1Z8',
  gstType: 'Regular',
  principalAddress:
    'Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida / Greater Noida, Gautambuddha Nagar, Uttar Pradesh 201304',
  supportEmail: 'hello@oyeimagine.com',
  supportPhone: '+91 8 988 988 988',
  domain: 'oyeimagine.com'
}

const publicNavigation = [
  { label: 'Platform', href: '/platform' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Contact', href: '/contact' },
  { label: 'Client login', href: '/login/client' }
]

const trustSignals: PublicTrustSignal[] = [
  { label: 'Legal entity', value: legalIdentity.legalName },
  { label: 'GSTIN', value: legalIdentity.gstin },
  { label: 'Support', value: legalIdentity.supportEmail },
  { label: 'Location', value: 'Noida NCR, India' }
]

const homepageSections: PublicSection[] = [
  {
    id: 'operating-system',
    eyebrow: 'AI-native operating system',
    title: 'Run growth, delivery and commercial truth from one premium platform.',
    body:
      'Oye !magine unifies strategy, content, execution, reporting, commercial operations and governed AI assistance so operators and clients work from the same source of truth.',
    bullets: [
      'Premium product shell with distinct public, client and operator experiences',
      'Commercial truth spanning agreements, invoices, statements and collections',
      'Governed content and page operations with auditability and revision control'
    ]
  },
  {
    id: 'trust',
    eyebrow: 'Trust and governance',
    title: 'A luxury-corporate experience anchored in legal, operational and support reality.',
    body:
      'Every public-facing trust block is bound to the company identity, support channels and service governance model so the runtime reads like a real platform, not a staged mockup.',
    bullets: [
      'Central legal and tax identity across public, commercial and support flows',
      'Role-aware operator and client access separation',
      'Contact, support and company trust surfaced in the runtime'
    ]
  },
  {
    id: 'execution',
    eyebrow: 'Execution quality',
    title: 'From onboarding to execution, the system is built for governed growth work.',
    body:
      'The public experience frames the product around operator-grade execution, strategic intelligence, accountable billing and AI-supported delivery rather than marketing theater.',
    bullets: [
      'Growth OS framing instead of agency-template language',
      'Marketplace and managed-service expansion paths',
      'Evidence-ready operating model for future Neejee end-to-end evidence'
    ]
  }
]

const homepageActions: PublicAction[] = [
  { label: 'Book a strategy call', href: '/contact', emphasis: 'primary' },
  { label: 'Explore the marketplace', href: '/marketplace', emphasis: 'secondary' },
  { label: 'Client login', href: '/login/client', emphasis: 'ghost' }
]

const marketplaceCategories: MarketplaceCategory[] = [
  {
    name: 'Growth strategy and diagnostics',
    description:
      'Structured onboarding, audits, competitor intelligence and strategy-generation workflows for brands that need a governed growth operating system.',
    href: '/marketplace#strategy',
    proofPoint: 'Strategy, audit and page-system readiness'
  },
  {
    name: 'Execution and content operations',
    description:
      'SEO, content, creative, paid media, social and reporting capabilities designed to be executed under approvals, budgets and role-specific control.',
    href: '/marketplace#execution',
    proofPoint: 'Execution systems planned across SEO, paid, social and CRM'
  },
  {
    name: 'Commercial and managed services',
    description:
      'Commercial truth, collections, support and managed-service workflows built for premium B2B delivery and operator visibility.',
    href: '/marketplace#commercial',
    proofPoint: 'Commercial OS foundations already established'
  }
]

const contactChannels: ContactChannel[] = [
  {
    label: 'Email',
    value: legalIdentity.supportEmail,
    href: 'mailto:hello@oyeimagine.com',
    supportWindow: 'Response workflow foundation via Resend-backed support operations'
  },
  {
    label: 'Phone',
    value: legalIdentity.supportPhone,
    href: 'tel:+918988988988',
    supportWindow: 'Business support line for discovery, onboarding and client coordination'
  }
]

export function getPublicHomepageExperience() {
  return {
    legalIdentity,
    navigation: publicNavigation,
    hero: {
      eyebrow: 'Oye !magine AI Growth OS',
      title: 'The premium operating system for AI-native digital growth.',
      body:
        'A luxury-corporate growth platform that unifies strategy, execution, commercial operations and governed AI - built to replace fragmented workflows with a trusted, real operating system.',
      primaryAction: homepageActions[0],
      secondaryAction: homepageActions[1],
      tertiaryAction: homepageActions[2]
    },
    trustSignals,
    sections: homepageSections,
    actions: homepageActions
  }
}

export function getMarketplaceExperience() {
  return {
    legalIdentity,
    navigation: publicNavigation,
    headline: 'Discover governed growth capabilities, not disconnected services.',
    intro:
      'The marketplace entry surface frames Oye !magine around managed capabilities, strategic depth and operational truth so prospects understand the platform as a premium operating system.',
    categories: marketplaceCategories,
    actions: [
      { label: 'Talk to the team', href: '/contact', emphasis: 'primary' as const },
      { label: 'Client login', href: '/login/client', emphasis: 'ghost' as const }
    ]
  }
}

export function getContactExperience() {
  return {
    legalIdentity,
    headline: 'Speak with Oye !magine',
    intro:
      'Use the support and contact channels below for strategy discussions, onboarding, commercial questions or governed client support.',
    supportChannels: contactChannels,
    trustPanel: {
      legalName: legalIdentity.legalName,
      gstin: legalIdentity.gstin,
      principalAddress: legalIdentity.principalAddress
    }
  }
}