export type NeejeeCanonicalTruth = {
  workspaceKey: string
  brandName: string
  legalEntityName: string
  domain: string
  cin: string
  pan: string
  tan: string
  gstin: string
  gstRegistrationType: 'Regular'
  contactEmail: string
  contactPhone: string
  addressLine: string
  cityDisplay: string
  district: string
  state: string
  postalCode: string
  country: string
}

export type NeejeePublicIdentity = {
  brandName: string
  domain: string
  contactEmail: string
  contactPhone: string
  addressDisplay: string
  legalFooter: string
}

const canonicalTruth: NeejeeCanonicalTruth = {
  workspaceKey: 'oye-imagine',
  brandName: 'Oye !magine',
  legalEntityName: 'Oye Imagine Private Limited',
  domain: 'oyeimagine.com',
  cin: 'U47190UP2025PTC220916',
  pan: 'AAECO6856D',
  tan: 'MRTO02898A',
  gstin: '09AAECO6856D1Z8',
  gstRegistrationType: 'Regular',
  contactEmail: 'hello@oyeimagine.com',
  contactPhone: '+91 8 988 988 988',
  addressLine: 'Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida / Greater Noida',
  cityDisplay: 'Noida / Greater Noida',
  district: 'Gautambuddha Nagar',
  state: 'Uttar Pradesh',
  postalCode: '201304',
  country: 'India'
}

const acceptedAliases = [
  'oye !magine',
  'oye imagine',
  'oyeimagine',
  'oye-imagine',
  'neejee'
] as const

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function normalizeNeejeeIdentityAlias(value: string | null | undefined) {
  const normalized = compactWhitespace((value ?? '').toLowerCase())
  if (!normalized) return canonicalTruth.brandName
  return acceptedAliases.includes(normalized as (typeof acceptedAliases)[number])
    ? canonicalTruth.brandName
    : canonicalTruth.brandName
}

export function getNeejeeCanonicalTruth(): NeejeeCanonicalTruth {
  return { ...canonicalTruth }
}

export function buildNeejeePublicIdentity(): NeejeePublicIdentity {
  return {
    brandName: canonicalTruth.brandName,
    domain: canonicalTruth.domain,
    contactEmail: canonicalTruth.contactEmail,
    contactPhone: canonicalTruth.contactPhone,
    addressDisplay: `${canonicalTruth.addressLine}, ${canonicalTruth.district}, ${canonicalTruth.state} ${canonicalTruth.postalCode}, ${canonicalTruth.country}`,
    legalFooter: `${canonicalTruth.legalEntityName} | CIN ${canonicalTruth.cin} | PAN ${canonicalTruth.pan} | TAN ${canonicalTruth.tan} | GSTIN ${canonicalTruth.gstin}`
  }
}

export function validateNeejeeCanonicalTruth(
  truth: NeejeeCanonicalTruth = getNeejeeCanonicalTruth()
) {
  const requiredFields: Array<keyof NeejeeCanonicalTruth> = [
    'workspaceKey',
    'brandName',
    'legalEntityName',
    'domain',
    'cin',
    'pan',
    'tan',
    'gstin',
    'gstRegistrationType',
    'contactEmail',
    'contactPhone',
    'addressLine',
    'cityDisplay',
    'district',
    'state',
    'postalCode',
    'country'
  ]

  const missingFields = requiredFields.filter((field) => {
    const value = truth[field]
    return typeof value !== 'string' || value.trim().length === 0
  })

  return {
    isValid: missingFields.length === 0,
    missingFields,
    identityFingerprint: [
      truth.workspaceKey,
      truth.domain,
      truth.cin,
      truth.pan,
      truth.tan,
      truth.gstin
    ].join('|')
  }
}

export function getNeejeeCanonicalAudit() {
  return {
    canonicalTruth: getNeejeeCanonicalTruth(),
    acceptedAliases: [...acceptedAliases],
    publicIdentity: buildNeejeePublicIdentity(),
    validation: validateNeejeeCanonicalTruth(),
    proofScope: {
      functional: 'canonical identity payload available',
      visible: 'pending visible adoption across all shells',
      data: 'canonical legal and tax identifiers fixed',
      governance: 'audit contract and validation rules available'
    }
  }
}