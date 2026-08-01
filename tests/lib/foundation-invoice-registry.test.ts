import { describe, expect, it } from 'vitest'
import {
  INVOICE_REGISTRY,
  findInvoiceById,
  getInvoiceRegistrySummary,
  getInvoiceSummaryCards,
} from '../../src/lib/invoicing/invoice-registry'

describe('invoice-registry', () => {
  it('returns seeded invoices across billing states', () => {
    expect(INVOICE_REGISTRY.length).toBe(4)
    expect(INVOICE_REGISTRY.some((record) => record.status === 'issued')).toBe(true)
    expect(INVOICE_REGISTRY.some((record) => record.status === 'partially_paid')).toBe(true)
    expect(INVOICE_REGISTRY.some((record) => record.status === 'paid')).toBe(true)
  })

  it('builds billing summary and admin cards', () => {
    const summary = getInvoiceRegistrySummary()
    const cards = getInvoiceSummaryCards()

    expect(summary.total).toBe(4)
    expect(summary.byStatus.draft).toBe(1)
    expect(summary.byStatus.issued).toBe(1)
    expect(summary.byStatus.partially_paid).toBe(1)
    expect(summary.byStatus.paid).toBe(1)
    expect(summary.outstandingValue).toBeGreaterThan(0)
    expect(cards).toHaveLength(4)
    expect(cards[0].clientName.length).toBeGreaterThan(0)
  })

  it('keeps agreement linkage on seeded invoice records', () => {
    const invoice = findInvoiceById('invoice-neejee-1')
    expect(invoice?.sourceAgreementNumber).toBe('AGR-NEEJEE-20260730-002')
  })
})