import { describe, expect, it } from 'vitest'

import {
  getClientCommercialDashboardExperience,
  getOperatorCommercialOperationsExperience
} from '../../src/lib/recovery/commercial-operations-foundation'

describe('mega batch b commercial operations foundation', () => {
  it('builds the client commercial dashboard for Neejee', () => {
    const experience = getClientCommercialDashboardExperience('Neejee')

    expect(experience.accountName).toBe('Neejee')
    expect(experience.issuer.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.summaryCards[0].value).toBe('1')
    expect(experience.summaryCards[1].value).toBe('2')
    expect(experience.summaryCards[2].value).toBe('₹68,000')
    expect(experience.documentCards).toHaveLength(3)
  })

  it('exposes client commercial actions for agreements, invoices and billing support', () => {
    const experience = getClientCommercialDashboardExperience('Neejee')

    expect(experience.actions.map((action) => action.href)).toEqual([
      '/client/commercial/agreements',
      '/client/commercial/invoices',
      '/contact'
    ])
  })

  it('builds the operator commercial operations surface', () => {
    const experience = getOperatorCommercialOperationsExperience()

    expect(experience.issuer.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.summaryCards[0].value).toBe('2')
    expect(experience.summaryCards[1].value).toBe('2')
    expect(experience.summaryCards[2].value).toBe('₹68,000')
    expect(experience.operations.map((operation) => operation.href)).toEqual([
      '/admin/commercial/agreements',
      '/admin/commercial/invoices',
      '/admin/commercial/ledger'
    ])
  })

  it('keeps operator commercial audit and support identity available', () => {
    const experience = getOperatorCommercialOperationsExperience()

    expect(experience.audit.issuedInvoiceNumber).toBe('OI-2026-001')
    expect(experience.audit.draftInvoiceNumber).toBe('OI-2026-002')
    expect(experience.supportIdentity.email).toBe('hello@oyeimagine.com')
    expect(experience.supportIdentity.phone).toBe('+91 8 988 988 988')
  })

  it('returns an empty but valid client dashboard for non-mapped accounts', () => {
    const experience = getClientCommercialDashboardExperience('Unknown Account')

    expect(experience.documentCards).toHaveLength(0)
    expect(experience.summaryCards[0].value).toBe('0')
    expect(experience.summaryCards[1].value).toBe('0')
    expect(experience.summaryCards[2].value).toBe('₹0')
  })
})