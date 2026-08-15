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
    title: 'Give the system the business context before asking it to generate the next answer.',
    body:
      'Bring the website, catalogue, brand assets, goals, audiences, market context and commercial constraints into one governed operating context so recommendations begin with evidence rather than isolated prompts.',
    bullets: [
      'Tenant-specific brand and workspace memory',
      'Audit, competitor, research and strategy workflows with evidence boundaries',
      'Ask Oye search across the information each user is authorised to see',
      'Human review before high-impact execution',
    ],
  },
  {
    id: 'create',
    eyebrow: 'Imagine + Create',
    title: 'Turn strategy into creative, content and campaign work without losing brand context.',
    body:
      'Oye routes AI capabilities behind one product experience and keeps strategy, copy, creative assets, content plans, campaign work, versions and approvals connected to the same operating memory.',
    bullets: [
      'Provider-neutral AI routing by capability and task',
      'Creative, copy, SEO, content and campaign workflows',
      'Approvals, versions and provenance before work becomes execution-ready',
      'Private customer assets remain separated by tenant and workspace',
    ],
  },
  {
    id: 'govern',
    eyebrow: 'Approve + Launch + Learn',
    title: 'Automate the work that should move quickly. Keep authority around the actions that carry risk.',
    body:
      'Permissions, approval routing, commercial controls, reporting and evidence are part of the operating model. Publishing, spend, financial actions and external execution remain bounded by assigned authority and verified connections.',
    bullets: [
      'Role defaults plus explicit per-user allow and deny overrides',
      'Approval-bound publishing, spend and financial actions',
      'Reporting that distinguishes live, stale, disconnected and unverified data',
      'Outcome-linked learning without exposing one client’s private truth to another',
    ],
  },
]

const homepageActions: PublicAction[] = [
  { label: 'Start your workspace', href: '/signup', emphasis: 'primary' },
  { label: 'Explore the platform', href: '/platform', emphasis: 'secondary' },
  { label: 'Client sign in', href: '/login/client', emphasis: 'ghost' },
]

const marketplaceCategories: MarketplaceCategory[] = [
  {
    name: 'Growth strategy and diagnostics',
    description:
      'Structured onboarding, audits, competitor intelligence and strategy workflows for brands that need a governed growth operating system.',
    href: '/marketplace#strategy',
    proofPoint: 'Research, audit and strategy inside the same brand context',
  },
  {
    name: 'Execution and content operations',
    description:
      'SEO, content, creative, paid media, social and reporting capabilities operating under approvals, budgets and role-specific control.',
    href: '/marketplace#execution',
    proofPoint: 'Connected creative, content, campaign and reporting workflows',
  },
  {
    name: 'Commercial and managed services',
    description:
      'Commercial controls, specialist delivery and managed-growth workflows for customers that want software plus accountable human execution.',
    href: '/marketplace#commercial',
    proofPoint: 'Commercial OS, approvals and managed delivery controls',
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
      title: 'One AI-native operating system for the work behind growth.',
      body:
        'Oye !magine brings brand intelligence, research, strategy, creative, content, SEO, campaign workflows, approvals, analytics and commercial control into one governed workspace. AI can assist, automate and learn while critical publishing, spend and financial actions stay within assigned authority.',
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
    headline: 'Add specialist execution without creating a second operating system.',
    intro:
      'The Oye !magine marketplace connects strategic depth, specialist delivery and managed capabilities to the same briefs, permissions, approvals, customer boundaries and evidence already inside the platform.',
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
    headline: 'Start with the business problem. We can map the right Oye operating model from there.',
    intro:
      'Talk to the team about a product walkthrough, pilot, managed-growth engagement, enterprise deployment, integration requirement or partner model.',
    supportChannels: contactChannels,
    trustPanel: {
      legalName: legalIdentity.legalName,
      gstin: legalIdentity.gstin,
      principalAddress: legalIdentity.principalAddress,
    },
  }
}