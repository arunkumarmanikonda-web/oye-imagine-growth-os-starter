import {
  answerConciergeQuery,
  buildConciergeWorkspaceSnapshot,
} from './concierge-retrieval'
import type {
  ConciergeScope,
  ConciergeSurface,
} from './concierge-retrieval-types'
import type {
  ConciergeActionCard,
  ConciergeActionTone,
  ConciergeExperiencePayload,
  ConciergeExperienceShell,
  ConciergeGuidedAnswer,
  ConciergePromptPreset,
} from './concierge-experience-types'
import { CONCIERGE_EXPERIENCE_MODES } from './concierge-experience-types'

const promptCatalog: ConciergePromptPreset[] = [
  {
    id: 'client-overdue-finance',
    label: 'Overdue invoices and balance',
    description: 'Jump straight to overdue invoices, ledger balance, and billing blockers.',
    query: 'where is my overdue invoice and current ledger balance',
    audience: 'client',
    surface: 'client_dashboard',
    intent: 'finance',
  },
  {
    id: 'client-reports-and-scope',
    label: 'Reports and active scope',
    description: 'Show available reports, active agreement terms, and what is included.',
    query: 'what reports are available and what is included in my current scope',
    audience: 'client',
    surface: 'client_dashboard',
    intent: 'agreements',
  },
  {
    id: 'client-help-next-steps',
    label: 'Support and next actions',
    description: 'Surface support contact details, open threads, and recommended next actions.',
    query: 'contact support, support requests, and next steps I should take',
    audience: 'client',
    surface: 'help_panel',
    intent: 'support',
  },
  {
    id: 'client-support-center-guided',
    label: 'Support center guided retrieval',
    description: 'Open support, onboarding blockers, and any pending client confirmations.',
    query: 'show support requests and onboarding blockers requiring my reply',
    audience: 'client',
    surface: 'support_center',
    intent: 'support',
  },
  {
    id: 'marketplace-request-status',
    label: 'Request and proposal status',
    description: 'Open marketplace requests, proposals, and approval status.',
    query: 'request status, proposal status and approved deliverables',
    audience: 'marketplace_client',
    surface: 'marketplace_surface',
    intent: 'marketplace',
  },
  {
    id: 'marketplace-specialist-logic',
    label: 'Specialist availability logic',
    description: 'Explain service lanes, specialist matching, and how to submit requests.',
    query: 'service lanes, specialist availability and how to submit requests',
    audience: 'marketplace_client',
    surface: 'marketplace_surface',
    intent: 'marketplace',
  },
  {
    id: 'marketplace-help',
    label: 'Marketplace help panel',
    description: 'Use the help panel to jump to requests, proposals, and deliverable artifacts.',
    query: 'marketplace services, proposal status, request status and deliverables',
    audience: 'marketplace_client',
    surface: 'help_panel',
    intent: 'marketplace',
  },
  {
    id: 'admin-guard-audit',
    label: 'Permission guard audit',
    description: 'Verify internal-only artifacts stay hidden from client and marketplace scopes.',
    query: 'margin health, secret config and denied results audit',
    audience: 'admin',
    surface: 'help_panel',
    intent: 'admin',
  },
]

function buildTitle(surface: ConciergeSurface): string {
  switch (surface) {
    case 'client_dashboard':
      return 'Global concierge search'
    case 'marketplace_surface':
      return 'Marketplace concierge'
    case 'help_panel':
      return 'Assist panel'
    case 'support_center':
      return 'Support center concierge'
    default:
      return 'AI concierge'
  }
}

function buildSubtitle(scope: ConciergeScope, surface: ConciergeSurface): string {
  if (scope.audience === 'marketplace_client') {
    return 'Native marketplace retrieval for requests, proposals, specialist matching, and deliverable jumps.'
  }

  if (scope.audience === 'admin') {
    return 'Oversight view for permission-scoped retrieval, denied-result auditing, and premium concierge quality.'
  }

  if (surface === 'support_center') {
    return 'Support-centered help surface with linked artifacts, guided answers, and action-ready escalations.'
  }

  return 'Permission-aware retrieval for invoices, reports, agreements, support, onboarding, and guided next actions.'
}

