export type ConsentStatus = 'granted' | 'revoked' | 'pending'
export type DataKind = 'marketing-contact' | 'invoice' | 'support-ticket' | 'generated-artifact'
export type AdvertisingChannel = 'email' | 'sms' | 'ads'
export type DecisionStatus = 'allowed' | 'blocked' | 'review-required'

export interface ConsentRecord {
  subjectId: string
  status: ConsentStatus
  marketingAllowed: boolean
  suppression: boolean
  lawfulBasis: 'consent' | 'contract' | 'legal-obligation'
  updatedAt: string
}

export interface RetentionRule {
  dataKind: DataKind
  retentionDays: number
  deletionRequired: boolean
  owner: string
}

export interface GrievanceWorkflow {
  stage: 'intake' | 'investigation' | 'resolution'
  targetHours: number
  owner: string
}

export interface GovernanceCheckpoint {
  id: string
  domain:
    | 'privacy-consent'
    | 'grievance'
    | 'gst-documentation'
    | 'advertising-compliance'
    | 'document-governance'
    | 'subprocessor-governance'
    | 'suppression'
    | 'policy-enforcement'
  control: string
  owner: string
  visibleSurface: string
}

export interface ComplianceDecisionInput {
  subjectId: string
  channel: AdvertisingChannel
  requiresMarketingConsent: boolean
  dataKind: DataKind
  createdAt: string
  asOf: string
}

export interface ComplianceDecision {
  status: DecisionStatus
  reasons: string[]
  requiredActions: string[]
}

export const consentRegistry: ConsentRecord[] = [
  {
    subjectId: 'cust-active',
    status: 'granted',
    marketingAllowed: true,
    suppression: false,
    lawfulBasis: 'consent',
    updatedAt: '2026-08-07T10:00:00Z',
  },
  {
    subjectId: 'cust-suppressed',
    status: 'granted',
    marketingAllowed: false,
    suppression: true,
    lawfulBasis: 'consent',
    updatedAt: '2026-08-07T10:05:00Z',
  },
  {
    subjectId: 'cust-contract-only',
    status: 'pending',
    marketingAllowed: false,
    suppression: false,
    lawfulBasis: 'contract',
    updatedAt: '2026-08-07T10:10:00Z',
  },
]

export const retentionRules: RetentionRule[] = [
  {
    dataKind: 'marketing-contact',
    retentionDays: 365,
    deletionRequired: true,
    owner: 'privacy-operations',
  },
  {
    dataKind: 'invoice',
    retentionDays: 2555,
    deletionRequired: false,
    owner: 'finance-operations',
  },
  {
    dataKind: 'support-ticket',
    retentionDays: 730,
    deletionRequired: true,
    owner: 'support-operations',
  },
  {
    dataKind: 'generated-artifact',
    retentionDays: 365,
    deletionRequired: true,
    owner: 'platform-governance',
  },
]

export const grievanceWorkflow: GrievanceWorkflow[] = [
  { stage: 'intake', targetHours: 24, owner: 'compliance-operations' },
  { stage: 'investigation', targetHours: 72, owner: 'compliance-operations' },
  { stage: 'resolution', targetHours: 120, owner: 'compliance-operations' },
]

