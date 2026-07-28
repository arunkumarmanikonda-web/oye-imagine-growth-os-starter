export type CurrencyCode = "INR" | "USD"
export type TenantStatus = "draft" | "active" | "suspended"
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled"
export type ContractStatus = "draft" | "awaiting_signature" | "active" | "expired" | "cancelled"
export type InvoiceStatus = "draft" | "issued" | "paid" | "void"
export type ApprovalRequestStatus = "pending" | "approved" | "rejected"
export type ApprovalDecisionValue = "approve" | "reject"
export type LedgerEntryDirection = "credit" | "debit"

export interface Tenant {
  id: string
  slug: string
  name: string
  status: TenantStatus
  createdAt: string
  updatedAt: string
}

export interface LegalEntity {
  id: string
  tenantId: string
  legalName: string
  countryCode: string
  taxId: string
  createdAt: string
  updatedAt: string
}

export interface Organisation {
  id: string
  tenantId: string
  legalEntityId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: string
  tenantId: string
  organisationId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  tenantId: string
  organisationId: string
  brandId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  code: string
  name: string
  currency: CurrencyCode
  monthlyPrice: number
  createdAt: string
  updatedAt: string
}

export interface FeatureEntitlement {
  id: string
  tenantId: string
  planId: string
  code: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  tenantId: string
  planId: string
  status: SubscriptionStatus
  amount: number
  currency: CurrencyCode
  startedAt: string
  renewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Contract {
  id: string
  tenantId: string
  contractType: "subscription_order" | "msa" | "sow"
  status: ContractStatus
  effectiveAt: string | null
  createdAt: string
  updatedAt: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitAmount: number
  lineTotal: number
}

export interface Invoice {
  id: string
  tenantId: string
  subscriptionId: string | null
  contractId: string | null
  invoiceNumber: string
  status: InvoiceStatus
  currency: CurrencyCode
  subtotal: number
  total: number
  issuedAt: string | null
  dueAt: string | null
  paidAt: string | null
  lineItems: InvoiceLineItem[]
  createdAt: string
  updatedAt: string
}

export interface MediaBalanceAccount {
  id: string
  tenantId: string
  currency: CurrencyCode
  availableBalance: number
  reservedBalance: number
  createdAt: string
  updatedAt: string
}

export interface LedgerEntry {
  id: string
  tenantId: string
  mediaBalanceAccountId: string
  direction: LedgerEntryDirection
  amount: number
  balanceAfter: number
  reason: string
  source: "direct_adjustment" | "approval_adjustment" | "campaign_spend"
  createdByUserId: string
  createdAt: string
}

export interface ApprovalPolicy {
  id: string
  tenantId: string
  actionType: "media_balance_adjustment"
  thresholdAmount: number
  approverRoles: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ApprovalRequest {
  id: string
  tenantId: string
  actionType: "media_balance_adjustment"
  status: ApprovalRequestStatus
  requestedByUserId: string
  payload: {
    amount: number
    reason: string
  }
  createdAt: string
  updatedAt: string
  decidedAt: string | null
  approverUserId: string | null
}

export interface ApprovalDecision {
  id: string
  approvalRequestId: string
  decision: ApprovalDecisionValue
  note: string | null
  approverUserId: string
  createdAt: string
}

export interface AuditEvent {
  id: string
  tenantId: string
  action: string
  resourceType: string
  resourceId: string
  beforeState?: unknown
  afterState?: unknown
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface CommercialOverviewTenant {
  tenantId: string
  slug: string
  name: string
  subscriptionStatus: SubscriptionStatus | "none"
  contractStatus: ContractStatus | "none"
  planCode: string | null
  mediaBalanceAvailable: number
  pendingApprovalCount: number
}

export interface CommercialOverview {
  tenantCount: number
  pendingApprovalCount: number
  totalMediaBalanceAvailable: number
  tenants: CommercialOverviewTenant[]
}

export interface CommercialState {
  idCounter: number
  tenants: Tenant[]
  legalEntities: LegalEntity[]
  organisations: Organisation[]
  brands: Brand[]
  workspaces: Workspace[]
  plans: Plan[]
  featureEntitlements: FeatureEntitlement[]
  subscriptions: Subscription[]
  contracts: Contract[]
  invoices: Invoice[]
  mediaBalanceAccounts: MediaBalanceAccount[]
  ledgerEntries: LedgerEntry[]
  approvalPolicies: ApprovalPolicy[]
  approvalRequests: ApprovalRequest[]
  approvalDecisions: ApprovalDecision[]
  auditEvents: AuditEvent[]
}