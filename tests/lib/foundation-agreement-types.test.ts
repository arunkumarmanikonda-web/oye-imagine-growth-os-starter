import { describe, expect, it } from 'vitest'
import { AGREEMENT_KINDS, AGREEMENT_PARTY_ROLES, AGREEMENT_SIGNING_MODES, AGREEMENT_STATUSES } from '../../src/lib/agreements/agreement-types'

describe('agreement-types', () => {
  it('exposes the supported agreement kinds', () => {
    expect(AGREEMENT_KINDS).toEqual([
      'proposal',
      'service_agreement',
      'scope_addendum',
      'invoice_attachment',
      'renewal_extension',
    ])
  })

  it('exposes lifecycle statuses and signing modes', () => {
    expect(AGREEMENT_STATUSES).toContain('signed')
    expect(AGREEMENT_SIGNING_MODES).toContain('hybrid')
    expect(AGREEMENT_PARTY_ROLES).toContain('signatory')
  })
})