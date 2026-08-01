export const COMMERCIAL_INVOICE_STATUSES = [
  'draft',
  'issued',
  'delivered',
  'partially_paid',
  'paid',
  'overdue',
] as const

export const COMMERCIAL_LEDGER_ENTRY_TYPES = [
  'invoice',
  'payment',
  'credit_note',
  'opening_balance',
] as const

export const COMMERCIAL_DELIVERY_CHANNELS = [
  'email_via_resend',
  'client_portal',
] as const

export const COMMERCIAL_GST_RATES = [0, 18] as const

export type CommercialInvoiceStatus = (typeof COMMERCIAL_INVOICE_STATUSES)[number]
export type CommercialLedgerEntryType = (typeof COMMERCIAL_LEDGER_ENTRY_TYPES)[number]
export type CommercialDeliveryChannel = (typeof COMMERCIAL_DELIVERY_CHANNELS)[number]
export type CommercialGstRate = (typeof COMMERCIAL_GST_RATES)[number]