function buildPlaceholder(scope: ConciergeScope): string {
  if (scope.audience === 'marketplace_client') {
    return 'Ask about service lanes, proposal status, specialist availability, requests, or deliverables'
  }

  if (scope.audience === 'admin') {
    return 'Audit internal visibility, denied results, support/help coverage, or concierge quality'
  }

  return 'Ask about invoices, reports, agreements, support requests, onboarding, or next steps'
}

function buildPromptPresets(scope: ConciergeScope, surface: ConciergeSurface): ConciergePromptPreset[] {
  return promptCatalog.filter((preset) => {
    if (preset.audience !== scope.audience) {
      return false
    }

    return preset.surface === surface
  })
}

function buildActionTone(action: string, index: number): ConciergeActionTone {
  if (index === 0) {
    return 'primary'
  }

  if (action === 'open_support') {
    return 'support'
  }

  return 'secondary'
}

function buildActionDescription(action: string): string {
  switch (action) {
    case 'open_invoice':
      return 'Open the billing artifact directly from the concierge answer.'
    case 'open_report':
      return 'Jump to the report, performance summary, or campaign module.'
    case 'open_agreement':
      return 'Open the active agreement or current scope artifact.'
    case 'open_document':
      return 'Open the signed document or approved deliverable package.'
    case 'open_support':
      return 'Move directly into the support/help surface linked to this answer.'
    case 'open_marketplace':
      return 'Jump into the marketplace request, proposal, or specialist workflow.'
    default:
      return 'Open the linked concierge artifact.'
  }
}

function buildHeadline(intent: string): string {
  switch (intent) {
    case 'finance':
      return 'Finance-ready guided answer'
    case 'agreements':
      return 'Agreement and scope answer'
    case 'reporting':
      return 'Reporting and performance answer'
    case 'support':
      return 'Support and help answer'
    case 'marketplace':
      return 'Marketplace guided answer'
    case 'next_actions':
      return 'Next-step guidance'
    default:
      return 'Guided concierge answer'
  }
}

export function buildConciergeExperienceShell(
  scope: ConciergeScope,
  surface: ConciergeSurface
): ConciergeExperienceShell {
  return {
    title: buildTitle(surface),
    subtitle: buildSubtitle(scope, surface),
    placeholder: buildPlaceholder(scope),
    modes: [...CONCIERGE_EXPERIENCE_MODES],
    promptPresets: buildPromptPresets(scope, surface),
    emptyStateTitle: 'Ask anything inside your authenticated scope',
    emptyStateBody:
      'The concierge stays permission-scoped, surfaces linked artifacts, and returns action shortcuts instead of generic chat.',
  }
}

export function buildConciergeGuidedAnswer(
  scope: ConciergeScope,
  query: string,
  surface: ConciergeSurface
): ConciergeGuidedAnswer {
  const answer = answerConciergeQuery(scope, query, surface)

  const sourceChips = answer.citations.map((citation) => ({
    label: citation.label,
    href: citation.href,
    kind: citation.kind,
  }))

  const actionCards: ConciergeActionCard[] = answer.shortcuts.map((shortcut, index) => ({
    id: `${shortcut.action}-${index + 1}`,
    label: shortcut.label,
    description: buildActionDescription(shortcut.action),
    href: shortcut.href,
    action: shortcut.action,
    tone: buildActionTone(shortcut.action, index),
  }))

  const nextStepCards = answer.nextActions.map((step, index) => ({
    label: `Next step ${index + 1}`,
    description: step,
  }))

  return {
    headline: buildHeadline(answer.intent),
    summary: answer.narrative,
    answer,
    sourceChips,
    actionCards,
    nextStepCards,
  }
}

export function buildConciergeExperiencePayload(
  scope: ConciergeScope,
  surface: ConciergeSurface,
  query: string
): ConciergeExperiencePayload {
  return {
    surface,
    audience: scope.audience,
    shell: buildConciergeExperienceShell(scope, surface),
    snapshot: buildConciergeWorkspaceSnapshot(scope, surface),
    guidedAnswer: buildConciergeGuidedAnswer(scope, query, surface),
  }
}