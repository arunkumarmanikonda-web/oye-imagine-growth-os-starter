import {
  activateContract as activateContractStore,
  getMediaBalanceAccountSnapshot as getStoreMediaBalanceAccountSnapshot,
  markInvoicePaid as markInvoicePaidStore,
  releaseMediaBalance as releaseStoreMediaBalance,
  renewSubscription as renewSubscriptionStore,
  reserveMediaBalance as reserveStoreMediaBalance,
  resolveApprovalRequest as resolveApprovalRequestStore,
  spendReservedMediaBalance as spendReservedMediaBalanceStore,
} from "./store"
import { getPersistenceService } from "./persistence-runtime"
import {
  getWorkflowMutationRuntimeResult,
  setWorkflowMutationRuntimeResult,
} from "./workflow-mutation-runtime-state"

export type CommercialPersistenceMode = "store" | "supabase"

type RuntimeMutationInput = {
  tenantId: string
  amount: number
  currency?: string
  operationKey?: string
  actorId?: string
  reference?: string | null
  payload?: Record<string, unknown>
  reservedByUserId?: string
  releasedByUserId?: string
  spentByUserId?: string
  reason?: string
  note?: string | null
  source?: string
  entryType?: string
}

type RuntimeWorkflowInput = {
  operationKey?: string | null
  reference?: string | null
}

type RuntimeApprovalDecisionInput = RuntimeWorkflowInput & {
  approvalRequestId: string
  approverUserId: string
  decision: "approve" | "reject"
  note?: string | null
}

type RuntimeActivateContractInput = RuntimeWorkflowInput & {
  contractId: string
  activatedByUserId: string
  effectiveAt?: string | null
}

type RuntimeMarkInvoicePaidInput = RuntimeWorkflowInput & {
  invoiceId: string
  paidByUserId: string
  paidAt?: string | null
}

type RuntimeRenewSubscriptionInput = RuntimeWorkflowInput & {
  subscriptionId: string
  renewedByUserId: string
  renewedAt?: string | null
}

type DynamicRecord = Record<string, unknown>

function readEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
}

function getPersistenceRuntimeRecord(): DynamicRecord {
  return getPersistenceService() as unknown as DynamicRecord
}

function findRuntimeMethod(names: string[]): ((...args: unknown[]) => unknown) | null {
  const runtime = getPersistenceRuntimeRecord()

  for (const name of names) {
    const candidate = runtime[name]
    if (typeof candidate === "function") {
      return candidate as (...args: unknown[]) => unknown
    }
  }

  return null
}

async function callRequiredRuntimeMethod(names: string[], ...args: unknown[]) {
  const method = findRuntimeMethod(names)
  if (!method) {
    throw new Error(`No compatible persistence runtime method found for: ${names.join(", ")}`)
  }

  return method(...args)
}

function normalizeOperationKey(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

async function runStoreBackedIdempotentWorkflowMutation<T>(
  kind: string,
  operationKey: string | null | undefined,
  execute: () => Promise<T> | T,
): Promise<T> {
  const normalizedOperationKey = normalizeOperationKey(operationKey)

  if (normalizedOperationKey) {
    const cached = getWorkflowMutationRuntimeResult<T>(normalizedOperationKey)
    if (typeof cached !== "undefined") {
      return cached
    }
  }

  const result = await execute()

  if (normalizedOperationKey) {
    setWorkflowMutationRuntimeResult(normalizedOperationKey, kind, result)
  }

  return result
}

export function getCommercialPersistenceMode(): CommercialPersistenceMode {
  const forcedMode = readEnv(["COMMERCIAL_PERSISTENCE_MODE"])
  if (forcedMode === "store" || forcedMode === "supabase") {
    return forcedMode
  }

  if (process.env.NODE_ENV === "test") {
    return "store"
  }

  const url = readEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"])
  const key = readEnv(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"])
  return url && key ? "supabase" : "store"
}

export async function getMediaBalanceAccountSnapshotRuntime(tenantId: string) {
  if (getCommercialPersistenceMode() === "supabase") {
    return callRequiredRuntimeMethod(["getMediaBalanceAccountSnapshot"], tenantId)
  }

  return getStoreMediaBalanceAccountSnapshot(tenantId)
}

export async function reserveMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === "supabase") {
    return callRequiredRuntimeMethod(["reserveMediaBalance"], input)
  }

  return (reserveStoreMediaBalance as unknown as (value: RuntimeMutationInput) => unknown)(input)
}

export async function releaseMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === "supabase") {
    return callRequiredRuntimeMethod(["releaseMediaBalance"], input)
  }

  return (releaseStoreMediaBalance as unknown as (value: RuntimeMutationInput) => unknown)(input)
}

export async function spendMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === "supabase") {
    return callRequiredRuntimeMethod(["spendMediaBalance"], input)
  }

  return (spendReservedMediaBalanceStore as unknown as (value: RuntimeMutationInput) => unknown)(input)
}

export async function resolveApprovalRequestRuntime(input: RuntimeApprovalDecisionInput) {
  if (getCommercialPersistenceMode() === "supabase") {
    const method = findRuntimeMethod(["resolveApprovalRequest", "resolveApproval"])
    if (method) {
      return method(input)
    }
  }

  return runStoreBackedIdempotentWorkflowMutation(
    "approval-resolve",
    input.operationKey,
    async () =>
      (resolveApprovalRequestStore as unknown as (value: RuntimeApprovalDecisionInput) => unknown)(input),
  )
}

export async function activateContractRuntime(input: RuntimeActivateContractInput) {
  if (getCommercialPersistenceMode() === "supabase") {
    const method = findRuntimeMethod(["activateContract"])
    if (method) {
      return method(input)
    }
  }

  return runStoreBackedIdempotentWorkflowMutation(
    "contract-activate",
    input.operationKey,
    async () =>
      (activateContractStore as unknown as (value: RuntimeActivateContractInput) => unknown)(input),
  )
}

export async function markInvoicePaidRuntime(input: RuntimeMarkInvoicePaidInput) {
  if (getCommercialPersistenceMode() === "supabase") {
    const method = findRuntimeMethod(["markInvoicePaid", "payInvoice"])
    if (method) {
      return method(input)
    }
  }

  return runStoreBackedIdempotentWorkflowMutation(
    "invoice-mark-paid",
    input.operationKey,
    async () =>
      (markInvoicePaidStore as unknown as (value: RuntimeMarkInvoicePaidInput) => unknown)(input),
  )
}

export async function renewSubscriptionRuntime(input: RuntimeRenewSubscriptionInput) {
  if (getCommercialPersistenceMode() === "supabase") {
    const method = findRuntimeMethod(["renewSubscription"])
    if (method) {
      return method(input)
    }
  }

  return runStoreBackedIdempotentWorkflowMutation(
    "subscription-renew",
    input.operationKey,
    async () =>
      (renewSubscriptionStore as unknown as (value: RuntimeRenewSubscriptionInput) => unknown)(input),
  )
}