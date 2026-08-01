import { describe, expect, it } from 'vitest'
import { getClientFinanceWorkspace } from '../../src/lib/finance/client-finance'

describe('client-finance-workspace', () => {
  it('builds a finance workspace for neejee with linked agreements and invoices', () => {
    const workspace = getClientFinanceWorkspace('neejee', '2026-08-01T00:00:00.000Z')

    expect(workspace.summary.workspaceKey).toBe('neejee')
    expect(workspace.summary.agreementCount).toBe(2)
    expect(workspace.summary.invoiceCount).toBe(2)
    expect(workspace.summary.totalInvoiced).toBe(224200)
    expect(workspace.summary.totalReceived).toBe(0)
    expect(workspace.summary.outstandingAmount).toBe(224200)
    expect(workspace.summary.draftInvoiceCount).toBe(1)
    expect(workspace.summary.collectionOpenCount).toBe(1)
    expect(workspace.gstModes).toContain('intra_state')
    expect(workspace.collectionsAlerts).toHaveLength(1)
  })

  it('tracks partial collections for rocketboys', () => {
    const workspace = getClientFinanceWorkspace('rocketboys', '2026-08-01T00:00:00.000Z')

    expect(workspace.summary.invoiceCount).toBe(1)
    expect(workspace.summary.totalInvoiced).toBe(33040)
    expect(workspace.summary.totalReceived).toBe(15000)
    expect(workspace.summary.outstandingAmount).toBe(18040)
    expect(workspace.collectionsAlerts[0].severity).toBe('warning')
    expect(workspace.collectionsAlerts[0].invoiceNumber).toBe('INV-ROCKETBOYS-20260728-002')
  })
})