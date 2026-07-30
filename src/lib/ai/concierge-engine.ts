import { buildCommercialAutomationJobs } from '../commercial/commercial-automation'
import { getClientFinanceWorkspace } from '../finance/client-finance'
import type { AiConciergeAction, AiConciergeContextSummary, AiConciergeInsight, AiConciergeIntent, AiConciergeRequest, AiConciergeResponse } from './concierge-types'

function normalizeWorkspaceKey(workspaceKey: string): string {
  return workspaceKey.trim().toLowerCase()
}

function normalizeMessage(message: string): string {
  return message.trim().toLowerCase()
}

export function inferAiConciergeIntent(message: string): AiConciergeIntent {
  const normalized = normalizeMessage(message)

  if (
    normalized.includes('invoice') ||
    normalized.includes('billing') ||
    normalized.includes('gst') ||
    normalized.includes('outstanding')
  ) {
    return 'billing_overview'
  }

  if (
    normalized.includes('payment') ||
    normalized.includes('reminder') ||
    normalized.includes('follow up') ||
    normalized.includes('followup') ||
    normalized.includes('collection')
  ) {
    return 'payment_followup'
  }

  if (
    normalized.includes('agreement') ||
    normalized.includes('contract') ||
    normalized.includes('sign') ||
    normalized.includes('signature')
  ) {
    return 'agreement_status'
  }

  if (
    normalized.includes('renewal') ||
    normalized.includes('extend') ||
    normalized.includes('extension')
  ) {
    return 'renewal_guidance'
  }

  if (
    normalized.includes('help') ||
    normalized.includes('support') ||
    normalized.includes('handoff') ||
    normalized.includes('issue')
  ) {
    return 'support_handoff'
  }

  return 'general_navigation'
}

function buildContextSummary(workspaceKey: string, referenceDate: string): AiConciergeContextSummary {
  const financeWorkspace = getClientFinanceWorkspace(workspaceKey, referenceDate)
  const jobs = buildCommercialAutomationJobs(workspaceKey, referenceDate)

  return {
    workspaceKey: financeWorkspace.summary.workspaceKey,
    clientName: financeWorkspace.summary.clientName,
    invoiceCount: financeWorkspace.summary.invoiceCount,
    agreementCount: financeWorkspace.summary.agreementCount,
    totalInvoiced: financeWorkspace.summary.totalInvoiced,
    outstandingAmount: financeWorkspace.summary.outstandingAmount,
    openCollectionCount: financeWorkspace.summary.collectionOpenCount,
    paidInvoiceCount: financeWorkspace.summary.paidInvoiceCount,
    automationJobCount: jobs.length,
  }
}

function buildBillingInsights(workspaceKey: string, referenceDate: string): AiConciergeInsight[] {
  const financeWorkspace = getClientFinanceWorkspace(workspaceKey, referenceDate)
  const firstAlert = financeWorkspace.collectionsAlerts[0]

  const insights: AiConciergeInsight[] = [
    {
      id: 'billing-outstanding',
      title: 'Outstanding billing position',
      detail: `${financeWorkspace.summary.clientName} has ${financeWorkspace.summary.invoiceCount} invoice(s) and outstanding value of INR ${financeWorkspace.summary.outstandingAmount}.`,
      tone: financeWorkspace.summary.outstandingAmount > 0 ? 'attention' : 'positive',
    },
    {
      id: 'billing-gst-mode',
      title: 'GST routing',
      detail: `Workspace GST modes detected: ${financeWorkspace.gstModes.join(', ') || 'n/a'}.`,
      tone: 'neutral',
    },
  ]

  if (firstAlert) {
    insights.push({
      id: 'billing-alert',
      title: 'Next collections alert',
      detail: `${firstAlert.invoiceNumber} is flagged as ${firstAlert.severity} with amount INR ${firstAlert.amount}.`,
      tone: firstAlert.severity === 'critical' ? 'attention' : 'neutral',
    })
  }

  return insights
}

function buildAgreementInsights(workspaceKey: string, referenceDate: string): AiConciergeInsight[] {
  const financeWorkspace = getClientFinanceWorkspace(workspaceKey, referenceDate)

  return financeWorkspace.agreements.map((agreement, index) => ({
    id: `agreement-${index + 1}`,
    title: agreement.title,
    detail: `${agreement.agreementNumber} is currently ${agreement.status}.`,
    tone: agreement.status === 'signed' ? 'positive' : 'neutral',
  }))
}

