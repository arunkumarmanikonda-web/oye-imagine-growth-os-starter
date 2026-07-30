import { describe, expect, it } from 'vitest'
import {
  COMMERCIAL_DELIVERY_CHANNELS,
  COMMERCIAL_GST_RATES,
  COMMERCIAL_INVOICE_STATUSES,
  COMMERCIAL_LEDGER_ENTRY_TYPES,
} from '@/lib/recovery/commercial-invoicing-types'

describe('foundation-commercial-invoicing-types', () => {
  it('exposes invoice statuses, ledger entries, delivery channels and gst rates', () => {
    expect(COMMERCIAL_INVOICE_STATUSES).toContain('issued')
    expect(COMMERCIAL_LEDGER_ENTRY_TYPES).toContain('payment')
    expect(COMMERCIAL_DELIVERY_CHANNELS).toContain('email_via_resend')
    expect(COMMERCIAL_GST_RATES).toContain(18)
  })
})