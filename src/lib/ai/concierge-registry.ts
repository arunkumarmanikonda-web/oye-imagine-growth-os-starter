import { getCommercialWorkspaces } from '../commercial/commercial-hardening'
import { getClientFinanceWorkspace } from '../finance/client-finance'
import { AI_CONCIERGE_INTENTS, type AiConciergePromptPreset, type AiConciergeRegistrySummary, type AiConciergeWorkspaceCard } from './concierge-types'

export function getAiConciergePromptPresets(workspaceKey = 'neejee'): AiConciergePromptPreset[] {
  return [
    {
      id: `${workspaceKey}-billing`,
      title: 'Billing overview',
      prompt: 'Show my outstanding invoices and GST summary',
      intent: 'billing_overview',
    },
    {
      id: `${workspaceKey}-agreements`,
      title: 'Agreement status',
      prompt: 'Show agreements awaiting action',
      intent: 'agreement_status',
    },
    {
      id: `${workspaceKey}-payments`,
      title: 'Payment follow-up',
      prompt: 'Which invoices need payment follow-up',
      intent: 'payment_followup',
    },
    {
      id: `${workspaceKey}-renewal`,
      title: 'Renewal guidance',
      prompt: 'Which agreements are close to renewal',
      intent: 'renewal_guidance',
    },
    {
      id: `${workspaceKey}-support`,
      title: 'Support handoff',
      prompt: 'Route me to the right commercial workspace',
      intent: 'support_handoff',
    },
  ]
}

export function getAiConciergeWorkspaceCards(
  referenceDate = '2026-08-05T00:00:00.000Z',
): AiConciergeWorkspaceCard[] {
  return getCommercialWorkspaces().map((workspaceKey) => {
    const financeWorkspace = getClientFinanceWorkspace(workspaceKey, referenceDate)

    return {
      workspaceKey,
      clientName: financeWorkspace.summary.clientName,
      invoiceCount: financeWorkspace.summary.invoiceCount,
      agreementCount: financeWorkspace.summary.agreementCount,
      outstandingAmount: financeWorkspace.summary.outstandingAmount,
      openCollectionCount: financeWorkspace.summary.collectionOpenCount,
    }
  })
}

export function getAiConciergeRegistrySummary(): AiConciergeRegistrySummary {
  return {
    workspaces: getCommercialWorkspaces().length,
    promptPresets: getAiConciergePromptPresets().length,
    intents: AI_CONCIERGE_INTENTS.length,
  }
}