import { describe, expect, it } from 'vitest'

import { getMegaBatchBClosureAudit } from '../../src/lib/recovery/mega-batch-b-closure-audit'

describe('mega batch b closure audit', () => {
  it('proves canonical legal and tax identity across commercial surfaces', () => {
    const audit = getMegaBatchBClosureAudit()

    expect(audit.legalIdentity.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(audit.legalIdentity.gstin).toBe('09AAECO6856D1Z8')
    expect(audit.legalIdentity.cin).toBe('U47190UP2025PTC220916')
    expect(audit.legalIdentity.pan).toBe('AAECO6856D')
    expect(audit.legalIdentity.tan).toBe('MRTO02898A')
  })

  it('proves agreement, invoice and ledger foundation counts', () => {
    const audit = getMegaBatchBClosureAudit()

    expect(audit.foundation.agreementCount).toBe(2)
    expect(audit.foundation.invoiceCount).toBe(2)
    expect(audit.foundation.ledgerEntryCount).toBe(2)
    expect(audit.foundation.outstandingReceivablesInr).toBe(68000)
  })

  it('proves agreement issuance and invoice rendering are governed', () => {
    const audit = getMegaBatchBClosureAudit()

    expect(audit.agreementIssuance.total).toBe(2)
    expect(audit.agreementIssuance.draft).toBe(1)
    expect(audit.agreementIssuance.issued).toBe(1)
    expect(audit.agreementIssuance.signingProviders.every((provider) => provider === 'operator-esign')).toBe(true)

    expect(audit.invoiceRendering.issuedInvoiceNumber).toBe('OI-2026-001')
    expect(audit.invoiceRendering.issuedInvoiceTotalInr).toBe(118000)
    expect(audit.invoiceRendering.draftInvoiceNumber).toBe('OI-2026-002')
    expect(audit.invoiceRendering.draftInvoiceTotalInr).toBe(59000)
    expect(audit.invoiceRendering.supportEmail).toBe('hello@oyeimagine.com')
  })

  it('proves the client commercial dashboard contract', () => {
    const audit = getMegaBatchBClosureAudit()

    expect(audit.clientCommercial.accountName).toBe('Neejee')
    expect(audit.clientCommercial.summaryValues).toEqual(['1', '2', '₹68,000', '2'])
    expect(audit.clientCommercial.actionPaths).toEqual([
      '/client/commercial/agreements',
      '/client/commercial/invoices',
      '/contact'
    ])
    expect(audit.clientCommercial.documentCount).toBe(3)
  })

  it('proves the operator commercial operations contract', () => {
    const audit = getMegaBatchBClosureAudit()

    expect(audit.operatorCommercial.summaryValues).toEqual(['2', '2', '₹68,000', '2'])
    expect(audit.operatorCommercial.operationPaths).toEqual([
      '/admin/commercial/agreements',
      '/admin/commercial/invoices',
      '/admin/commercial/ledger'
    ])
    expect(audit.operatorCommercial.providerInvoiceNumbers).toEqual(['OI-2026-001', 'OI-2026-002'])
    expect(audit.operatorCommercial.supportIdentity.email).toBe('hello@oyeimagine.com')
    expect(audit.operatorCommercial.supportIdentity.phone).toBe('+91 8 988 988 988')
  })

  it('proves invoice follow-up and agreement activation governance', () => {
    const audit = getMegaBatchBClosureAudit()

    expect(audit.fulfillment.resendEligibleCount).toBe(1)
    expect(audit.fulfillment.paymentFollowUpEligibleCount).toBe(1)
    expect(audit.fulfillment.blockedAgreementCount).toBe(1)
    expect(audit.fulfillment.readyForInvoiceCount).toBe(0)
    expect(audit.fulfillment.alreadyInvoicedAgreementCount).toBe(1)
    expect(audit.fulfillment.outstandingReceivablesInr).toBe(68000)
  })
})