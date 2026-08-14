export const neejeeBrandTruth = {
  source: {
    observedAt: '2026-08-14',
    website: 'https://www.neejee.com',
    about: 'https://www.neejee.com/about',
    sellerApplication: 'https://www.neejee.com/sell/apply',
  },
  identity: {
    brandName: 'NEEJEE',
    displayName: 'Neejee',
    tagline: 'Found. Personal.',
    website: 'https://www.neejee.com',
  },
  business: {
    model:
      'Founder-curated discovery and commerce platform for authentic craft and living traditions, connecting shoppers with named makers, regions, techniques and distinctive products.',
    primaryMarket: 'India',
    categoryPositioning:
      'Category-flexible craft commerce spanning textiles and sarees, jewellery and accessories, home and craft objects, art and decor, gifting and other provenance-led artisan products.',
    differentiation: [
      'Founder-led curation rather than anonymous mass-market assortment',
      'Maker, region and technique provenance as part of product discovery',
      'Authenticity and fair-to-maker positioning',
      'Editorial craft storytelling alongside commerce',
      'Limited edits and drops rather than undifferentiated catalogue volume',
      'AI-assisted discovery and visualisation built into the shopping journey',
    ],
  },
  experience: {
    ai: [
      { name: 'Mirror', purpose: 'Visualise wearable products such as sarees on the shopper' },
      { name: 'Space', purpose: 'Visualise home and craft objects such as stoneware in the shopper environment' },
      { name: 'Concierge', purpose: 'Assist product and gift discovery through conversational guidance' },
    ],
    sellerOnboarding:
      'Seller application includes contact details, business details, document/KYC evidence, validation and OTP-based verification before review.',
  },
  audience: [
    'Design-conscious shoppers seeking authentic, distinctive Indian craft and provenance',
    'Customers looking for sarees, textiles, jewellery, accessories, home objects and meaningful gifts',
    'Shoppers who value maker stories, region, technique, authenticity and curation over anonymous catalogue volume',
    'Returning collectors and discovery-led customers interested in limited edits, new arrivals and craft stories',
  ],
  growth: {
    objectives: [
      'Increase qualified ecommerce traffic',
      'Improve product and craft discovery',
      'Grow add-to-cart and completed purchases',
      'Grow revenue with disciplined customer acquisition efficiency',
      'Increase repeat engagement through founder edits, new arrivals, journal and email subscription',
      'Expand supply responsibly through verified seller and artisan onboarding',
    ],
    primaryMetrics: [
      'Purchases',
      'Revenue',
      'Conversion rate',
      'ROAS',
      'CPA',
      'Add-to-cart rate',
      'Product view-to-purchase rate',
      'Repeat purchase rate',
      'Email subscription conversion',
    ],
    channelIntent: {
      seo: 'Capture high-intent product, craft, technique, region and care/discovery searches with provenance-rich content.',
      googleAds: 'Capture purchase and product-discovery intent without inventing medical, local-service or consultation demand.',
      metaAds: 'Drive visual discovery, collection storytelling, retargeting and commerce conversion.',
      lifecycle: 'Use new arrivals, limited edits, craft stories and relevant product discovery to deepen repeat engagement.',
    },
  },
  content: {
    themes: [
      'maker provenance',
      'craft technique',
      'region and origin',
      'material and authenticity',
      'care and longevity',
      'founder curation',
      'limited discoveries and new arrivals',
      'gift discovery',
      'AI-assisted try-on and home visualisation',
    ],
    voice:
      'Quiet, editorial, provenance-led and personal. Product value should be explained through craft, maker, place, technique, material and discovery rather than generic discount-led marketplace language.',
  },
  prohibitedDefaultDomainTerms: [
    'healthcare',
    'clinic',
    'clinics',
    'patient',
    'patients',
    'treatment',
    'treatments',
    'consultation',
    'consultations',
    'specialist care',
    'booked consultation',
    'care journey',
  ],
  refreshablePublicClaims: {
    note:
      'These website claims are observations, not immutable campaign defaults. Refresh from Neejee.com before external publication.',
    observedAt: '2026-08-14',
    claims: [
      'Authenticity guaranteed / founder-verified craft',
      'Free shipping above a stated order threshold across India',
      'Seven-day returns displayed on the homepage',
      'Fair-to-maker / direct artisan payout positioning',
      'Founder-led limited edit and new-arrival merchandising',
    ],
  },
} as const

export type NeejeeBrandTruth = typeof neejeeBrandTruth

type LooseBrandContext = Record<string, unknown>

export function isNeejeeContext(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as LooseBrandContext
  const candidates = [
    record.id,
    record.pilotId,
    record.brandName,
    record.companyName,
    record.website,
  ]
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().toLowerCase())

  return candidates.some(
    (item) =>
      item === 'neejee' ||
      item === 'neejee-pilot' ||
      item === 'https://neejee.com' ||
      item === 'https://www.neejee.com' ||
      item.includes('neejee.com'),
  )
}

export function containsNeejeeDomainContamination(value: unknown): boolean {
  const serialized = JSON.stringify(value).toLowerCase()
  return neejeeBrandTruth.prohibitedDefaultDomainTerms.some((term) =>
    serialized.includes(term.toLowerCase()),
  )
}
