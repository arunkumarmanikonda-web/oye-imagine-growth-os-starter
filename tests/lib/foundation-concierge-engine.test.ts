import { describe, expect, it } from 'vitest'
import { buildAiConciergeResponse, inferAiConciergeIntent } from '../../src/lib/ai/concierge-engine'

describe('concierge-engine', () => {
  it('infers billing intent from finance language', () => {
    expect(inferAiConciergeIntent('Show my outstanding invoices and GST summary')).toBe('billing_overview')
    expect(inferAiConciergeIntent('Who needs payment follow-up first')).toBe('payment_followup')
    expect(inferAiConciergeIntent('Which agreements need signature')).toBe('agreement_status')
  })

  it('builds a billing-focused concierge response for neejee', () => {
    const response = buildAiConciergeResponse({
      workspaceKey: 'neejee',
      surface: 'client',
      message: 'Show my outstanding invoices and next actions',
      referenceDate: '2026-08-05T00:00:00.000Z',
    })

    expect(response.intent).toBe('billing_overview')
    expect(response.context.workspaceKey).toBe('neejee')
    expect(response.context.invoiceCount).toBe(2)
    expect(response.context.outstandingAmount).toBe(224200)
    expect(response.actions.some((action) => action.href === '/client/finance')).toBe(true)
    expect(response.insights.length).toBeGreaterThanOrEqual(2)
  })

  it('builds a payment follow-up response for rocketboys', () => {
    const response = buildAiConciergeResponse({
      workspaceKey: 'rocketboys',
      surface: 'admin',
      message: 'Who needs payment follow-up first',
      referenceDate: '2026-08-05T00:00:00.000Z',
    })

    expect(response.intent).toBe('payment_followup')
    expect(response.context.outstandingAmount).toBe(18040)
    expect(response.context.automationJobCount).toBe(1)
    expect(response.actions.some((action) => action.href === '/admin/commercial')).toBe(true)
  })
})