import { describe, expect, it } from 'vitest'
import { INVOICE_KINDS, INVOICE_STATUSES } from '../../src/lib/invoicing/invoice-types'

describe('invoice-types', () => {
  it('exposes supported invoice kinds', () => {
    expect(INVOICE_KINDS).toEqual(['tax_invoice', 'proforma_invoice', 'credit_note'])
  })

  it('exposes invoice lifecycle statuses', () => {
    expect(INVOICE_STATUSES).toContain('issued')
    expect(INVOICE_STATUSES).toContain('paid')
  })
})