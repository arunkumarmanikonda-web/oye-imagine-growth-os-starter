import { organizationProfile } from './organization-profile'

export type AgreementStatus = 'draft' | 'issued' | 'signed'
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue'
export type LedgerEntryType = 'invoice' | 'payment' | 'adjustment'

export interface CommercialAgreement {
  id: string
  accountName: string
  title: string
  status: AgreementStatus
  valueInr: number
  currency: 'INR'
  signingMode: 'e-sign'
}

export interface CommercialInvoice {
  id: string
  accountName: string
  invoiceNumber: string
  status: InvoiceStatus
  subtotalInr: number
  gstRate: number
  gstAmountInr: number
  totalInr: number
}

export interface LedgerEntry {
  id: string
  accountName: string
  type: LedgerEntryType
  reference: string
  amountInr: number
  direction: 'debit' | 'credit'
}

export const commercialAgreements: CommercialAgreement[] = [
  {
    id: 'agr-neejee-001',
    accountName: 'Neejee',
    title: 'Growth Operating System Master Services Agreement',
    status: 'issued',
    valueInr: 240000,
    currency: 'INR',
    signingMode: 'e-sign'
  },
  {
    id: 'agr-marketplace-001',
    accountName: 'Marketplace Prospect',
    title: 'Managed Growth Advisory Agreement',
    status: 'draft',
    valueInr: 85000,
    currency: 'INR',
    signingMode: 'e-sign'
  }
]

export const commercialInvoices: CommercialInvoice[] = [
  {
    id: 'inv-neejee-001',
    accountName: 'Neejee',
    invoiceNumber: 'OI-2026-001',
    status: 'issued',
    subtotalInr: 100000,
    gstRate: 0.18,
    gstAmountInr: 18000,
    totalInr: 118000
  },
  {
    id: 'inv-neejee-002',
    accountName: 'Neejee',
    invoiceNumber: 'OI-2026-002',
    status: 'draft',
    subtotalInr: 50000,
    gstRate: 0.18,
    gstAmountInr: 9000,
    totalInr: 59000
  }
]

export const ledgerEntries: LedgerEntry[] = [
  {
    id: 'led-001',
    accountName: 'Neejee',
    type: 'invoice',
    reference: 'OI-2026-001',
    amountInr: 118000,
    direction: 'debit'
  },
  {
    id: 'led-002',
    accountName: 'Neejee',
    type: 'payment',
    reference: 'PMT-2026-001',
    amountInr: 50000,
    direction: 'credit'
  }
]

export function getCommercialFoundationSnapshot() {
  const issuedInvoices = commercialInvoices.filter((invoice) => invoice.status === 'issued').length
  const draftInvoices = commercialInvoices.filter((invoice) => invoice.status === 'draft').length
  const signedAgreements = commercialAgreements.filter((agreement) => agreement.status === 'signed').length
  const issuedAgreements = commercialAgreements.filter((agreement) => agreement.status === 'issued').length

  const outstandingReceivablesInr =
    ledgerEntries
      .filter((entry) => entry.direction === 'debit')
      .reduce((sum, entry) => sum + entry.amountInr, 0) -
    ledgerEntries
      .filter((entry) => entry.direction === 'credit')
      .reduce((sum, entry) => sum + entry.amountInr, 0)

  return {
    legalName: organizationProfile.legalName,
    gstin: organizationProfile.gstin,
    agreementCount: commercialAgreements.length,
    invoiceCount: commercialInvoices.length,
    ledgerEntryCount: ledgerEntries.length,
    issuedInvoices,
    draftInvoices,
    signedAgreements,
    issuedAgreements,
    outstandingReceivablesInr
  }
}