import type { AgreementSummaryCard } from '../agreements/agreement-types'
import type { GstMode, InvoiceSummaryCard } from '../invoicing/invoice-types'

export const FINANCE_TIMELINE_KINDS = [
  'agreement_issued',
  'agreement_signed',
  'invoice_issued',
  'invoice_due',
  'payment_received',
] as const

export type FinanceTimelineKind = (typeof FINANCE_TIMELINE_KINDS)[number]

export const FINANCE_ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const
export type FinanceAlertSeverity = (typeof FINANCE_ALERT_SEVERITIES)[number]

export interface FinanceTimelineItem {
  id: string
  kind: FinanceTimelineKind
  title: string
  date: string
  amount?: number
  status?: string
  reference?: string
}

export interface FinanceCollectionsAlert {
  id: string
  severity: FinanceAlertSeverity
  title: string
  description: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  dueDate: string
}

export interface ClientFinanceSummary {
  workspaceKey: string
  clientName: string
  currency: string
  agreementCount: number
  invoiceCount: number
  totalInvoiced: number
  totalReceived: number
  outstandingAmount: number
  draftInvoiceCount: number
  collectionOpenCount: number
  paidInvoiceCount: number
}

export interface ClientFinanceWorkspace {
  summary: ClientFinanceSummary
  invoices: InvoiceSummaryCard[]
  agreements: AgreementSummaryCard[]
  paymentTimeline: FinanceTimelineItem[]
  collectionsAlerts: FinanceCollectionsAlert[]
  gstModes: GstMode[]
}