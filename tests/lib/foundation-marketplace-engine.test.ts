import { describe, expect, it } from 'vitest'
import { buildAiMarketplaceResponse, inferAiMarketplaceIntent } from '../../src/lib/ai/marketplace-engine'

describe('marketplace-engine', () => {
  it('infers marketplace intents from user messages', () => {
    expect(inferAiMarketplaceIntent('Show marketplace help for outstanding invoices and GST reporting')).toBe('billing_optimization')
    expect(inferAiMarketplaceIntent('We need better reporting and dashboards')).toBe('reporting_visibility')
    expect(inferAiMarketplaceIntent('How do we expand after renewal')).toBe('renewal_expansion')
  })

  it('builds billing-optimized recommendations for neejee', () => {
    const response = buildAiMarketplaceResponse({
      workspaceKey: 'neejee',
      surface: 'client',
      message: 'Show the best marketplace offers for outstanding invoices and GST visibility',
      referenceDate: '2026-08-05T00:00:00.000Z',
    })

    expect(response.intent).toBe('billing_optimization')
    expect(response.context.workspaceKey).toBe('neejee')
    expect(response.context.outstandingAmount).toBe(224200)
    expect(response.recommendedOffers[0].offerId).toBe('offer-collections-stability-sprint')
    expect(response.recommendedOffers).toHaveLength(3)
    expect(response.actions.some((action) => action.href === '/client/finance')).toBe(true)
  })

  it('builds renewal expansion recommendations for clevercare', () => {
    const response = buildAiMarketplaceResponse({
      workspaceKey: 'clevercare',
      surface: 'admin',
      message: 'How do we expand after renewal and payment completion',
      referenceDate: '2026-08-05T00:00:00.000Z',
    })

    expect(response.intent).toBe('renewal_expansion')
    expect(response.context.outstandingAmount).toBe(0)
    expect(response.context.paidInvoiceCount).toBe(1)
    expect(response.recommendedOffers.some((offer) => offer.offerId === 'offer-renewal-expansion-pack')).toBe(true)
  })
})