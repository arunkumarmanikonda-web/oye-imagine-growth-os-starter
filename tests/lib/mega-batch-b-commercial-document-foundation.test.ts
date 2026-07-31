import { describe, expect, it } from 'vitest'

import {
  getAgreementIssuanceExperience,
  getCommercialDocumentAudit,
  getGstInvoiceRenderingExperience
} from '../../src/lib/recovery/commercial-document-foundation'

describe('mega batch b commercial document foundation', () => {
  it('builds agreement issuance packets under canonical issuer identity', () => {
    const experience = getAgreementIssuanceExperience()

    expect(experience.legalIdentity.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.legalIdentity.gstin).toBe('09AAECO6856D1Z8')
    expect(experience.counts.total).toBe(2)
    expect(experience.counts.draft).toBe(1)
    expect(experience.counts.issued).toBe(1)
    expect(experience.agreements.every((agreement) => agreement.signingProvider === 'operator-esign')).toBe(true)
  })

  it('renders issued GST invoice values and issuer compliance identity', () => {
    const invoice = getGstInvoiceRenderingExperience('inv-neejee-001')

    expect(invoice.invoiceNumber).toBe('OI-2026-001')
    expect(invoice.taxation.gstAmountInr).toBe(18000)
    expect(invoice.amounts.totalInr).toBe(118000)
    expect(invoice.issuer.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(invoice.issuer.gstin).toBe('09AAECO6856D1Z8')
    expect(invoice.issuer.supportEmail).toBe('hello@oyeimagine.com')
  })

  it('keeps draft invoice rendering available for pre-issuance review', () => {
    const invoice = getGstInvoiceRenderingExperience('inv-neejee-002')

    expect(invoice.status).toBe('draft')
    expect(invoice.amounts.subtotalInr).toBe(50000)
    expect(invoice.taxation.gstAmountInr).toBe(9000)
    expect(invoice.amounts.totalInr).toBe(59000)
  })

  it('produces a commercial document audit that reconciles agreements and invoices', () => {
    const audit = getCommercialDocumentAudit()

    expect(audit.agreementIssuanceCounts.total).toBe(2)
    expect(audit.issuedInvoiceNumber).toBe('OI-2026-001')
    expect(audit.draftInvoiceNumber).toBe('OI-2026-002')
    expect(audit.issuedInvoiceTotalInr).toBe(118000)
    expect(audit.draftInvoiceTotalInr).toBe(59000)
  })
})