export const governanceCheckpoints: GovernanceCheckpoint[] = [
  {
    id: 'P1',
    domain: 'privacy-consent',
    control: 'Consent state is required before marketing outreach',
    owner: 'privacy-operations',
    visibleSurface: 'consent ledger',
  },
  {
    id: 'P2',
    domain: 'grievance',
    control: 'Grievances follow intake-to-resolution SLA stages',
    owner: 'compliance-operations',
    visibleSurface: 'grievance queue',
  },
  {
    id: 'P3',
    domain: 'gst-documentation',
    control: 'GST-supporting documentation is governed and retained',
    owner: 'finance-operations',
    visibleSurface: 'billing document controls',
  },
  {
    id: 'P4',
    domain: 'advertising-compliance',
    control: 'Outbound campaigns must respect consent and suppression',
    owner: 'marketing-operations',
    visibleSurface: 'campaign approval surface',
  },
  {
    id: 'P5',
    domain: 'document-governance',
    control: 'Documents follow retention and deletion handling',
    owner: 'platform-governance',
    visibleSurface: 'document lifecycle controls',
  },
  {
    id: 'P6',
    domain: 'subprocessor-governance',
    control: 'Subprocessor usage requires governance evidence and review',
    owner: 'privacy-operations',
    visibleSurface: 'subprocessor register',
  },
  {
    id: 'P7',
    domain: 'suppression',
    control: 'Suppression opt-outs override delivery intent',
    owner: 'privacy-operations',
    visibleSurface: 'suppression registry',
  },
  {
    id: 'P8',
    domain: 'policy-enforcement',
    control: 'Policy enforcement points emit runtime evidence',
    owner: 'platform-governance',
    visibleSurface: 'policy enforcement events',
  },
]

export function getConsentRecord(subjectId: string): ConsentRecord | undefined {
  return consentRegistry.find((record) => record.subjectId === subjectId)
}

export function isSuppressed(subjectId: string): boolean {
  return getConsentRecord(subjectId)?.suppression ?? false
}

export function getRetentionRule(dataKind: DataKind): RetentionRule | undefined {
  return retentionRules.find((rule) => rule.dataKind === dataKind)
}

export function isRetentionExpired(
  dataKind: DataKind,
  createdAt: string,
  asOf: string,
): boolean {
  const rule = getRetentionRule(dataKind)
  if (!rule) return false

  const created = new Date(createdAt).getTime()
  const current = new Date(asOf).getTime()
  const ageDays = Math.floor((current - created) / (1000 * 60 * 60 * 24))

  return rule.deletionRequired && ageDays > rule.retentionDays
}

export function canSendMarketing(
  subjectId: string,
  _channel: AdvertisingChannel,
): boolean {
  const record = getConsentRecord(subjectId)
  if (!record) return false
  if (record.suppression) return false
  if (record.status !== 'granted') return false
  return record.marketingAllowed
}

export function buildComplianceDecision(
  input: ComplianceDecisionInput,
): ComplianceDecision {
  const reasons: string[] = []
  const requiredActions: string[] = []

  if (input.requiresMarketingConsent && !canSendMarketing(input.subjectId, input.channel)) {
    reasons.push('Marketing delivery is not permitted by current consent/suppression state.')
    requiredActions.push('Block outreach and surface consent/suppression review.')
  }

  if (isSuppressed(input.subjectId)) {
    reasons.push('Suppression state is active.')
    requiredActions.push('Respect opt-out and prevent downstream delivery.')
  }

  if (isRetentionExpired(input.dataKind, input.createdAt, input.asOf)) {
    reasons.push('Retention window is expired for deletable data.')
    requiredActions.push('Queue deletion or privacy review.')
  }

  const status: DecisionStatus =
    reasons.length === 0 ? 'allowed' : reasons.some((reason) => reason.includes('expired')) ? 'review-required' : 'blocked'

  if (status === 'allowed') {
    requiredActions.push('Record compliant execution evidence.')
  }

  return {
    status,
    reasons,
    requiredActions,
  }
}

export function isComplianceBaselineOperational(): boolean {
  return (
    consentRegistry.length >= 3 &&
    retentionRules.length >= 4 &&
    grievanceWorkflow.length === 3 &&
    governanceCheckpoints.length >= 8 &&
    grievanceWorkflow.every((stage) => stage.targetHours > 0) &&
    retentionRules.some((rule) => rule.deletionRequired) &&
    governanceCheckpoints.some((checkpoint) => checkpoint.domain === 'policy-enforcement') &&
    governanceCheckpoints.some((checkpoint) => checkpoint.domain === 'suppression')
  )
}
