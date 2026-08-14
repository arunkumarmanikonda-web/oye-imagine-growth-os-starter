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
  'Open admin workspace',
  'The homepage should clearly explain',
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
  domain: 'oyeimagine.com',
}

const publicNavigation = [
  { label: 'Platform', href: '/platform' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Trust', href: '/trust' },
]

const trustSignals: PublicTrustSignal[] = [
  { label: 'Legal entity', value: legalIdentity.legalName },
  { label: 'GSTIN', value: legalIdentity.gstin },
  { label: 'Support', value: legalIdentity.supportEmail },
  { label: 'Location', value: 'Noida NCR, India' },
]

const homepageSections: PublicSection[] = [
  {
    id: 'understand',
    eyebrow: 'Understand',
    title: 'Build one governed view of the brand before generating the next campaign.',
    body:
      'Bring brand context, digital diagnostics, goals, audiences and commercial constraints into one operating layer so strategy starts from known facts rather than disconnected prompts.',
    bullets: [
      'Brand and workspace context designed to remain tenant-specific',
      'Audit, competitor and strategy workflows with explicit evidence boundaries',
      'Human review before high-impact execution steps',
    ],
  },
  {
    id: 'create',
    eyebrow: 'Imagine + Create',
    title: 'Turn strategy into structured creative and campaign work without locking the system to one AI provider.',
    body:
      'Oye !magine is being built around provider-neutral AI routing, reusable brand context, creative generation, page systems and channel-ready campaign packages rather than a single-model prompt wrapper.',
    bullets: [
      'Creative, copy and campaign workflows designed around provider-neutral routing',
      'Approvals, versioning and provenance before content becomes publishing-ready',
      'Client-specific assets remain separated from Oye !magine brand assets',
    ],
  },
  {
    id: 'govern',
    eyebrow: 'Approve + Learn',
    title: 'Keep humans, budgets and evidence in the loop as the operating system becomes more autonomous.',
    body:
      'Commercial controls, reporting, approvals and auditability are treated as part of the product architecture. External-channel execution is only presented as live after the relevant provider connection and execution evidence are verified.',
    bullets: [
      'Controlled autonomy instead of silent publishing or spend escalation',
      'Reporting designed to distinguish live, stale, disconnected and unverified data',
      'Commercial and marketplace workflows developed around traceable approval states',
    ],
  },
]

const homepageActions: PublicAction[] = [
  { label: 'Book a live walkthrough', href: '/contact', emphasis: 'primary' },
  { label: 'Explore the platform', href: '/platform', emphasis: 'secondary' },
  { label: 'Client sign in', href: '/login/client', emphasis: 'ghost' },
]

const marketplaceCategories: MarketplaceCategory[] = [
  {
    name: 'Growth strategy and diagnostics',
    description:
      'Structured onboarding, audits, competitor intelligence and strategy workflows for brands that need a governed growth operating system.',
    href: '/marketplace#strategy',
    proofPoint: 'Strategy, audit and page-system foundations',
  },
  {
    name: 'Execution and content operations',
    description:
      'SEO, content, creative, paid media, social and reporting capabilities designed to operate under approvals, budgets and role-specific control.',
    href: '/marketplace#execution',
    proofPoint: 'Execution foundations across SEO, paid, social and lifecycle operations',
  },
  {
    name: 'Commercial and managed services',
    description:
      'Commercial, support and managed-service workflows designed for premium B2B delivery and operator visibility.',
    href: '/marketplace#commercial',
    proofPoint: 'Commercial OS foundations with production hardening in progress',
  },
]

const contactChannels: ContactChannel[] = [
  {
    label: 'Email',
    value: legalIdentity.supportEmail,
    href: 'mailto:hello@oyeimagine.com',
    supportWindow: 'For product walkthroughs, onboarding, commercial questions and support',
  },
  {
    label: 'Phone',
    value: legalIdentity.supportPhone,
    href: 'tel:+918988988988',
    supportWindow: 'Business support line for discovery, onboarding and client coordination',
  },
]

export function getPublicHomepageExperience() {
  return {
    legalIdentity,
    navigation: publicNavigation,
    hero: {
      eyebrow: 'Oye !magine AI Growth OS',
      title: 'Your growth operation. One intelligent system.',
      body:
        'Connect brand intelligence, strategy, creative workflows, approvals, campaign operations, analytics and commercial governance around one controlled growth loop.',
      primaryAction: homepageActions[0],
      secondaryAction: homepageActions[1],
      tertiaryAction: homepageActions[2],
    },
    trustSignals,
    sections: homepageSections,
    actions: homepageActions,
    growthLoop: ['Understand', 'Imagine', 'Create', 'Approve', 'Launch', 'Learn', 'Grow'],
  }
}

export function getMarketplaceExperience() {
  return {
    legalIdentity,
    navigation: publicNavigation,
    headline: 'Discover governed growth capabilities, not disconnected services.',
    intro:
      'The Oye !magine marketplace is designed to connect strategic depth, specialist delivery and managed capabilities to the same operating system rather than sending clients into a separate service directory.',
    categories: marketplaceCategories,
    actions: [
      { label: 'Talk to the team', href: '/contact', emphasis: 'primary' as const },
      { label: 'Client sign in', href: '/login/client', emphasis: 'ghost' as const },
    ],
  }
}

export function getContactExperience() {
  return {
    legalIdentity,
    headline: 'See Oye !magine around your own growth operation.',
    intro:
      'Talk to the team about a product walkthrough, pilot, managed-growth engagement or enterprise deployment.',
    supportChannels: contactChannels,
    trustPanel: {
      legalName: legalIdentity.legalName,
      gstin: legalIdentity.gstin,
      principalAddress: legalIdentity.principalAddress,
    },
  }
}
