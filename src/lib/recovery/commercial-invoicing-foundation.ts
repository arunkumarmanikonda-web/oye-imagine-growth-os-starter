import { buildAgreementExecutionPackage } from './commercial-agreement-execution'
import {
  COMMERCIAL_DELIVERY_CHANNELS,
  COMMERCIAL_GST_RATES,
  COMMERCIAL_INVOICE_STATUSES,
  COMMERCIAL_LEDGER_ENTRY_TYPES,
} from './commercial-invoicing-types'

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatInvoiceNumber(sequence: number) {
  const year = 2026
  return `INV-${year}-${String(sequence).padStart(4, '0')}`
}

function getDueDays(paymentTerm: string) {
  if (paymentTerm === 'advance') return 0
  if (paymentTerm === 'net_30') return 30
  return 15
}

function getLineItems(input: {
  requestedLanes?: string[]
  baseFeeInr?: number
}) {
  const requestedLanes = Array.isArray(input?.requestedLanes) && input.requestedLanes.length
    ? input.requestedLanes.map((lane) => normalizeText(lane)).filter(Boolean)
    : ['growth_strategy']

  const baseFeeInr = normalizeNumber(input?.baseFeeInr, 0)
  const effectiveBase = baseFeeInr > 0 ? baseFeeInr : requestedLanes.length * 50000

  const perLane = Math.round(effectiveBase / requestedLanes.length)

  return requestedLanes.map((lane, index) => ({
    lineId: `line_${index + 1}`,
    lane,
    label: lane.replace(/_/g, ' '),
    quantity: 1,
    unitPriceInr: perLane,
    amountInr: perLane,
  }))
}

export function buildInvoicePreview(input: {
  clientLegalName?: string
  clientTradeName?: string
  clientPrimaryContactName?: string
  clientPrimaryContactEmail?: string
  clientGstin?: string
  clientBillingAddress?: string
  requestedLanes?: string[]
  billingModel?: string
  baseFeeInr?: number
  paymentTerm?: string
  invoiceSequence?: number
  invoiceStatus?: string
}) {
  const agreementPackage = buildAgreementExecutionPackage(input)
  const lineItems = getLineItems(input)
  const subTotalInr = lineItems.reduce((sum, item) => sum + item.amountInr, 0)
  const gstRatePercent = COMMERCIAL_GST_RATES[1]
  const gstAmountInr = Math.round((subTotalInr * gstRatePercent) / 100)
  const totalInr = subTotalInr + gstAmountInr
  const invoiceStatus = COMMERCIAL_INVOICE_STATUSES.includes(normalizeText(input?.invoiceStatus) as never)
    ? normalizeText(input?.invoiceStatus)
    : 'issued'

  return {
    invoiceNumber: formatInvoiceNumber(normalizeNumber(input?.invoiceSequence, 1)),
    status: invoiceStatus,
    providerProfile: agreementPackage.providerProfile,
    clientProfile: agreementPackage.clientProfile,
    agreementId: agreementPackage.agreementId,
    lineItems,
    taxSummary: {
      gstRatePercent,
      taxableValueInr: subTotalInr,
      gstAmountInr,
      totalInr,
    },
    billingTerms: {
      currency: 'INR',
      paymentTerm: agreementPackage.commercialTerms.paymentTerm,
      dueInDays: getDueDays(agreementPackage.commercialTerms.paymentTerm),
      invoiceCycle: agreementPackage.commercialTerms.invoiceCycle,
      deliveryChannel: agreementPackage.commercialTerms.invoiceDelivery,
    },
    metadata: {
      cin: agreementPackage.providerProfile.cin,
      pan: agreementPackage.providerProfile.pan,
      gstin: agreementPackage.providerProfile.gstin,
      placeOfSupply: 'Uttar Pradesh',
    },
  }
}

export function createInvoiceDeliveryPlan(input: {
  clientLegalName?: string
  clientTradeName?: string
  clientPrimaryContactName?: string
  clientPrimaryContactEmail?: string
  clientGstin?: string
  clientBillingAddress?: string
  requestedLanes?: string[]
  billingModel?: string
  baseFeeInr?: number
  paymentTerm?: string
  invoiceSequence?: number
}) {
  const invoice = buildInvoicePreview(input)

  return {
    invoiceNumber: invoice.invoiceNumber,
    status: 'delivery_ready',
    provider: 'resend_ready',
    channels: [...COMMERCIAL_DELIVERY_CHANNELS],
    primaryRecipient: invoice.clientProfile.primaryContactEmail,
    ccRecipients: [invoice.providerProfile.billingEmail],
    subject: `${invoice.invoiceNumber} | ${invoice.providerProfile.brandName} tax invoice`,
    portalRoute: `/client/billing/${invoice.invoiceNumber}`,
    attachments: [
      `${invoice.invoiceNumber}_tax_invoice.pdf`,
      `${invoice.invoiceNumber}_commercial_schedule.pdf`,
    ],
    deliveryAudit: {
      emailStack: invoice.providerProfile.emailDeliveryProvider,
      providerBound: true,
      gstAligned: true,
    },
  }
}

