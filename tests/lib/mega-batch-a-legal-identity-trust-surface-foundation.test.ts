import { describe, expect, it } from 'vitest'
import {
  buildTrustSurfacePayload,
  getAllTrustSurfacePayloads,
  getLegalIdentityFoundation,
  getLegalIdentityTrustAudit
} from '../../src/lib/recovery/legal-identity-trust-surface-foundation'

describe('mega batch a legal identity trust surface foundation', () => {
  it('returns the canonical legal identity truth', () => {
    expect(getLegalIdentityFoundation()).toMatchObject({
      brandName: 'Oye !magine',
      legalEntityName: 'Oye Imagine Private Limited',
      domain: 'oyeimagine.com',
      cin: 'U47190UP2025PTC220916',
      pan: 'AAECO6856D',
      tan: 'MRTO02898A',
      gstin: '09AAECO6856D1Z8'
    })
  })

  it('builds a public trust payload with full legal and tax disclosure', () => {
    const payload = buildTrustSurfacePayload('public')

    expect(payload.heading).toBe('Trusted public identity')
    expect(payload.legalLine).toContain('Oye Imagine Private Limited')
    expect(payload.legalLine).toContain('CIN U47190UP2025PTC220916')
    expect(payload.taxLine).toContain('PAN AAECO6856D')
    expect(payload.taxLine).toContain('GSTIN 09AAECO6856D1Z8')
    expect(payload.contactLine).toContain('hello@oyeimagine.com')
    expect(payload.addressLine).toContain('Gautambuddha Nagar')
    expect(payload.proofTags).toEqual(['brand', 'legal', 'contact'])
  })

  it('builds a client trust payload for billing and support identity', () => {
    const payload = buildTrustSurfacePayload('client')

    expect(payload.heading).toBe('Client workspace identity and billing trust')
    expect(payload.disclaimer).toContain('commercial')
    expect(payload.proofTags).toEqual(['billing', 'legal', 'support'])
  })

  it('builds an operator trust payload for governance identity', () => {
    const payload = buildTrustSurfacePayload('operator')

    expect(payload.heading).toBe('Operator governance and legal trust')
    expect(payload.disclaimer).toContain('governance')
    expect(payload.proofTags).toEqual(['governance', 'legal', 'audit'])
  })

  it('publishes trust payloads for all three surfaces', () => {
    const payloads = getAllTrustSurfacePayloads()

    expect(Object.keys(payloads)).toEqual(['public', 'client', 'operator'])
    expect(payloads.public.legalLine).toBe(payloads.client.legalLine)
    expect(payloads.client.taxLine).toBe(payloads.operator.taxLine)
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getLegalIdentityTrustAudit()

    expect(audit.surfaces.public.contactLine).toContain('+91 8 988 988 988')
    expect(audit.proofScope).toEqual({
      functional: 'surface-aware legal identity payload available',
      visible: 'pending adoption in actual layouts',
      data: 'canonical legal, tax and support data fixed',
      governance: 'operator trust and audit language available'
    })
  })
})