function buildPaymentInsights(workspaceKey: string, referenceDate: string): AiConciergeInsight[] {
  const financeWorkspace = getClientFinanceWorkspace(workspaceKey, referenceDate)

  if (financeWorkspace.collectionsAlerts.length === 0) {
    return [
      {
        id: 'payments-clear',
        title: 'Collections clear',
        detail: 'No payment follow-up alerts are active for this workspace.',
        tone: 'positive',
      },
    ]
  }

  return financeWorkspace.collectionsAlerts.map((alert, index) => ({
    id: `payment-${index + 1}`,
    title: alert.title,
    detail: `${alert.description} Due date: ${alert.dueDate.slice(0, 10)}.`,
    tone: alert.severity === 'critical' ? 'attention' : 'neutral',
  }))
}

function buildRenewalInsights(workspaceKey: string, referenceDate: string): AiConciergeInsight[] {
  const jobs = buildCommercialAutomationJobs(workspaceKey, referenceDate)
    .filter((job) => job.kind === 'renewal_nudge')

  if (jobs.length === 0) {
    return [
      {
        id: 'renewal-none',
        title: 'No renewal window open',
        detail: 'No signed agreements are currently inside the renewal guidance window.',
        tone: 'positive',
      },
    ]
  }

  return jobs.map((job, index) => ({
    id: `renewal-${index + 1}`,
    title: job.title,
    detail: `${job.description} Scheduled for ${job.scheduledFor.slice(0, 10)}.`,
    tone: 'neutral',
  }))
}

function buildSupportInsights(workspaceKey: string, referenceDate: string): AiConciergeInsight[] {
  const jobs = buildCommercialAutomationJobs(workspaceKey, referenceDate)

  return [
    {
      id: 'support-open-jobs',
      title: 'Open commercial automations',
      detail: `${jobs.length} automation job(s) are available for this workspace.`,
      tone: jobs.length > 0 ? 'neutral' : 'positive',
    },
    {
      id: 'support-surface',
      title: 'Best handoff surface',
      detail: 'Use client finance for billing clarity and admin commercial for operator intervention.',
      tone: 'neutral',
    },
  ]
}

function buildGeneralInsights(workspaceKey: string, referenceDate: string): AiConciergeInsight[] {
  const context = buildContextSummary(workspaceKey, referenceDate)

  return [
    {
      id: 'general-context',
      title: 'Workspace snapshot',
      detail: `${context.clientName} has ${context.agreementCount} agreement(s), ${context.invoiceCount} invoice(s), and ${context.automationJobCount} automation job(s).`,
      tone: 'neutral',
    },
  ]
}

function buildActions(intent: AiConciergeIntent, workspaceKey: string): AiConciergeAction[] {
  const encodedWorkspace = encodeURIComponent(workspaceKey)

  switch (intent) {
    case 'billing_overview':
      return [
        {
          id: 'open-client-finance',
          label: 'Open client finance',
          href: '/client/finance',
          reason: 'Review invoice balances, GST mode, and linked agreements.',
        },
        {
          id: 'open-finance-api',
          label: 'Open finance API snapshot',
          href: `/api/client/finance?workspaceKey=${encodedWorkspace}`,
          reason: 'Inspect the current machine-readable finance workspace snapshot.',
        },
      ]
    case 'agreement_status':
      return [
        {
          id: 'open-admin-agreements',
          label: 'Open admin agreements',
          href: '/admin/agreements',
          reason: 'Review agreement stages, readiness, and issue/sign states.',
        },
        {
          id: 'open-client-finance',
          label: 'Open finance workspace',
          href: '/client/finance',
          reason: 'Cross-check agreement-linked invoices and commercial continuity.',
        },
      ]
    case 'payment_followup':
      return [
        {
          id: 'open-admin-commercial',
          label: 'Open admin commercial',
          href: '/admin/commercial',
          reason: 'Review reminders, escalations, and open collection jobs.',
        },
        {
          id: 'open-client-finance',
          label: 'Open client finance',
          href: '/client/finance',
          reason: 'Confirm outstanding balances and payment history.',
        },
      ]
    case 'renewal_guidance':
      return [
        {
          id: 'open-admin-commercial',
          label: 'Open renewal queue',
          href: '/admin/commercial',
          reason: 'Check renewal nudges and near-expiry agreements.',
        },
        {
          id: 'open-admin-agreements',
          label: 'Open agreements',
          href: '/admin/agreements',
          reason: 'Inspect signed agreements nearing term completion.',
        },
      ]
    case 'support_handoff':
      return [
        {
          id: 'open-admin-commercial',
          label: 'Open commercial control room',
          href: '/admin/commercial',
          reason: 'Route escalations and operator follow-ups.',
        },
        {
          id: 'open-client-finance',
          label: 'Open finance workspace',
          href: '/client/finance',
          reason: 'Ground support conversations in live billing context.',
        },
      ]
    default:
      return [
        {
          id: 'open-client-finance',
          label: 'Open client finance',
          href: '/client/finance',
          reason: 'Start from the workspace billing and agreement summary.',
        },
        {
          id: 'open-admin-commercial',
          label: 'Open admin commercial',
          href: '/admin/commercial',
          reason: 'Review commercial automations and follow-up controls.',
        },
      ]
  }
}

