import { describe, expect, it } from 'vitest'
import {
  applyInvoicePayment,
  buildGstBreakdown,
  buildInvoiceDraft,
  determineGstMode,
  getInvoiceReadiness,
  transitionInvoiceStatus,
} from '../../src/lib/invoicing/gst-engine'

describe('gst-engine', () => {
  it('splits GST into CGST and SGST for intra-state supply', () => {
    const breakdown = buildGstBreakdown(
      [
        {
          id: 'a',
          label: 'Service',
          description: 'Marketing service',
          quantity: 1,
          unitPrice: 10000,
          amount: 10000,
          taxable: true,
          gstRate: 18,
          hsnSac: '998361',
        },
      ],
      '09AAECO6856D1Z8',
      '09ABCDE1234F1Z5',
    )

    expect(determineGstMode('09AAECO6856D1Z8', '09ABCDE1234F1Z5')).toBe('intra_state')
    expect(breakdown.cgstAmount).toBe(900)
    expect(breakdown.sgstAmount).toBe(900)
    expect(breakdown.igstAmount).toBe(0)
    expect(breakdown.totalTaxAmount).toBe(1800)
  })

  it('routes GST to IGST for inter-state supply', () => {
    const breakdown = buildGstBreakdown(
      [
        {
          id: 'a',
          label: 'Service',
          description: 'Marketing service',
          quantity: 1,
          unitPrice: 10000,
          amount: 10000,
          taxable: true,
          gstRate: 18,
          hsnSac: '998361',
        },
      ],
      '09AAECO6856D1Z8',
      '27ABCDE1234F1Z5',
    )

    expect(determineGstMode('09AAECO6856D1Z8', '27ABCDE1234F1Z5')).toBe('inter_state')
    expect(breakdown.cgstAmount).toBe(0)
    expect(breakdown.sgstAmount).toBe(0)
    expect(breakdown.igstAmount).toBe(1800)
    expect(breakdown.totalTaxAmount).toBe(1800)
  })

  it('builds an invoice, transitions to issued, and applies payment', () => {
    const draft = buildInvoiceDraft({
      workspaceKey: 'neejee',
      clientName: 'Neejee',
      clientEmail: 'finance@neejee.com',
      clientGstin: '09ABCDE1234F1Z5',
      title: 'Neejee Tax Invoice',
      createdBy: 'finance@oyeimagine.com',
      createdAt: '2026-07-30T10:00:00.000Z',
      issueDate: '2026-07-30T10:00:00.000Z',
      sequence: 9,
      lineItems: [
        {
          id: 'service',
          label: 'Retainer',
          description: 'Monthly retainer',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
    })

    const approved = transitionInvoiceStatus(draft, 'approved', 'finance-lead@oyeimagine.com', '2026-07-30T10:30:00.000Z')
    const issued = transitionInvoiceStatus(approved, 'issued', 'finance@oyeimagine.com', '2026-07-30T11:00:00.000Z')
    const partiallyPaid = applyInvoicePayment(issued, 50000, 'collections@oyeimagine.com', '2026-07-31T09:00:00.000Z')
    const readiness = getInvoiceReadiness(issued)

    expect(issued.status).toBe('issued')
    expect(readiness.issueReady).toBe(true)
    expect(readiness.paymentReady).toBe(true)
    expect(partiallyPaid.status).toBe('partially_paid')
    expect(partiallyPaid.payment.receivedAmount).toBe(50000)
    expect(partiallyPaid.payment.balanceAmount).toBeGreaterThan(0)
  })
})