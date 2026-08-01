import { describe, expect, it } from 'vitest'
import { buildInvoicePreview } from '@/lib/recovery/commercial-invoicing-foundation'

describe('foundation-commercial-invoice-generation', () => {
  it('builds a gst aligned invoice preview from commercial execution data', () => {
    const invoice = buildInvoicePreview({
      clientLegalName: 'Neejee Retail Private Limited',
      requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
      billingModel: 'monthly_retainer',
      baseFeeInr: 125000,
      paymentTerm: 'net_15',
      invoiceSequence: 17,
    })

    expect(invoice.invoiceNumber).toBe('INV-2026-0017')
    expect(invoice.metadata.gstin).toBe('09AAECO6856D1Z8')
    expect(invoice.taxSummary.gstRatePercent).toBe(18)
    expect(invoice.taxSummary.totalInr).toBe(invoice.taxSummary.taxableValueInr + invoice.taxSummary.gstAmountInr)
  })

  it('keeps invoice billing terms aligned to the selected payment term', () => {
    const invoice = buildInvoicePreview({
      clientLegalName: 'Prospective client',
      requestedLanes: ['growth_strategy'],
      paymentTerm: 'net_30',
      invoiceSequence: 2,
    })

    expect(invoice.billingTerms.paymentTerm).toBe('net_30')
    expect(invoice.billingTerms.dueInDays).toBe(30)
  })
})