import { buildAgreementExecutionPackage } from './commercial-agreement-execution'
import {
  buildInvoicePreview,
  buildLedgerSnapshot,
  createInvoiceDeliveryPlan,
  getCommercialInvoicingSnapshot,
} from './commercial-invoicing-foundation'

export const COMMERCIAL_SUPPORT_STATUSES = [
  'open',
  'awaiting_client',
  'in_progress',
  'resolved',
] as const

export const COMMERCIAL_WORKFLOW_STAGES = [
  'sales_handoff',
  'agreement_prepared',
  'finance_ready',
  'delivery_ready',
] as const

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function buildSupportThreads(input: {
  clientLegalName?: string
  primaryContactEmail?: string
}) {
  const clientName = normalizeText(input?.clientLegalName) || 'Prospective client'
  const email = normalizeText(input?.primaryContactEmail) || 'pending@client.example'

  return [
    {
      threadId: 'support_2048',
      subject: `${clientName} onboarding and invoice continuity`,
      status: 'awaiting_client',
      channel: 'email',
      lastMessagePreview: `Awaiting confirmation from ${email} on billing and kickoff coordination.`,
    },
    {
      threadId: 'support_2056',
      subject: `${clientName} reporting readiness`,
      status: 'in_progress',
      channel: 'portal',
      lastMessagePreview: 'Reporting and support lane is active with next action tracking enabled.',
    },
  ]
}

