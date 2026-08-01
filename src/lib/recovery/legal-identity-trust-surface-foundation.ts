export type TrustSurface = 'public' | 'client' | 'operator'

export type LegalIdentityFoundation = {
  brandName: string
  legalEntityName: string
  domain: string
  cin: string
  pan: string
  tan: string
  gstin: string
  gstRegistrationType: 'Regular'
  supportEmail: string
  supportPhone: string
  registeredAddress: string
  district: string
  state: string
  postalCode: string
  country: string
}

export type TrustSurfacePayload = {
  surface: TrustSurface
  heading: string
  legalLine: string
  taxLine: string
  contactLine: string
  addressLine: string
  disclaimer: string
  proofTags: string[]
}

const canonicalLegalIdentity: LegalIdentityFoundation = {
  brandName: 'Oye !magine',
  legalEntityName: 'Oye Imagine Private Limited',
  domain: 'oyeimagine.com',
  cin: 'U47190UP2025PTC220916',
  pan: 'AAECO6856D',
  tan: 'MRTO02898A',
  gstin: '09AAECO6856D1Z8',
  gstRegistrationType: 'Regular',
  supportEmail: 'hello@oyeimagine.com',
  supportPhone: '+91 8 988 988 988',
  registeredAddress: 'Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida / Greater Noida',
  district: 'Gautambuddha Nagar',
  state: 'Uttar Pradesh',
  postalCode: '201304',
  country: 'India'
}

function buildLegalLine(identity: LegalIdentityFoundation) {
  return `${identity.legalEntityName} | CIN ${identity.cin}`
}

function buildTaxLine(identity: LegalIdentityFoundation) {
  return `PAN ${identity.pan} | TAN ${identity.tan} | GSTIN ${identity.gstin} (${identity.gstRegistrationType})`
}

function buildContactLine(identity: LegalIdentityFoundation) {
  return `${identity.supportEmail} | ${identity.supportPhone} | ${identity.domain}`
}

function buildAddressLine(identity: LegalIdentityFoundation) {
  return `${identity.registeredAddress}, ${identity.district}, ${identity.state} ${identity.postalCode}, ${identity.country}`
}

export function getLegalIdentityFoundation(): LegalIdentityFoundation {
  return { ...canonicalLegalIdentity }
}

export function buildTrustSurfacePayload(surface: TrustSurface): TrustSurfacePayload {
  const identity = getLegalIdentityFoundation()

  const headings: Record<TrustSurface, string> = {
    public: 'Trusted public identity',
    client: 'Client workspace identity and billing trust',
    operator: 'Operator governance and legal trust'
  }

  const disclaimers: Record<TrustSurface, string> = {
    public: 'Public-facing trust block must show canonical brand, entity and support identity.',
    client: 'Client-facing trust block must align commercial, billing and support identity.',
    operator: 'Operator-facing trust block must preserve governance, approval and legal accountability identity.'
  }

  const proofTags: Record<TrustSurface, string[]> = {
    public: ['brand', 'legal', 'contact'],
    client: ['billing', 'legal', 'support'],
    operator: ['governance', 'legal', 'audit']
  }

  return {
    surface,
    heading: headings[surface],
    legalLine: buildLegalLine(identity),
    taxLine: buildTaxLine(identity),
    contactLine: buildContactLine(identity),
    addressLine: buildAddressLine(identity),
    disclaimer: disclaimers[surface],
    proofTags: proofTags[surface]
  }
}

export function getAllTrustSurfacePayloads() {
  return {
    public: buildTrustSurfacePayload('public'),
    client: buildTrustSurfacePayload('client'),
    operator: buildTrustSurfacePayload('operator')
  }
}

export function getLegalIdentityTrustAudit() {
  return {
    identity: getLegalIdentityFoundation(),
    surfaces: getAllTrustSurfacePayloads(),
    proofScope: {
      functional: 'surface-aware legal identity payload available',
      visible: 'pending adoption in actual layouts',
      data: 'canonical legal, tax and support data fixed',
      governance: 'operator trust and audit language available'
    }
  }
}