function buildSuggestedPrompts(intent: AiConciergeIntent): string[] {
  switch (intent) {
    case 'billing_overview':
      return [
        'Show outstanding invoices and GST summary',
        'Which invoices are still unpaid',
        'What changed in billing this week',
      ]
    case 'agreement_status':
      return [
        'Show issued and signed agreements',
        'Which agreements still need client action',
        'Summarize agreement readiness',
      ]
    case 'payment_followup':
      return [
        'Who needs payment follow-up first',
        'Show collections alerts',
        'Which invoices are at risk',
      ]
    case 'renewal_guidance':
      return [
        'Which agreements are nearing renewal',
        'Show renewal nudges',
        'What should be extended next',
      ]
    case 'support_handoff':
      return [
        'Route me to the right commercial surface',
        'Summarize the issue before handoff',
        'Show support-ready context',
      ]
    default:
      return [
        'Show my finance overview',
        'What requires action today',
        'Guide me to the right workspace',
      ]
  }
}

export function buildAiConciergeResponse(
  request: AiConciergeRequest,
): AiConciergeResponse {
  const referenceDate = request.referenceDate ?? '2026-08-05T00:00:00.000Z'
  const workspaceKey = normalizeWorkspaceKey(request.workspaceKey)
  const intent = inferAiConciergeIntent(request.message)
  const context = buildContextSummary(workspaceKey, referenceDate)

  let headline = `${context.clientName} concierge overview`
  let summary = `Workspace ${context.workspaceKey} has ${context.invoiceCount} invoice(s) and ${context.agreementCount} agreement(s).`
  let insights: AiConciergeInsight[] = []

  switch (intent) {
    case 'billing_overview':
      headline = `${context.clientName} billing overview`
      summary = `Outstanding amount is INR ${context.outstandingAmount} across ${context.invoiceCount} invoice(s).`
      insights = buildBillingInsights(workspaceKey, referenceDate)
      break
    case 'agreement_status':
      headline = `${context.clientName} agreement status`
      summary = `${context.agreementCount} agreement(s) are available with current lifecycle visibility.`
      insights = buildAgreementInsights(workspaceKey, referenceDate)
      break
    case 'payment_followup':
      headline = `${context.clientName} payment follow-up`
      summary = `${context.openCollectionCount} invoice(s) require collections attention.`
      insights = buildPaymentInsights(workspaceKey, referenceDate)
      break
    case 'renewal_guidance':
      headline = `${context.clientName} renewal guidance`
      summary = `Review renewal windows, active terms, and commercial continuation paths.`
      insights = buildRenewalInsights(workspaceKey, referenceDate)
      break
    case 'support_handoff':
      headline = `${context.clientName} support handoff`
      summary = `Support handoff is grounded in finance visibility and commercial automation state.`
      insights = buildSupportInsights(workspaceKey, referenceDate)
      break
    default:
      insights = buildGeneralInsights(workspaceKey, referenceDate)
      break
  }

  return {
    workspaceKey,
    surface: request.surface,
    intent,
    headline,
    summary,
    context,
    insights,
    actions: buildActions(intent, workspaceKey),
    suggestedPrompts: buildSuggestedPrompts(intent),
  }
}