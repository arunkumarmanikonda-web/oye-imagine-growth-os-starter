import { oyeImagineOrganizationProfile } from '../foundation/organization-profile'
import type {
  GstBreakdown,
  GstMode,
  InvoiceLineItem,
  InvoiceReadiness,
  InvoiceRecord,
  InvoiceStatus,
  InvoiceSummaryCard,
} from './invoice-types'

export interface BuildInvoiceDraftInput {
  workspaceKey: string
  clientName: string
  clientEmail: string
  clientGstin?: string
  clientAddressLine?: string
  sourceAgreementId?: string
  sourceAgreementNumber?: string
  title: string
  kind?: InvoiceRecord['kind']
  currency?: string
  createdBy: string
  createdAt?: string
  issueDate?: string
  dueDays?: number
  sequence?: number
  notes?: string[]
  tags?: string[]
  lineItems: Array<{
    id: string
    label: string
    description: string
    quantity: number
    unitPrice: number
    taxable?: boolean
    gstRate?: number
    hsnSac?: string
  }>
}

export const ALLOWED_INVOICE_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['approved', 'cancelled', 'void'],
  approved: ['issued', 'cancelled', 'void'],
  issued: ['partially_paid', 'paid', 'overdue', 'cancelled'],
  partially_paid: ['paid', 'overdue', 'cancelled'],
  paid: ['void'],
  overdue: ['partially_paid', 'paid', 'cancelled'],
  cancelled: [],
  void: [],
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function addDays(dateIso: string, days: number): string {
  const date = new Date(dateIso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function deriveStateCodeFromGstin(gstin?: string): string | undefined {
  if (!gstin) {
    return undefined
  }

  const normalized = gstin.trim().toUpperCase()
  const match = normalized.match(/^(\d{2})[A-Z0-9]{13}$/)
  return match?.[1]
}

export function determineGstMode(vendorGstin?: string, clientGstin?: string): GstMode {
  const vendorState = deriveStateCodeFromGstin(vendorGstin)
  const clientState = deriveStateCodeFromGstin(clientGstin)

  if (vendorState && clientState && vendorState !== clientState) {
    return 'inter_state'
  }

  return 'intra_state'
}

export function hydrateInvoiceLineItems(
  items: BuildInvoiceDraftInput['lineItems'],
): InvoiceLineItem[] {
  return items.map((item) => {
    const quantity = Number(item.quantity)
    const unitPrice = Number(item.unitPrice)

    return {
      id: item.id,
      label: item.label,
      description: item.description,
      quantity,
      unitPrice,
      amount: roundCurrency(quantity * unitPrice),
      taxable: item.taxable ?? true,
      gstRate: item.gstRate ?? 18,
      hsnSac: item.hsnSac ?? '998361',
    }
  })
}

export function calculateInvoiceSubtotal(record: Pick<InvoiceRecord, 'lineItems'>): number {
  return roundCurrency(record.lineItems.reduce((sum, item) => sum + item.amount, 0))
}

export function buildGstBreakdown(
  lineItems: InvoiceLineItem[],
  vendorGstin?: string,
  clientGstin?: string,
): GstBreakdown {
  const mode = determineGstMode(vendorGstin, clientGstin)
  let taxableAmount = 0
  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  for (const item of lineItems) {
    if (!item.taxable || item.gstRate <= 0) {
      continue
    }

    taxableAmount += item.amount
    const taxAmount = roundCurrency((item.amount * item.gstRate) / 100)

    if (mode === 'inter_state') {
      igstAmount += taxAmount
    } else {
      const halfTax = roundCurrency(taxAmount / 2)
      cgstAmount += halfTax
      sgstAmount += halfTax
    }
  }

  return {
    mode,
    taxableAmount: roundCurrency(taxableAmount),
    cgstAmount: roundCurrency(cgstAmount),
    sgstAmount: roundCurrency(sgstAmount),
    igstAmount: roundCurrency(igstAmount),
    totalTaxAmount: roundCurrency(cgstAmount + sgstAmount + igstAmount),
  }
}

export function canTransitionInvoiceStatus(
  currentStatus: InvoiceStatus,
  nextStatus: InvoiceStatus,
): boolean {
  return ALLOWED_INVOICE_STATUS_TRANSITIONS[currentStatus].includes(nextStatus)
}

export function getInvoiceReadiness(record: InvoiceRecord): InvoiceReadiness {
  const missing: string[] = []

  if (record.lineItems.length === 0) {
    missing.push('line_items')
  }

  if (!record.vendor.gstin) {
    missing.push('vendor_gstin')
  }

  if (!record.billedTo.legalName) {
    missing.push('billed_to')
  }

  if (!record.issueDate) {
    missing.push('issue_date')
  }

  const issueReady =
    !missing.includes('line_items') &&
    !missing.includes('vendor_gstin') &&
    !missing.includes('billed_to') &&
    !missing.includes('issue_date')

  const paymentReady =
    issueReady &&
    (record.status === 'issued' || record.status === 'partially_paid' || record.status === 'overdue') &&
    record.payment.balanceAmount > 0

  return {
    issueReady,
    paymentReady,
    missing,
  }
}

function resolveVendorEmail(): string {
  const profile = oyeImagineOrganizationProfile as unknown as {
    support?: { email?: string }
    supportChannels?: Array<{ type?: string; value?: string }>
    email?: string
  }

  const supportEmail =
    profile.support?.email ??
    profile.supportChannels?.find((channel) => {
      const type = channel.type?.toLowerCase()
      return type === 'email' || type === 'support_email'
    })?.value ??
    profile.email ??
    'hello@oyeimagine.com'

  return supportEmail
}

function resolveVendorGstin(): string {
  const profile = oyeImagineOrganizationProfile as unknown as {
    taxProfile?: { gstin?: string }
    gstin?: string
  }

  return profile.taxProfile?.gstin ?? profile.gstin ?? '09AAECO6856D1Z8'
}

export function buildInvoiceDraft(input: BuildInvoiceDraftInput): InvoiceRecord {
  const createdAt = input.createdAt ?? new Date().toISOString()
  const issueDate = input.issueDate ?? createdAt
  const dueDays = input.dueDays ?? 7
  const sequence = input.sequence ?? 1
  const workspaceSlug = slugify(input.workspaceKey)
  const ymd = issueDate.slice(0, 10).replace(/-/g, '')
  const invoiceNumber = `INV-${workspaceSlug.toUpperCase()}-${ymd}-${String(sequence).padStart(3, '0')}`
  const lineItems = hydrateInvoiceLineItems(input.lineItems)
  const subtotalAmount = calculateInvoiceSubtotal({ lineItems })
  const vendorGstin = resolveVendorGstin()
  const gstBreakdown = buildGstBreakdown(lineItems, vendorGstin, input.clientGstin)
  const taxAmount = gstBreakdown.totalTaxAmount
  const totalAmount = roundCurrency(subtotalAmount + taxAmount)

  return {
    id: `invoice-${workspaceSlug}-${sequence}`,
    invoiceNumber,
    title: input.title,
    kind: input.kind ?? 'tax_invoice',
    status: 'draft',
    workspaceKey: workspaceSlug,
    currency: input.currency ?? 'INR',
    createdAt,
    updatedAt: createdAt,
    issueDate,
    dueDate: addDays(issueDate, dueDays),
    createdBy: input.createdBy,
    lastUpdatedBy: input.createdBy,
    sourceAgreementId: input.sourceAgreementId,
    sourceAgreementNumber: input.sourceAgreementNumber,
    vendor: {
      legalName: oyeImagineOrganizationProfile.legalName,
      email: resolveVendorEmail(),
      gstin: vendorGstin,
      stateCode: deriveStateCodeFromGstin(vendorGstin),
    },
    billedTo: {
      legalName: input.clientName,
      email: input.clientEmail,
      gstin: input.clientGstin,
      stateCode: deriveStateCodeFromGstin(input.clientGstin),
      addressLine: input.clientAddressLine,
    },
    lineItems,
    subtotalAmount,
    gstBreakdown,
    taxAmount,
    totalAmount,
    payment: {
      receivedAmount: 0,
      balanceAmount: totalAmount,
    },
    notes: input.notes ?? [],
    tags: input.tags ?? [workspaceSlug, input.kind ?? 'tax_invoice'],
  }
}

export function transitionInvoiceStatus(
  record: InvoiceRecord,
  nextStatus: InvoiceStatus,
  actor: string,
  changedAt?: string,
): InvoiceRecord {
  if (!canTransitionInvoiceStatus(record.status, nextStatus)) {
    throw new Error(`Invalid invoice transition: ${record.status} -> ${nextStatus}`)
  }

  const updatedAt = changedAt ?? new Date().toISOString()

  return {
    ...record,
    status: nextStatus,
    updatedAt,
    lastUpdatedBy: actor,
  }
}

export function applyInvoicePayment(
  record: InvoiceRecord,
  paymentAmount: number,
  actor: string,
  paidAt?: string,
): InvoiceRecord {
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than zero')
  }

  if (!['issued', 'partially_paid', 'overdue', 'paid'].includes(record.status)) {
    throw new Error(`Invoice status does not allow payment application: ${record.status}`)
  }

  const nextReceived = roundCurrency(Math.min(record.totalAmount, record.payment.receivedAmount + paymentAmount))
  const balanceAmount = roundCurrency(record.totalAmount - nextReceived)
  const nextStatus: InvoiceStatus = balanceAmount <= 0 ? 'paid' : 'partially_paid'
  const updatedAt = paidAt ?? new Date().toISOString()

  return {
    ...record,
    status: nextStatus,
    updatedAt,
    lastUpdatedBy: actor,
    payment: {
      receivedAmount: nextReceived,
      balanceAmount,
      lastPaymentAt: updatedAt,
    },
  }
}

export function toInvoiceSummaryCard(record: InvoiceRecord): InvoiceSummaryCard {
  return {
    id: record.id,
    invoiceNumber: record.invoiceNumber,
    title: record.title,
    kind: record.kind,
    status: record.status,
    workspaceKey: record.workspaceKey,
    clientName: record.billedTo.legalName,
    totalAmount: record.totalAmount,
    balanceAmount: record.payment.balanceAmount,
    gstMode: record.gstBreakdown.mode,
    sourceAgreementNumber: record.sourceAgreementNumber,
    readiness: getInvoiceReadiness(record),
  }
}