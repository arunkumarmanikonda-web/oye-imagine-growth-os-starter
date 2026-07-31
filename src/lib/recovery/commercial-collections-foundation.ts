import { organizationProfile, supportChannels } from './organization-profile'
import { commercialInvoices, ledgerEntries } from './commercial-foundation'
import { getCommercialFulfillmentAudit } from './commercial-fulfillment-foundation'

export type DispatchKind = 'initial_issue' | 'resend'
export type PaymentCommitmentStatus = 'active' | 'fulfilled' | 'broken'

export interface InvoiceDispatchLog {
  id: string
  invoiceId: string
  invoiceNumber: string
  accountName: string
  kind: DispatchKind
  channel: 'email'
  recipient: string
  dispatchedAt: string
}

export interface PaymentCommitment {
  id: string
  accountName: string
  invoiceNumber: string
  amountInr: number
  promisedDate: string
  status: PaymentCommitmentStatus
  note: string
}

export const invoiceDispatchLogs: InvoiceDispatchLog[] = [
  {
    id: 'dispatch-001',
    invoiceId: 'inv-neejee-001',
    invoiceNumber: 'OI-2026-001',
    accountName: 'Neejee',
    kind: 'initial_issue',
    channel: 'email',
    recipient: 'finance@neejee.example',
    dispatchedAt: '2026-07-25T09:00:00.000Z'
  },
  {
    id: 'dispatch-002',
    invoiceId: 'inv-neejee-001',
    invoiceNumber: 'OI-2026-001',
    accountName: 'Neejee',
    kind: 'resend',
    channel: 'email',
    recipient: 'finance@neejee.example',
    dispatchedAt: '2026-07-29T11:30:00.000Z'
  }
]

export const paymentCommitments: PaymentCommitment[] = [
  {
    id: 'commitment-001',
    accountName: 'Neejee',
    invoiceNumber: 'OI-2026-001',
    amountInr: 68000,
    promisedDate: '2026-08-05',
    status: 'active',
    note: 'Client confirmed remaining release after corrected invoice review.'
  }
]

function getSupportEmail() {
  return (
    supportChannels.find((channel) => String(channel.value).includes('@'))?.value ??
    'hello@oyeimagine.com'
  )
}

function getSupportPhone() {
  return (
    supportChannels.find((channel) => String(channel.value).includes('+91'))?.value ??
    '+91 8 988 988 988'
  )
}

function getOutstandingForAccount(accountName: string) {
  const debit = ledgerEntries
    .filter((entry) => entry.accountName === accountName && entry.direction === 'debit')
    .reduce((sum, entry) => sum + entry.amountInr, 0)

  const credit = ledgerEntries
    .filter((entry) => entry.accountName === accountName && entry.direction === 'credit')
    .reduce((sum, entry) => sum + entry.amountInr, 0)

  return debit - credit
}

export function getInvoiceDispatchExperience() {
  const items = commercialInvoices.map((invoice) => {
    const dispatches = invoiceDispatchLogs.filter((entry) => entry.invoiceId === invoice.id)

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      accountName: invoice.accountName,
      status: invoice.status,
      dispatchCount: dispatches.length,
      resendCount: dispatches.filter((entry) => entry.kind === 'resend').length,
      dispatchEligible: invoice.status === 'issued' || invoice.status === 'overdue',
      lastDispatchedAt: dispatches.length > 0 ? dispatches[dispatches.length - 1].dispatchedAt : null,
      nextAction:
        invoice.status === 'draft'
          ? 'Keep invoice in review until governed issuance is complete.'
          : dispatches.length === 0
            ? 'Send initial invoice dispatch.'
            : 'Track resend history and client acknowledgement.'
    }
  })

  return {
    title: 'Invoice dispatch governance',
    subtitle:
      'Operator-governed invoice dispatch, resend visibility, and delivery-safe commercial communication.',
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      supportEmail: String(getSupportEmail()),
      supportPhone: String(getSupportPhone())
    },
    counts: {
      totalInvoices: items.length,
      dispatchedInvoices: items.filter((item) => item.dispatchCount > 0).length,
      resendEvents: invoiceDispatchLogs.filter((entry) => entry.kind === 'resend').length,
      draftHeldInvoices: items.filter((item) => item.status === 'draft').length
    },
    items
  }
}

export function getClientPaymentCommitmentExperience(accountName: string) {
  const commitments = paymentCommitments.filter((entry) => entry.accountName === accountName)
  const outstandingReceivablesInr = getOutstandingForAccount(accountName)

  return {
    title: 'Client payment commitments',
    subtitle:
      'Client-visible commercial collection state with promised payments, receivable visibility, and governed support escalation.',
    accountName,
    issuer: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      supportEmail: String(getSupportEmail()),
      supportPhone: String(getSupportPhone())
    },
    summaryCards: [
      { label: 'Outstanding receivables', value: `₹${outstandingReceivablesInr.toLocaleString('en-IN')}` },
      { label: 'Active commitments', value: String(commitments.filter((entry) => entry.status === 'active').length) },
      { label: 'Fulfilled commitments', value: String(commitments.filter((entry) => entry.status === 'fulfilled').length) },
      { label: 'Broken commitments', value: String(commitments.filter((entry) => entry.status === 'broken').length) }
    ],
    actions: [
      { label: 'Confirm payment date', href: '/client/commercial/payments' },
      { label: 'Upload remittance advice', href: '/client/commercial/payments/remittance' },
      { label: 'Contact billing support', href: '/contact' }
    ],
    commitments
  }
}

export function getCommercialCollectionsAudit() {
  const dispatch = getInvoiceDispatchExperience()
  const clientCommitments = getClientPaymentCommitmentExperience('Neejee')
  const fulfillmentAudit = getCommercialFulfillmentAudit()

  return {
    legalName: organizationProfile.legalName,
    gstin: organizationProfile.gstin,
    dispatchedInvoices: dispatch.counts.dispatchedInvoices,
    resendEvents: dispatch.counts.resendEvents,
    activeCommitments: clientCommitments.commitments.filter((entry) => entry.status === 'active').length,
    outstandingReceivablesInr: fulfillmentAudit.outstandingReceivablesInr,
    supportEmail: String(getSupportEmail()),
    supportPhone: String(getSupportPhone())
  }
}