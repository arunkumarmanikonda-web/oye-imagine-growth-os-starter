export type DecisionStatus = 'accepted' | 'proposed'
export type RiskSeverity = 'critical' | 'high' | 'medium'
export type BuildBuyDecision = 'build' | 'buy' | 'hybrid'
export type ControlDomain =
  | 'identity'
  | 'data-protection'
  | 'tenant-isolation'
  | 'auditability'
  | 'privacy'
  | 'governance'

export interface CompetitorMatrixEntry {
  category: string
  buildStrength: string
  marketExpectation: string
  decision: BuildBuyDecision
}

export interface ApiFeasibilityEntry {
  integration: string
  feasibility: 'high' | 'medium' | 'low'
  rationale: string
}

export interface ComplianceEntry {
  framework: string
  readiness: 'baseline' | 'needs-hardening'
  owner: string
}

export interface RiskEntry {
  id: string
  statement: string
  severity: RiskSeverity
  owner: string
  linkedControlIds: string[]
}

export interface AdrEntry {
  id: string
  title: string
  status: DecisionStatus
  owner: string
  decision: string
}

export interface BuildBuyEntry {
  capability: string
  decision: BuildBuyDecision
  rationale: string
}

export interface ControlEntry {
  id: string
  domain: ControlDomain
  title: string
  owner: string
  baseline: string
}

export const competitorMatrix: CompetitorMatrixEntry[] = [
  {
    category: 'Enterprise AI workspace',
    buildStrength: 'governed domain truth and workflow fit',
    marketExpectation: 'secure tenant-aware copilots with traceability',
    decision: 'build',
  },
  {
    category: 'Retrieval and orchestration platform',
    buildStrength: 'product-specific grounding rules',
    marketExpectation: 'fast retrieval with evidence trails',
    decision: 'hybrid',
  },
  {
    category: 'Security and privacy control plane',
    buildStrength: 'platform ownership of policy enforcement',
    marketExpectation: 'auditable controls and enterprise readiness',
    decision: 'build',
  },
]

export const apiFeasibilityMatrix: ApiFeasibilityEntry[] = [
  {
    integration: 'Identity provider / SSO',
    feasibility: 'high',
    rationale: 'well understood enterprise pattern with established adapters',
  },
  {
    integration: 'Audit event export',
    feasibility: 'high',
    rationale: 'append-only event delivery is operationally straightforward',
  },
  {
    integration: 'Document and records connectors',
    feasibility: 'medium',
    rationale: 'connector breadth is feasible but needs staged rollout and policy filters',
  },
]

export const complianceMatrix: ComplianceEntry[] = [
  { framework: 'SOC 2', readiness: 'baseline', owner: 'platform-security' },
  { framework: 'GDPR', readiness: 'baseline', owner: 'privacy-operations' },
  { framework: 'ISO 27001', readiness: 'needs-hardening', owner: 'platform-security' },
]

export const riskRegister: RiskEntry[] = [
  {
    id: 'R1',
    statement: 'Cross-tenant data exposure through retrieval or orchestration context bleed',
    severity: 'critical',
    owner: 'platform-security',
    linkedControlIds: ['C3', 'C4'],
  },
  {
    id: 'R2',
    statement: 'Unbounded action execution without role or approval guardrails',
    severity: 'high',
    owner: 'product-governance',
    linkedControlIds: ['C1', 'C6'],
  },
  {
    id: 'R3',
    statement: 'Retention and deletion obligations not traceable across AI-generated artifacts',
    severity: 'high',
    owner: 'privacy-operations',
    linkedControlIds: ['C5', 'C6'],
  },
]

export const architectureDecisionRecords: AdrEntry[] = [
  {
    id: 'ADR-001',
    title: 'Governed truth boundary',
    status: 'accepted',
    owner: 'platform-architecture',
    decision: 'All explain/action/orchestration layers must ground on governed records or approved policy sources.',
  },
  {
    id: 'ADR-002',
    title: 'Role-aware action gating',
    status: 'accepted',
    owner: 'platform-architecture',
    decision: 'Actions require explicit role scope and approval pathways before execution surfaces are enabled.',
  },
  {
    id: 'ADR-003',
    title: 'Tenant isolation first',
    status: 'accepted',
    owner: 'platform-security',
    decision: 'Tenant boundaries are enforced at retrieval, action, orchestration, logging, and storage layers.',
  },
  {
    id: 'ADR-004',
    title: 'Audit-first platform events',
    status: 'accepted',
    owner: 'platform-security',
    decision: 'High-value changes and AI-assisted actions emit durable audit events with actor, target, and reason context.',
  },
]

export const buildVsBuyDecisions: BuildBuyEntry[] = [
  {
    capability: 'Role-aware policy enforcement',
    decision: 'build',
    rationale: 'Core product governance must remain platform-native.',
  },
  {
    capability: 'Commodity identity federation',
    decision: 'buy',
    rationale: 'Leverage enterprise-grade identity providers rather than recreating SSO primitives.',
  },
  {
    capability: 'Connector and retrieval acceleration',
    decision: 'hybrid',
    rationale: 'Use external foundations selectively while preserving governed mediation in-platform.',
  },
]

export const securityPrivacyControlInventory: ControlEntry[] = [
  {
    id: 'C1',
    domain: 'identity',
    title: 'Role-aware identity and approval controls',
    owner: 'platform-security',
    baseline: 'Authentication, route guards, and approval boundaries are explicit.',
  },
  {
    id: 'C2',
    domain: 'data-protection',
    title: 'Secrets and token handling baseline',
    owner: 'platform-security',
    baseline: 'Secrets are managed through controlled runtime paths and excluded from unsafe surfaces.',
  },
  {
    id: 'C3',
    domain: 'tenant-isolation',
    title: 'Tenant-scoped retrieval and workspace boundaries',
    owner: 'platform-security',
    baseline: 'Retrieval, workspace context, and action surfaces enforce tenant scope.',
  },
  {
    id: 'C4',
    domain: 'auditability',
    title: 'Durable audit event trail',
    owner: 'platform-operations',
    baseline: 'Critical AI and operator actions emit durable evidence.',
  },
  {
    id: 'C5',
    domain: 'privacy',
    title: 'Retention, deletion, and DSR baseline',
    owner: 'privacy-operations',
    baseline: 'Data lifecycle duties are named and mapped to responsible owners.',
  },
  {
    id: 'C6',
    domain: 'governance',
    title: 'Decision register and control ownership',
    owner: 'platform-architecture',
    baseline: 'ADRs, risks, and control owners are formalized for review.',
  },
]

export function getCriticalRisks(): RiskEntry[] {
  return riskRegister.filter((risk) => risk.severity === 'critical')
}

export function getControlsByDomain(domain: ControlDomain): ControlEntry[] {
  return securityPrivacyControlInventory.filter((control) => control.domain === domain)
}

export function isArchitectureBaselineClosureReady(): boolean {
  return (
    competitorMatrix.length >= 3 &&
    apiFeasibilityMatrix.length >= 3 &&
    complianceMatrix.length >= 3 &&
    riskRegister.length >= 3 &&
    architectureDecisionRecords.length >= 4 &&
    buildVsBuyDecisions.length >= 3 &&
    securityPrivacyControlInventory.length >= 6 &&
    riskRegister.every((risk) => risk.linkedControlIds.length > 0) &&
    architectureDecisionRecords.every((adr) => adr.status === 'accepted')
  )
}
