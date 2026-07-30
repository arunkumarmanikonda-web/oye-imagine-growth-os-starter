export const INVOICE_KINDS = [
  'tax_invoice',
  'proforma_invoice',
  'credit_note',
] as const

export type InvoiceKind = (typeof INVOICE_KINDS)[number]

export const INVOICE_STATUSES = [
  'draft',
  'approved',
  'issued',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled',
  'void',
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export type GstMode = 'intra_state' | 'inter_state'

export interface InvoiceParty {
  legalName: string
  email: string
  gstin?: string
  stateCode?: string
  contactName?: string
  addressLine?: string
}

export interface InvoiceLineItem {
  id: string
  label: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxable: boolean
  gstRate: number
  hsnSac: string
}

export interface GstBreakdown {
  mode: GstMode
  taxableAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalTaxAmount: number
}

export interface InvoicePaymentSnapshot {
  receivedAmount: number
  balanceAmount: number
  lastPaymentAt?: string
}

export interface InvoiceRecord {
  id: string
  invoiceNumber: string
  title: string
  kind: InvoiceKind
  status: InvoiceStatus
  workspaceKey: string
  currency: string
  createdAt: string
  updatedAt: string
  issueDate: string
  dueDate: string
  createdBy: string
  lastUpdatedBy: string
  sourceAgreementId?: string
  sourceAgreementNumber?: string
  vendor: InvoiceParty
  billedTo: InvoiceParty
  lineItems: InvoiceLineItem[]
  subtotalAmount: number
  gstBreakdown: GstBreakdown
  taxAmount: number
  totalAmount: number
  payment: InvoicePaymentSnapshot
  notes: string[]
  tags: string[]
}

export interface InvoiceReadiness {
  issueReady: boolean
  paymentReady: boolean
  missing: string[]
}

export interface InvoiceSummaryCard {
  id: string
  invoiceNumber: string
  title: string
  kind: InvoiceKind
  status: InvoiceStatus
  workspaceKey: string
  clientName: string
  totalAmount: number
  balanceAmount: number
  gstMode: GstMode
  sourceAgreementNumber?: string
  readiness: InvoiceReadiness
}

export interface InvoiceRegistrySummary {
  total: number
  issuedValue: number
  outstandingValue: number
  overdueCount: number
  byStatus: Record<InvoiceStatus, number>
  byKind: Record<InvoiceKind, number>
}