export type Cta = {
  label: string
  href: string
  emphasis: 'primary' | 'secondary' | 'utility'
}

export type Section = {
  id: string
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  ctas?: Cta[]
}

export const homepageHero: Section = {
  id: 'home-hero',
  eyebrow: 'AI-native growth operating system',
  title: 'Premium strategy, execution, reporting and commercial control in one governed platform.',
  body:
    'Oye !magine is being rebuilt as a premium operating layer for brands that need clarity, speed, accountability and real commercial control.',
  bullets: [
    'Separate public, client and operator experience paths',
    'Central legal identity, support trust and governed content control',
    'Foundational platform spine for strategy, delivery and reporting',
  ],
  ctas: [
    { label: 'Explore marketplace', href: '/marketplace', emphasis: 'primary' },
    { label: 'Client access', href: '/login/client', emphasis: 'secondary' },
    { label: 'Contact Oye !magine', href: '/contact', emphasis: 'utility' },
  ],
}

export const homepageSections: Section[] = [
  {
    id: 'home-value',
    eyebrow: 'Built for clarity',
    title: 'One command layer for growth planning, delivery governance and financial visibility.',
    body:
      'Replace scattered tools and mixed-role pages with one premium growth system designed for trust, execution clarity and future commercial automation.',
    bullets: [
      'Boardroom-grade positioning and premium UX',
      'Controller-backed visible UI and trust surfaces',
      'Designed for later commercial, reporting and AI expansion',
    ],
  },
  {
    id: 'home-trust',
    eyebrow: 'Trust architecture',
    title: 'Visible company identity, support channels and governed publishing from day one.',
    body:
      'The visible platform surface is moving to centrally managed legal identity, support details and content governance instead of hardcoded prototype copy.',
    bullets: [
      'Legal entity and GST identity seeded centrally',
      'Support email and phone managed from one source',
      'Draft, publish and rollback foundation for business-facing content',
    ],
  },
]

export const loginCards = [
  {
    title: 'Client access',
    body: 'Use the client path for agreements, invoices, reports, support and service visibility.',
    href: '/login/client',
  },
  {
    title: 'Operator access',
    body: 'Use the operator path for content control, configuration and governed execution.',
    href: '/login/admin',
  },
] as const