export function buildLedgerSnapshot(input: {
  clientLegalName?: string
  clientTradeName?: string
  clientPrimaryContactName?: string
  clientPrimaryContactEmail?: string
  clientGstin?: string
  clientBillingAddress?: string
  requestedLanes?: string[]
  billingModel?: string
  baseFeeInr?: number
  paymentTerm?: string
  invoiceSequence?: number
  openingBalanceInr?: number
  receivedPaymentInr?: number
}) {
  const invoice = buildInvoicePreview(input)
  const openingBalanceInr = normalizeNumber(input?.openingBalanceInr, 0)
  const receivedPaymentInr = normalizeNumber(input?.receivedPaymentInr, 0)
  const outstandingBalanceInr = openingBalanceInr + invoice.taxSummary.totalInr - receivedPaymentInr

  return {
    clientLegalName: invoice.clientProfile.legalName,
    invoiceNumber: invoice.invoiceNumber,
    currency: 'INR',
    openingBalanceInr,
    invoicedAmountInr: invoice.taxSummary.totalInr,
    receivedPaymentInr,
    outstandingBalanceInr,
    entries: [
      {
        entryId: `${invoice.invoiceNumber}_opening`,
        type: COMMERCIAL_LEDGER_ENTRY_TYPES[3],
        amountInr: openingBalanceInr,
        label: 'Opening balance',
      },
      {
        entryId: `${invoice.invoiceNumber}_invoice`,
        type: COMMERCIAL_LEDGER_ENTRY_TYPES[0],
        amountInr: invoice.taxSummary.totalInr,
        label: `Invoice ${invoice.invoiceNumber}`,
      },
      {
        entryId: `${invoice.invoiceNumber}_payment`,
        type: COMMERCIAL_LEDGER_ENTRY_TYPES[1],
        amountInr: receivedPaymentInr,
        label: 'Received payment',
      },
    ],
    summary: {
      overdue: outstandingBalanceInr > 0 && invoice.billingTerms.dueInDays <= 15,
      paymentTerm: invoice.billingTerms.paymentTerm,
      deliveryChannel: invoice.billingTerms.deliveryChannel,
    },
  }
}

export function getCommercialInvoicingSnapshot() {
  return {
    invoiceStatusCount: COMMERCIAL_INVOICE_STATUSES.length,
    ledgerEntryTypeCount: COMMERCIAL_LEDGER_ENTRY_TYPES.length,
    deliveryChannelCount: COMMERCIAL_DELIVERY_CHANNELS.length,
    gstRateCount: COMMERCIAL_GST_RATES.length,
  }
}

export function getAdminCommercialInvoicingExperience() {
  const sampleInvoice = buildInvoicePreview({
    clientLegalName: 'Neejee Retail Private Limited',
    clientTradeName: 'Neejee',
    clientPrimaryContactName: 'Commercial Lead',
    clientPrimaryContactEmail: 'finance@neejee.example',
    requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 125000,
    paymentTerm: 'net_15',
    invoiceSequence: 17,
  })

  const deliveryPlan = createInvoiceDeliveryPlan({
    clientLegalName: 'Neejee Retail Private Limited',
    clientTradeName: 'Neejee',
    clientPrimaryContactName: 'Commercial Lead',
    clientPrimaryContactEmail: 'finance@neejee.example',
    requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 125000,
    paymentTerm: 'net_15',
    invoiceSequence: 17,
  })

  const ledger = buildLedgerSnapshot({
    clientLegalName: 'Neejee Retail Private Limited',
    clientTradeName: 'Neejee',
    clientPrimaryContactName: 'Commercial Lead',
    clientPrimaryContactEmail: 'finance@neejee.example',
    requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 125000,
    paymentTerm: 'net_15',
    invoiceSequence: 17,
    openingBalanceInr: 25000,
    receivedPaymentInr: 50000,
  })

  return {
    snapshot: getCommercialInvoicingSnapshot(),
    sampleInvoice,
    deliveryPlan,
    ledger,
    workflowCards: [
      {
        id: 'invoice_generation',
        label: 'GST-aligned invoice generation',
        summary: 'Generate tax-compliant invoice previews from agreement execution data and canonical provider identity.',
      },
      {
        id: 'invoice_delivery',
        label: 'Invoice delivery routing',
        summary: 'Prepare portal and email delivery through the canonical billing mailbox and Resend stack.',
      },
      {
        id: 'ledger_foundation',
        label: 'Ledger and collections foundation',
        summary: 'Bind invoice issue, payment receipt, collections posture, and outstanding balance into one client ledger view.',
      },
    ],
  }
}