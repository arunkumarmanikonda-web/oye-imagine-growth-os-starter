import { describe, expect, it } from 'vitest'
import { buildCollectionsAlerts, buildPaymentTimeline, getClientFinanceWorkspace } from '../../src/lib/finance/client-finance'

describe('client-finance-collections', () => {
  it('returns no collection alerts for fully paid clevercare workspace', () => {
    const workspace = getClientFinanceWorkspace('clevercare', '2026-08-01T00:00:00.000Z')

    expect(workspace.summary.invoiceCount).toBe(1)
    expect(workspace.summary.totalReceived).toBe(212400)
    expect(workspace.summary.outstandingAmount).toBe(0)
    expect(workspace.summary.paidInvoiceCount).toBe(1)
    expect(workspace.collectionsAlerts).toHaveLength(0)
  })

  it('builds a newest-first payment timeline with payment events', () => {
    const timeline = buildPaymentTimeline('rocketboys')
    const alerts = buildCollectionsAlerts('rocketboys', '2026-08-01T00:00:00.000Z')

    expect(timeline.length).toBeGreaterThanOrEqual(3)
    expect(timeline.some((entry) => entry.kind === 'payment_received')).toBe(true)
    expect(timeline[0].date >= timeline[timeline.length - 1].date).toBe(true)
    expect(alerts[0].severity).toBe('warning')
  })
})