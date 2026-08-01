export const COMMERCIAL_AUTOMATION_KINDS = [
  'invoice_reminder',
  'agreement_followup',
  'renewal_nudge',
  'collections_escalation',
] as const

export type CommercialAutomationKind = (typeof COMMERCIAL_AUTOMATION_KINDS)[number]

export const COMMERCIAL_AUTOMATION_CHANNELS = ['email', 'whatsapp', 'call'] as const
export type CommercialAutomationChannel = (typeof COMMERCIAL_AUTOMATION_CHANNELS)[number]

export const COMMERCIAL_AUTOMATION_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type CommercialAutomationPriority = (typeof COMMERCIAL_AUTOMATION_PRIORITIES)[number]

export interface CommercialAutomationJob {
  id: string
  workspaceKey: string
  kind: CommercialAutomationKind
  channel: CommercialAutomationChannel
  priority: CommercialAutomationPriority
  title: string
  description: string
  scheduledFor: string
  targetReference: string
  amount?: number
  tags: string[]
}

export interface CommercialAutomationSummary {
  total: number
  byKind: Record<CommercialAutomationKind, number>
  byPriority: Record<CommercialAutomationPriority, number>
  workspaces: string[]
}

export interface CommercialHardeningCheck {
  id: string
  title: string
  passed: boolean
  detail: string
}

export interface CommercialHardeningSnapshot {
  referenceDate: string
  totalAutomationJobs: number
  criticalAutomationJobs: number
  openCollectionsValue: number
  workspacesCovered: string[]
  readinessScore: number
  atRiskWorkspaces: string[]
  checks: CommercialHardeningCheck[]
}