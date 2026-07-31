import { describe, expect, it } from 'vitest'

import {
  getClientPaymentCommitmentExperience,
  getCommercialCollectionsAudit,
  getInvoiceDispatchExperience
} from '../../src/lib/recovery/commercial-collections-foundation'

describe('mega batch b commercial collections foundation', () => {
  it('builds invoice dispatch counts and resend governance', () => {
    const experience = getInvoiceDispatchExperience()

    expect(experience.issuer.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.counts.totalInvoices).toBe(2)
    expect(experience.counts.dispatchedInvoices).toBe(1)
    expect(experience.counts.resendEvents).toBe(1)
    expect(experience.counts.draftHeldInvoices).toBe(1)
  })

  it('marks the issued invoice as dispatched and the draft invoice as review-held', () => {
    const experience = getInvoiceDispatchExperience()
    const issued = experience.items.find((item) => item.invoiceNumber === 'OI-2026-001')
    const draft = experience.items.find((item) => item.invoiceNumber === 'OI-2026-002')

    expect(issued?.dispatchCount).toBe(2)
    expect(issued?.resendCount).toBe(1)
    expect(issued?.dispatchEligible).toBe(true)

    expect(draft?.dispatchCount).toBe(0)
    expect(draft?.dispatchEligible).toBe(false)
  })

  it('builds the Neejee payment commitment dashboard', () => {
    const experience = getClientPaymentCommitmentExperience('Neejee')

    expect(experience.accountName).toBe('Neejee')
    expect(experience.summaryCards[0].value).toBe('₹68,000')
    expect(experience.summaryCards[1].value).toBe('1')
    expect(experience.summaryCards[2].value).toBe('0')
    expect(experience.summaryCards[3].value).toBe('0')
    expect(experience.commitments).toHaveLength(1)
  })

  it('returns an empty but valid payment commitment dashboard for unknown accounts', () => {
    const experience = getClientPaymentCommitmentExperience('Unknown Account')

    expect(experience.summaryCards[0].value).toBe('₹0')
    expect(experience.commitments).toHaveLength(0)
  })

  it('produces a collections audit tied to support identity and outstanding truth', () => {
    const audit = getCommercialCollectionsAudit()

    expect(audit.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(audit.gstin).toBe('09AAECO6856D1Z8')
    expect(audit.dispatchedInvoices).toBe(1)
    expect(audit.resendEvents).toBe(1)
    expect(audit.activeCommitments).toBe(1)
    expect(audit.outstandingReceivablesInr).toBe(68000)
    expect(audit.supportEmail).toBe('hello@oyeimagine.com')
    expect(audit.supportPhone).toBe('+91 8 988 988 988')
  })
})