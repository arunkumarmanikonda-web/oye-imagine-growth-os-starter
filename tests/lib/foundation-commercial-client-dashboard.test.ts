import { describe, expect, it } from 'vitest'
import { buildClientCommercialDashboard } from '@/lib/recovery/commercial-dashboard-foundation'

describe('foundation-commercial-client-dashboard', () => {
  it('builds a client commercial dashboard with agreement invoice ledger and support continuity', () => {
    const dashboard = buildClientCommercialDashboard({
      clientLegalName: 'Neejee Retail Private Limited',
      requestedLanes: ['growth_strategy', 'performance_marketing'],
      billingModel: 'monthly_retainer',
      baseFeeInr: 100000,
      paymentTerm: 'net_15',
      invoiceSequence: 31,
      openingBalanceInr: 10000,
      receivedPaymentInr: 30000,
    })

    expect(dashboard.agreementSummary.agreementId).toContain('agreement_')
    expect(dashboard.invoiceSummary.invoiceNumber).toBe('INV-2026-0031')
    expect(dashboard.ledgerSummary.outstandingBalanceInr).toBe(98000)
    expect(dashboard.supportSummary.activeThreadCount).toBe(2)
    expect(dashboard.actionCenter.length).toBe(3)
  })

  it('keeps continuity timeline populated for client-facing commercial visibility', () => {
    const dashboard = buildClientCommercialDashboard({
      clientLegalName: 'Prospective client',
      requestedLanes: ['growth_strategy'],
      invoiceSequence: 5,
    })

    expect(dashboard.continuityTimeline.length).toBe(3)
  })
})