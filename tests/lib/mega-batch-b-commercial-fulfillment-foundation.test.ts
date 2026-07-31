import { describe, expect, it } from 'vitest'

import {
  getAgreementActivationHandoffExperience,
  getCommercialFulfillmentAudit,
  getInvoiceFollowUpExperience
} from '../../src/lib/recovery/commercial-fulfillment-foundation'

describe('mega batch b commercial fulfillment foundation', () => {
  it('builds invoice resend and payment follow-up counts', () => {
    const experience = getInvoiceFollowUpExperience()

    expect(experience.issuer.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.counts.totalInvoices).toBe(2)
    expect(experience.counts.resendEligible).toBe(1)
    expect(experience.counts.paymentFollowUpEligible).toBe(1)
    expect(experience.counts.draftReviewRequired).toBe(1)
  })

  it('marks the issued invoice as resend-eligible and payment-follow-up eligible', () => {
    const experience = getInvoiceFollowUpExperience()
    const issuedInvoice = experience.items.find((item) => item.invoiceNumber === 'OI-2026-001')

    expect(issuedInvoice?.resendEligible).toBe(true)
    expect(issuedInvoice?.paymentFollowUpEligible).toBe(true)
    expect(issuedInvoice?.outstandingAmountInr).toBe(68000)
  })

  it('blocks draft agreements from invoice activation and recognises invoiced issued agreements', () => {
    const handoff = getAgreementActivationHandoffExperience()

    expect(handoff.counts.total).toBe(2)
    expect(handoff.counts.blocked).toBe(1)
    expect(handoff.counts.readyForInvoice).toBe(0)
    expect(handoff.counts.alreadyInvoiced).toBe(1)

    const blocked = handoff.handoffs.find((item) => item.accountName === 'Marketplace Prospect')
    const invoiced = handoff.handoffs.find((item) => item.accountName === 'Neejee')

    expect(blocked?.handoffState).toBe('blocked')
    expect(invoiced?.handoffState).toBe('already_invoiced')
    expect(invoiced?.targetInvoiceNumber).toBe('OI-2026-001')
  })

  it('produces a fulfillment audit tied to canonical support and invoice truth', () => {
    const audit = getCommercialFulfillmentAudit()

    expect(audit.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(audit.gstin).toBe('09AAECO6856D1Z8')
    expect(audit.outstandingReceivablesInr).toBe(68000)
    expect(audit.resendEligibleCount).toBe(1)
    expect(audit.paymentFollowUpEligibleCount).toBe(1)
    expect(audit.blockedAgreementCount).toBe(1)
    expect(audit.alreadyInvoicedAgreementCount).toBe(1)
    expect(audit.issuedInvoiceSupportEmail).toBe('hello@oyeimagine.com')
  })

  it('keeps support identity bound to commercial follow-up governance', () => {
    const experience = getInvoiceFollowUpExperience()

    expect(experience.issuer.supportEmail).toBe('hello@oyeimagine.com')
    expect(experience.issuer.supportPhone).toBe('+91 8 988 988 988')
  })
})