export function buildClientCommercialDashboard(input: {
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
  const agreementPackage = buildAgreementExecutionPackage(input)
  const invoice = buildInvoicePreview(input)
  const deliveryPlan = createInvoiceDeliveryPlan(input)
  const ledger = buildLedgerSnapshot(input)
  const supportThreads = buildSupportThreads({
    clientLegalName: agreementPackage.clientProfile.legalName,
    primaryContactEmail: agreementPackage.clientProfile.primaryContactEmail,
  })

  return {
    clientProfile: agreementPackage.clientProfile,
    providerProfile: agreementPackage.providerProfile,
    agreementSummary: {
      agreementId: agreementPackage.agreementId,
      executionState: agreementPackage.executionState,
      scopeLaneCount: agreementPackage.commercialTerms ? agreementPackage.artifacts.length : 0,
      signatureReady: agreementPackage.signatureReadiness.readyForDispatch,
      nextApprovalStage: agreementPackage.approvalProgress.nextStage,
    },
    invoiceSummary: {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      totalInr: invoice.taxSummary.totalInr,
      gstAmountInr: invoice.taxSummary.gstAmountInr,
      dueInDays: invoice.billingTerms.dueInDays,
      deliveryRoute: deliveryPlan.portalRoute,
    },
    ledgerSummary: {
      openingBalanceInr: ledger.openingBalanceInr,
      invoicedAmountInr: ledger.invoicedAmountInr,
      receivedPaymentInr: ledger.receivedPaymentInr,
      outstandingBalanceInr: ledger.outstandingBalanceInr,
      overdue: ledger.summary.overdue,
    },
    supportSummary: {
      activeThreadCount: supportThreads.length,
      latestStatus: supportThreads[0]?.status ?? 'open',
      threads: supportThreads,
    },
    actionCenter: [
      {
        actionId: 'open_agreement_execution',
        label: 'Open agreement execution',
        route: `/client/agreements/execution`,
      },
      {
        actionId: 'open_billing',
        label: 'Open billing',
        route: `/client/billing`,
      },
      {
        actionId: 'open_support',
        label: 'Open support continuity',
        route: `/client/support`,
      },
    ],
    continuityTimeline: [
      {
        eventId: 'timeline_agreement',
        label: 'Agreement prepared',
        detail: `Agreement package ${agreementPackage.agreementId} is available for commercial continuity.`,
      },
      {
        eventId: 'timeline_invoice',
        label: 'Invoice issued',
        detail: `Invoice ${invoice.invoiceNumber} is ready through portal and billing email delivery.`,
      },
      {
        eventId: 'timeline_support',
        label: 'Support continuity',
        detail: `${supportThreads.length} governed support threads remain visible to the client dashboard.`,
      },
    ],
  }
}

export function buildOperatorWorkflowClosure(input: {
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
  const dashboard = buildClientCommercialDashboard(input)
  const salesReady = dashboard.agreementSummary.agreementId.length > 0
  const agreementReady = dashboard.agreementSummary.executionState === 'approval_in_progress' || dashboard.agreementSummary.executionState === 'signature_ready'
  const financeReady = dashboard.invoiceSummary.totalInr > 0
  const deliveryReady = dashboard.supportSummary.activeThreadCount > 0

  const stages = [
    {
      stage: 'sales_handoff',
      label: 'Sales to agreement handoff',
      status: salesReady ? 'complete' : 'pending',
      summary: 'Party details, commercial request and requested lanes captured.',
    },
    {
      stage: 'agreement_prepared',
      label: 'Agreement package prepared',
      status: agreementReady ? 'complete' : 'pending',
      summary: 'Agreement execution package and approval continuity are available.',
    },
    {
      stage: 'finance_ready',
      label: 'Finance layer ready',
      status: financeReady ? 'complete' : 'pending',
      summary: 'GST-aligned invoice preview, delivery routing and ledger view are available.',
    },
    {
      stage: 'delivery_ready',
      label: 'Delivery and support continuity ready',
      status: deliveryReady ? 'complete' : 'pending',
      summary: 'Client support continuity and delivery-facing handoff are active.',
    },
  ]

  return {
    clientLegalName: dashboard.clientProfile.legalName,
    overallStatus: stages.every((stage) => stage.status === 'complete') ? 'workflow_closed' : 'handoff_pending',
    completedStageCount: stages.filter((stage) => stage.status === 'complete').length,
    stages,
    handoffSummary: {
      agreementId: dashboard.agreementSummary.agreementId,
      invoiceNumber: dashboard.invoiceSummary.invoiceNumber,
      outstandingBalanceInr: dashboard.ledgerSummary.outstandingBalanceInr,
      supportThreadCount: dashboard.supportSummary.activeThreadCount,
    },
    operatorActions: [
      {
        actionId: 'open_admin_commercial_execution',
        label: 'Open commercial execution',
        route: '/admin/commercial/execution',
      },
      {
        actionId: 'open_admin_invoicing',
        label: 'Open invoicing',
        route: '/admin/commercial/invoicing',
      },
      {
        actionId: 'open_admin_commercial_dashboard',
        label: 'Open commercial dashboard',
        route: '/admin/commercial/dashboard',
      },
    ],
  }
}

export function getCommercialDashboardSnapshot() {
  const invoicing = getCommercialInvoicingSnapshot()

  return {
    supportStatusCount: COMMERCIAL_SUPPORT_STATUSES.length,
    workflowStageCount: COMMERCIAL_WORKFLOW_STAGES.length,
    invoiceStatusCount: invoicing.invoiceStatusCount,
    ledgerEntryTypeCount: invoicing.ledgerEntryTypeCount,
  }
}

export function getAdminCommercialDashboardExperience() {
  const dashboard = buildClientCommercialDashboard({
    clientLegalName: 'Neejee Retail Private Limited',
    clientTradeName: 'Neejee',
    clientPrimaryContactName: 'Commercial Lead',
    clientPrimaryContactEmail: 'finance@neejee.example',
    requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 125000,
    paymentTerm: 'net_15',
    invoiceSequence: 25,
    openingBalanceInr: 25000,
    receivedPaymentInr: 50000,
  })

  const workflow = buildOperatorWorkflowClosure({
    clientLegalName: 'Neejee Retail Private Limited',
    clientTradeName: 'Neejee',
    clientPrimaryContactName: 'Commercial Lead',
    clientPrimaryContactEmail: 'finance@neejee.example',
    requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 125000,
    paymentTerm: 'net_15',
    invoiceSequence: 25,
    openingBalanceInr: 25000,
    receivedPaymentInr: 50000,
  })

  return {
    snapshot: getCommercialDashboardSnapshot(),
    dashboard,
    workflow,
    workflowCards: [
      {
        id: 'client_commercial_dashboard',
        label: 'Client commercial dashboard',
        summary: 'One dashboard for agreement continuity, invoice truth, ledger visibility and support status.',
      },
      {
        id: 'continuity_chain',
        label: 'Continuity chain',
        summary: 'Maintain visible continuity from agreement execution to billing, support and delivery readiness.',
      },
      {
        id: 'operator_handoff',
        label: 'Operator workflow closure',
        summary: 'Close the sales → agreement → finance → delivery chain inside one governed operator workflow.',
      },
    ],
  }
}