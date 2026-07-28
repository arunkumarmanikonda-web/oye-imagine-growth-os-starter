import type {
  ApprovalDecision,
  ApprovalDecisionValue,
  ApprovalPolicy,
  ApprovalRequest,
  AuditEvent,
  Brand,
  CommercialOverview,
  CommercialOverviewTenant,
  CommercialState,
  Contract,
  FeatureEntitlement,
  Invoice,
  InvoiceLineItem,
  LedgerEntry,
  LegalEntity,
  MediaBalanceAccount,
  Organisation,
  Plan,
  Subscription,
  Tenant,
  Workspace,
} from "@/lib/commercial/types"

declare global {
  // eslint-disable-next-line no-var
  var __OYE_COMMERCIAL_STATE__: CommercialState | undefined
}

function nowIso(): string {
  return new Date().toISOString()
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function createInitialCommercialState(): CommercialState {
  return {
    idCounter: 0,
    tenants: [],
    legalEntities: [],
    organisations: [],
    brands: [],
    workspaces: [],
    plans: [],
    featureEntitlements: [],
    subscriptions: [],
    contracts: [],
    invoices: [],
    mediaBalanceAccounts: [],
    ledgerEntries: [],
    approvalPolicies: [],
    approvalRequests: [],
    approvalDecisions: [],
    auditEvents: [],
  }
}

function getState(): CommercialState {
  if (!globalThis.__OYE_COMMERCIAL_STATE__) {
    globalThis.__OYE_COMMERCIAL_STATE__ = createInitialCommercialState()
  }

  return globalThis.__OYE_COMMERCIAL_STATE__
}

function createId(prefix: string): string {
  const state = getState()
  state.idCounter += 1
  return `${prefix}_${String(state.idCounter).padStart(4, "0")}`
}

function recordAuditEvent(input: Omit<AuditEvent, "id" | "createdAt">): AuditEvent {
  const state = getState()
  const event: AuditEvent = {
    id: createId("audit"),
    createdAt: nowIso(),
    ...input,
    beforeState: input.beforeState === undefined ? undefined : clone(input.beforeState),
    afterState: input.afterState === undefined ? undefined : clone(input.afterState),
    metadata: input.metadata ? clone(input.metadata) : undefined,
  }

  state.auditEvents.push(event)
  return event
}

function getTenantOrThrow(tenantId: string): Tenant {
  const tenant = getState().tenants.find((item) => item.id === tenantId)
  if (!tenant) {
    throw new Error(`Tenant not found for id ${tenantId}`)
  }

  return tenant
}

function getMediaBalanceAccountOrThrow(tenantId: string): MediaBalanceAccount {
  const account = getState().mediaBalanceAccounts.find((item) => item.tenantId === tenantId)
  if (!account) {
    throw new Error(`Media balance account not found for tenant ${tenantId}`)
  }

  return account
}

function getPolicyForMediaBalance(tenantId: string): ApprovalPolicy | undefined {
  return getState().approvalPolicies.find(
    (item) =>
      item.tenantId === tenantId &&
      item.actionType === "media_balance_adjustment" &&
      item.active,
  )
}

function applyMediaBalanceAdjustment(input: {
  tenantId: string
  amount: number
  reason: string
  createdByUserId: string
  source: "direct_adjustment" | "approval_adjustment"
}): { account: MediaBalanceAccount; ledgerEntry: LedgerEntry } {
  const state = getState()
  const account = getMediaBalanceAccountOrThrow(input.tenantId)
  const before = clone(account)

  account.availableBalance += input.amount
  account.updatedAt = nowIso()

  const ledgerEntry: LedgerEntry = {
    id: createId("ledger"),
    tenantId: input.tenantId,
    mediaBalanceAccountId: account.id,
    direction: input.amount >= 0 ? "credit" : "debit",
    amount: Math.abs(input.amount),
    balanceAfter: account.availableBalance,
    reason: input.reason,
    source: input.source,
    createdByUserId: input.createdByUserId,
    createdAt: nowIso(),
  }

  state.ledgerEntries.push(ledgerEntry)

  recordAuditEvent({
    tenantId: input.tenantId,
    action: "commercial.media_balance.adjusted",
    resourceType: "media_balance_account",
    resourceId: account.id,
    beforeState: before,
    afterState: clone(account),
    metadata: {
      amount: input.amount,
      reason: input.reason,
      ledgerEntryId: ledgerEntry.id,
      source: input.source,
      createdByUserId: input.createdByUserId,
    },
  })

  return {
    account: clone(account),
    ledgerEntry: clone(ledgerEntry),
  }
}

export function resetCommercialState(): void {
  globalThis.__OYE_COMMERCIAL_STATE__ = createInitialCommercialState()
}

export function seedNeejeeCommercialState(): {
  tenant: Tenant
  legalEntity: LegalEntity
  organisation: Organisation
  brand: Brand
  workspace: Workspace
  plan: Plan
  subscription: Subscription
  contract: Contract
  invoice: Invoice
  mediaBalanceAccount: MediaBalanceAccount
  approvalPolicy: ApprovalPolicy
  featureEntitlements: FeatureEntitlement[]
  overview: CommercialOverview
} {
  const state = getState()
  const existingTenant = state.tenants.find((item) => item.slug === "neejee")

  if (existingTenant) {
    const legalEntity = state.legalEntities.find((item) => item.tenantId === existingTenant.id)!
    const organisation = state.organisations.find((item) => item.tenantId === existingTenant.id)!
    const brand = state.brands.find((item) => item.tenantId === existingTenant.id)!
    const workspace = state.workspaces.find((item) => item.tenantId === existingTenant.id)!
    const subscription = state.subscriptions.find((item) => item.tenantId === existingTenant.id)!
    const contract = state.contracts.find((item) => item.tenantId === existingTenant.id)!
    const invoice = state.invoices.find((item) => item.tenantId === existingTenant.id)!
    const mediaBalanceAccount = state.mediaBalanceAccounts.find((item) => item.tenantId === existingTenant.id)!
    const approvalPolicy = state.approvalPolicies.find((item) => item.tenantId === existingTenant.id)!
    const plan = state.plans.find((item) => item.id === subscription.planId)!
    const featureEntitlements = state.featureEntitlements.filter((item) => item.tenantId === existingTenant.id)

    return {
      tenant: clone(existingTenant),
      legalEntity: clone(legalEntity),
      organisation: clone(organisation),
      brand: clone(brand),
      workspace: clone(workspace),
      plan: clone(plan),
      subscription: clone(subscription),
      contract: clone(contract),
      invoice: clone(invoice),
      mediaBalanceAccount: clone(mediaBalanceAccount),
      approvalPolicy: clone(approvalPolicy),
      featureEntitlements: clone(featureEntitlements),
      overview: getCommercialOverview(),
    }
  }

  const createdAt = nowIso()

  const tenant: Tenant = {
    id: createId("tenant"),
    slug: "neejee",
    name: "Neejee",
    status: "active",
    createdAt,
    updatedAt: createdAt,
  }

  const legalEntity: LegalEntity = {
    id: createId("legal"),
    tenantId: tenant.id,
    legalName: "Neejee Digital Private Limited",
    countryCode: "IN",
    taxId: "27ABCDE1234F1Z5",
    createdAt,
    updatedAt: createdAt,
  }

  const organisation: Organisation = {
    id: createId("org"),
    tenantId: tenant.id,
    legalEntityId: legalEntity.id,
    name: "Neejee Growth Team",
    createdAt,
    updatedAt: createdAt,
  }

  const brand: Brand = {
    id: createId("brand"),
    tenantId: tenant.id,
    organisationId: organisation.id,
    name: "Neejee",
    createdAt,
    updatedAt: createdAt,
  }

  const workspace: Workspace = {
    id: createId("workspace"),
    tenantId: tenant.id,
    organisationId: organisation.id,
    brandId: brand.id,
    name: "Neejee Commercial Workspace",
    createdAt,
    updatedAt: createdAt,
  }

  const plan: Plan = {
    id: createId("plan"),
    code: "growth",
    name: "Growth",
    currency: "INR",
    monthlyPrice: 75000,
    createdAt,
    updatedAt: createdAt,
  }

  const featureEntitlements: FeatureEntitlement[] = [
    {
      id: createId("ent"),
      tenantId: tenant.id,
      planId: plan.id,
      code: "brand_intelligence",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: createId("ent"),
      tenantId: tenant.id,
      planId: plan.id,
      code: "execution_status",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: createId("ent"),
      tenantId: tenant.id,
      planId: plan.id,
      code: "campaign_drafts",
      enabled: true,
      createdAt,
      updatedAt: createdAt,
    },
  ]

  const subscription: Subscription = {
    id: createId("sub"),
    tenantId: tenant.id,
    planId: plan.id,
    status: "active",
    amount: 75000,
    currency: "INR",
    startedAt: createdAt,
    renewedAt: null,
    createdAt,
    updatedAt: createdAt,
  }

  const contract: Contract = {
    id: createId("contract"),
    tenantId: tenant.id,
    contractType: "subscription_order",
    status: "awaiting_signature",
    effectiveAt: null,
    createdAt,
    updatedAt: createdAt,
  }

  const invoiceLineItems: InvoiceLineItem[] = [
    {
      id: createId("invoice_line"),
      description: "Growth plan monthly subscription",
      quantity: 1,
      unitAmount: 75000,
      lineTotal: 75000,
    },
  ]

  const invoice: Invoice = {
    id: createId("invoice"),
    tenantId: tenant.id,
    subscriptionId: subscription.id,
    contractId: contract.id,
    invoiceNumber: "INV-2026-0001",
    status: "issued",
    currency: "INR",
    subtotal: 75000,
    total: 75000,
    issuedAt: createdAt,
    dueAt: createdAt,
    paidAt: null,
    lineItems: invoiceLineItems,
    createdAt,
    updatedAt: createdAt,
  }

  const mediaBalanceAccount: MediaBalanceAccount = {
    id: createId("mba"),
    tenantId: tenant.id,
    currency: "INR",
    availableBalance: 25000,
    reservedBalance: 0,
    createdAt,
    updatedAt: createdAt,
  }

  const approvalPolicy: ApprovalPolicy = {
    id: createId("policy"),
    tenantId: tenant.id,
    actionType: "media_balance_adjustment",
    thresholdAmount: 5000,
    approverRoles: ["finance_approver"],
    active: true,
    createdAt,
    updatedAt: createdAt,
  }

  state.tenants.push(tenant)
  state.legalEntities.push(legalEntity)
  state.organisations.push(organisation)
  state.brands.push(brand)
  state.workspaces.push(workspace)
  state.plans.push(plan)
  state.featureEntitlements.push(...featureEntitlements)
  state.subscriptions.push(subscription)
  state.contracts.push(contract)
  state.invoices.push(invoice)
  state.mediaBalanceAccounts.push(mediaBalanceAccount)
  state.approvalPolicies.push(approvalPolicy)

  recordAuditEvent({
    tenantId: tenant.id,
    action: "commercial.tenant.seeded",
    resourceType: "tenant",
    resourceId: tenant.id,
    afterState: {
      tenant,
      legalEntity,
      organisation,
      brand,
      workspace,
      plan,
      subscription,
      contract,
      invoice,
      mediaBalanceAccount,
      approvalPolicy,
      featureEntitlements,
    },
    metadata: {
      source: "seedNeejeeCommercialState",
    },
  })

  return {
    tenant: clone(tenant),
    legalEntity: clone(legalEntity),
    organisation: clone(organisation),
    brand: clone(brand),
    workspace: clone(workspace),
    plan: clone(plan),
    subscription: clone(subscription),
    contract: clone(contract),
    invoice: clone(invoice),
    mediaBalanceAccount: clone(mediaBalanceAccount),
    approvalPolicy: clone(approvalPolicy),
    featureEntitlements: clone(featureEntitlements),
    overview: getCommercialOverview(),
  }
}

export function getCommercialOverview(): CommercialOverview {
  const state = getState()

  const tenants: CommercialOverviewTenant[] = state.tenants.map((tenant) => {
    const subscription = state.subscriptions.find((item) => item.tenantId === tenant.id)
    const contract = state.contracts.find((item) => item.tenantId === tenant.id)
    const mediaBalanceAccount = state.mediaBalanceAccounts.find((item) => item.tenantId === tenant.id)
    const plan = subscription ? state.plans.find((item) => item.id === subscription.planId) : undefined
    const pendingApprovalCount = state.approvalRequests.filter(
      (item) => item.tenantId === tenant.id && item.status === "pending",
    ).length

    const subscriptionStatus: CommercialOverviewTenant["subscriptionStatus"] =
      subscription?.status ?? "none"
    const contractStatus: CommercialOverviewTenant["contractStatus"] =
      contract?.status ?? "none"

    return {
      tenantId: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      subscriptionStatus,
      contractStatus,
      planCode: plan?.code ?? null,
      mediaBalanceAvailable: mediaBalanceAccount?.availableBalance ?? 0,
      pendingApprovalCount,
    }
  })

  return {
    tenantCount: tenants.length,
    pendingApprovalCount: state.approvalRequests.filter((item) => item.status === "pending").length,
    totalMediaBalanceAvailable: state.mediaBalanceAccounts.reduce(
      (sum, item) => sum + item.availableBalance,
      0,
    ),
    tenants,
  }
}

export function listPendingApprovalRequests(): ApprovalRequest[] {
  return clone(getState().approvalRequests.filter((item) => item.status === "pending"))
}

export function listSubscriptions(tenantId?: string): Subscription[] {
  const items = tenantId
    ? getState().subscriptions.filter((item) => item.tenantId === tenantId)
    : getState().subscriptions

  return clone(items)
}

export function listContracts(tenantId?: string): Contract[] {
  const items = tenantId
    ? getState().contracts.filter((item) => item.tenantId === tenantId)
    : getState().contracts

  return clone(items)
}

export function listInvoices(tenantId?: string): Invoice[] {
  const items = tenantId
    ? getState().invoices.filter((item) => item.tenantId === tenantId)
    : getState().invoices

  return clone(items)
}

export function listLedgerEntries(tenantId?: string): LedgerEntry[] {
  const items = tenantId
    ? getState().ledgerEntries.filter((item) => item.tenantId === tenantId)
    : getState().ledgerEntries

  return clone(items)
}

export function requestMediaBalanceAdjustment(input: {
  tenantId: string
  amount: number
  requestedByUserId: string
  reason: string
}):
  | {
      status: "approval_required"
      approvalRequest: ApprovalRequest
      mediaBalanceAccount: MediaBalanceAccount
    }
  | {
      status: "applied"
      mediaBalanceAccount: MediaBalanceAccount
      ledgerEntry: LedgerEntry
    } {
  getTenantOrThrow(input.tenantId)
  const account = getMediaBalanceAccountOrThrow(input.tenantId)
  const policy = getPolicyForMediaBalance(input.tenantId)
  const thresholdAmount = policy?.thresholdAmount ?? Number.MAX_SAFE_INTEGER

  if (Math.abs(input.amount) >= thresholdAmount) {
    const request: ApprovalRequest = {
      id: createId("approval"),
      tenantId: input.tenantId,
      actionType: "media_balance_adjustment",
      status: "pending",
      requestedByUserId: input.requestedByUserId,
      payload: {
        amount: input.amount,
        reason: input.reason,
      },
      createdAt: nowIso(),
      updatedAt: nowIso(),
      decidedAt: null,
      approverUserId: null,
    }

    getState().approvalRequests.push(request)

    recordAuditEvent({
      tenantId: input.tenantId,
      action: "commercial.approval.requested",
      resourceType: "approval_request",
      resourceId: request.id,
      afterState: request,
      metadata: {
        actionType: request.actionType,
        amount: input.amount,
        reason: input.reason,
        requestedByUserId: input.requestedByUserId,
      },
    })

    return {
      status: "approval_required",
      approvalRequest: clone(request),
      mediaBalanceAccount: clone(account),
    }
  }

  const applied = applyMediaBalanceAdjustment({
    tenantId: input.tenantId,
    amount: input.amount,
    reason: input.reason,
    createdByUserId: input.requestedByUserId,
    source: "direct_adjustment",
  })

  return {
    status: "applied",
    mediaBalanceAccount: applied.account,
    ledgerEntry: applied.ledgerEntry,
  }
}

export function resolveApprovalRequest(input: {
  approvalRequestId: string
  approverUserId: string
  decision: ApprovalDecisionValue
  note?: string | null
}): {
  approvalRequest: ApprovalRequest
  approvalDecision: ApprovalDecision
  mediaBalanceAccount?: MediaBalanceAccount
  ledgerEntry?: LedgerEntry
} {
  const state = getState()
  const approvalRequest = state.approvalRequests.find((item) => item.id === input.approvalRequestId)

  if (!approvalRequest) {
    throw new Error(`Approval request not found for id ${input.approvalRequestId}`)
  }

  if (approvalRequest.status !== "pending") {
    throw new Error(`Approval request ${approvalRequest.id} is already resolved`)
  }

  if (approvalRequest.requestedByUserId === input.approverUserId) {
    throw new Error("Requester cannot approve their own request.")
  }

  const before = clone(approvalRequest)
  approvalRequest.status = input.decision === "approve" ? "approved" : "rejected"
  approvalRequest.approverUserId = input.approverUserId
  approvalRequest.decidedAt = nowIso()
  approvalRequest.updatedAt = approvalRequest.decidedAt

  const approvalDecision: ApprovalDecision = {
    id: createId("decision"),
    approvalRequestId: approvalRequest.id,
    decision: input.decision,
    note: input.note ?? null,
    approverUserId: input.approverUserId,
    createdAt: nowIso(),
  }

  state.approvalDecisions.push(approvalDecision)

  let appliedAccount: MediaBalanceAccount | undefined
  let appliedLedgerEntry: LedgerEntry | undefined

  if (input.decision === "approve") {
    const applied = applyMediaBalanceAdjustment({
      tenantId: approvalRequest.tenantId,
      amount: approvalRequest.payload.amount,
      reason: approvalRequest.payload.reason,
      createdByUserId: input.approverUserId,
      source: "approval_adjustment",
    })

    appliedAccount = applied.account
    appliedLedgerEntry = applied.ledgerEntry
  }

  recordAuditEvent({
    tenantId: approvalRequest.tenantId,
    action: "commercial.approval.resolved",
    resourceType: "approval_request",
    resourceId: approvalRequest.id,
    beforeState: before,
    afterState: clone(approvalRequest),
    metadata: {
      decision: input.decision,
      approverUserId: input.approverUserId,
      note: input.note ?? null,
      approvalDecisionId: approvalDecision.id,
    },
  })

  return {
    approvalRequest: clone(approvalRequest),
    approvalDecision: clone(approvalDecision),
    mediaBalanceAccount: appliedAccount ? clone(appliedAccount) : undefined,
    ledgerEntry: appliedLedgerEntry ? clone(appliedLedgerEntry) : undefined,
  }
}

export function getTenantCommercialSnapshot(tenantId: string): {
  tenant: Tenant
  mediaBalanceAccount: MediaBalanceAccount | null
  pendingApprovalCount: number
  subscriptions: Subscription[]
  contracts: Contract[]
  invoices: Invoice[]
  ledgerEntries: LedgerEntry[]
  auditEvents: AuditEvent[]
} {
  const tenant = getTenantOrThrow(tenantId)
  const state = getState()

  return {
    tenant: clone(tenant),
    mediaBalanceAccount: clone(
      state.mediaBalanceAccounts.find((item) => item.tenantId === tenantId) ?? null,
    ),
    pendingApprovalCount: state.approvalRequests.filter(
      (item) => item.tenantId === tenantId && item.status === "pending",
    ).length,
    subscriptions: clone(state.subscriptions.filter((item) => item.tenantId === tenantId)),
    contracts: clone(state.contracts.filter((item) => item.tenantId === tenantId)),
    invoices: clone(state.invoices.filter((item) => item.tenantId === tenantId)),
    ledgerEntries: clone(state.ledgerEntries.filter((item) => item.tenantId === tenantId)),
    auditEvents: clone(state.auditEvents.filter((item) => item.tenantId === tenantId)),
  }
}

export function getCommercialAuditEvents(tenantId?: string): AuditEvent[] {
  const events = tenantId
    ? getState().auditEvents.filter((item) => item.tenantId === tenantId)
    : getState().auditEvents

  return clone(events)
}