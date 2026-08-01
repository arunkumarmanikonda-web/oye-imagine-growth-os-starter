import { describe, expect, it } from 'vitest'
import {
  buildNeejeePublicIdentity,
  getNeejeeCanonicalAudit,
  getNeejeeCanonicalTruth,
  normalizeNeejeeIdentityAlias,
  validateNeejeeCanonicalTruth
} from '../../src/lib/recovery/neejee-canonical-truth-foundation'

describe('mega batch a neejee canonical truth closure foundation', () => {
  it('normalizes all accepted aliases back to the canonical brand', () => {
    expect(normalizeNeejeeIdentityAlias('Oye Imagine')).toBe('Oye !magine')
    expect(normalizeNeejeeIdentityAlias('oyeimagine')).toBe('Oye !magine')
    expect(normalizeNeejeeIdentityAlias('neejee')).toBe('Oye !magine')
  })

  it('returns the exact canonical legal and tax truth', () => {
    expect(getNeejeeCanonicalTruth()).toMatchObject({
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
      contactPhone: '+91 8 988 988 988'
    })
  })

  it('builds a public identity payload with a legal footer', () => {
    const identity = buildNeejeePublicIdentity()

    expect(identity.brandName).toBe('Oye !magine')
    expect(identity.domain).toBe('oyeimagine.com')
    expect(identity.legalFooter).toContain('Oye Imagine Private Limited')
    expect(identity.legalFooter).toContain('CIN U47190UP2025PTC220916')
    expect(identity.legalFooter).toContain('GSTIN 09AAECO6856D1Z8')
    expect(identity.addressDisplay).toContain('Gautambuddha Nagar')
  })

  it('validates the canonical truth and publishes a stable identity fingerprint', () => {
    const validation = validateNeejeeCanonicalTruth()

    expect(validation.isValid).toBe(true)
    expect(validation.missingFields).toEqual([])
    expect(validation.identityFingerprint).toBe(
      'oye-imagine|oyeimagine.com|U47190UP2025PTC220916|AAECO6856D|MRTO02898A|09AAECO6856D1Z8'
    )
  })

  it('detects missing required fields in mutated payloads', () => {
    const invalid = validateNeejeeCanonicalTruth({
      ...getNeejeeCanonicalTruth(),
      contactEmail: '',
      contactPhone: ''
    })

    expect(invalid.isValid).toBe(false)
    expect(invalid.missingFields).toEqual(['contactEmail', 'contactPhone'])
  })

  it('publishes an audit contract aligned to proof gaps', () => {
    const audit = getNeejeeCanonicalAudit()

    expect(audit.acceptedAliases).toContain('neejee')
    expect(audit.publicIdentity.legalFooter).toContain('PAN AAECO6856D')
    expect(audit.proofScope).toEqual({
      functional: 'canonical identity payload available',
      visible: 'pending visible adoption across all shells',
      data: 'canonical legal and tax identifiers fixed',
      governance: 'audit contract and validation rules available'
    })
  })
})