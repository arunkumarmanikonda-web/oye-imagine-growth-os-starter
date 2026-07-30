import { describe, expect, it } from 'vitest'
import {
  buildLedgerSnapshot,
  createInvoiceDeliveryPlan,
  getAdminCommercialInvoicingExperience,
} from '@/lib/recovery/commercial-invoicing-foundation'

describe('foundation-commercial-invoice-delivery-ledger', () => {
  it('creates a resend-backed invoice delivery plan with portal routing', () => {
    const plan = createInvoiceDeliveryPlan({
      clientLegalName: 'Neejee Retail Private Limited',
      clientPrimaryContactEmail: 'finance@neejee.example',
      requestedLanes: ['growth_strategy'],
      invoiceSequence: 7,
    })

    expect(plan.provider).toBe('resend_ready')
    expect(plan.channels).toContain('email_via_resend')
    expect(plan.portalRoute).toContain('INV-2026-0007')
  })

  it('builds ledger truth from opening balance, invoice amount and payments', () => {
    const ledger = buildLedgerSnapshot({
      clientLegalName: 'Neejee Retail Private Limited',
      requestedLanes: ['growth_strategy', 'performance_marketing'],
      baseFeeInr: 100000,
      invoiceSequence: 11,
      openingBalanceInr: 10000,
      receivedPaymentInr: 30000,
    })

    expect(ledger.entries.length).toBe(3)
    expect(ledger.outstandingBalanceInr).toBe(98000)
    expect(ledger.summary.deliveryChannel).toBe('email_via_resend')
  })

  it('exposes a stable admin invoicing experience', () => {
    const experience = getAdminCommercialInvoicingExperience()

    expect(experience.workflowCards.length).toBe(3)
    expect(experience.sampleInvoice.taxSummary.totalInr).toBeGreaterThan(0)
    expect(experience.ledger.outstandingBalanceInr).toBeGreaterThan(0)
  })
})