import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearWorkflowMutationRuntimeState } from "@/lib/commercial/workflow-mutation-runtime-state"

const storeMocks = vi.hoisted(() => ({
  activateContract: vi.fn(),
  getMediaBalanceAccountSnapshot: vi.fn(),
  markInvoicePaid: vi.fn(),
  releaseMediaBalance: vi.fn(),
  renewSubscription: vi.fn(),
  reserveMediaBalance: vi.fn(),
  resolveApprovalRequest: vi.fn(),
  spendReservedMediaBalance: vi.fn(),
}))

const persistenceRuntimeMocks = vi.hoisted(() => ({
  getPersistenceService: vi.fn(),
}))

vi.mock("@/lib/commercial/store", () => ({
  activateContract: storeMocks.activateContract,
  getMediaBalanceAccountSnapshot: storeMocks.getMediaBalanceAccountSnapshot,
  markInvoicePaid: storeMocks.markInvoicePaid,
  releaseMediaBalance: storeMocks.releaseMediaBalance,
  renewSubscription: storeMocks.renewSubscription,
  reserveMediaBalance: storeMocks.reserveMediaBalance,
  resolveApprovalRequest: storeMocks.resolveApprovalRequest,
  spendReservedMediaBalance: storeMocks.spendReservedMediaBalance,
}))

vi.mock("@/lib/commercial/persistence-runtime", () => ({
  getPersistenceService: persistenceRuntimeMocks.getPersistenceService,
}))

import {
  activateContractRuntime,
  getCommercialPersistenceMode,
  getMediaBalanceAccountSnapshotRuntime,
  markInvoicePaidRuntime,
  releaseMediaBalanceRuntime,
  renewSubscriptionRuntime,
  reserveMediaBalanceRuntime,
  resolveApprovalRequestRuntime,
  spendMediaBalanceRuntime,
} from "@/lib/commercial/runtime"

describe("commercial runtime", () => {
  const originalMode = process.env.COMMERCIAL_PERSISTENCE_MODE
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.clearAllMocks()
    clearWorkflowMutationRuntimeState()
    delete process.env.COMMERCIAL_PERSISTENCE_MODE
    process.env.NODE_ENV = "test"
  })

  afterEach(() => {
    clearWorkflowMutationRuntimeState()

    if (typeof originalMode === "undefined") {
      delete process.env.COMMERCIAL_PERSISTENCE_MODE
    } else {
      process.env.COMMERCIAL_PERSISTENCE_MODE = originalMode
    }

    if (typeof originalNodeEnv === "undefined") {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }
  })

  it("defaults to store mode in tests", async () => {
    storeMocks.getMediaBalanceAccountSnapshot.mockReturnValue({
      tenantId: "tenant_1",
      availableBalance: 22000,
    })

    expect(getCommercialPersistenceMode()).toBe("store")

    await expect(getMediaBalanceAccountSnapshotRuntime("tenant_1")).resolves.toEqual({
      tenantId: "tenant_1",
      availableBalance: 22000,
    })

    expect(storeMocks.getMediaBalanceAccountSnapshot).toHaveBeenCalledWith("tenant_1")
    expect(persistenceRuntimeMocks.getPersistenceService).not.toHaveBeenCalled()
  })

  it("uses persistence runtime for media-balance mutations in supabase mode", async () => {
    process.env.COMMERCIAL_PERSISTENCE_MODE = "supabase"

    const persistenceService = {
      getMediaBalanceAccountSnapshot: vi.fn(),
      reserveMediaBalance: vi.fn().mockResolvedValue({ ok: true, kind: "reserve" }),
      releaseMediaBalance: vi.fn().mockResolvedValue({ ok: true, kind: "release" }),
      spendMediaBalance: vi.fn().mockResolvedValue({ ok: true, kind: "spend" }),
    }

    persistenceRuntimeMocks.getPersistenceService.mockReturnValue(persistenceService)

    await expect(
      reserveMediaBalanceRuntime({
        tenantId: "tenant_1",
        amount: 1000,
        reservedByUserId: "user_ops",
        reason: "launch",
      }),
    ).resolves.toEqual({ ok: true, kind: "reserve" })

    await expect(
      releaseMediaBalanceRuntime({
        tenantId: "tenant_1",
        amount: 300,
        releasedByUserId: "user_ops",
        reason: "rollback",
      }),
    ).resolves.toEqual({ ok: true, kind: "release" })

    await expect(
      spendMediaBalanceRuntime({
        tenantId: "tenant_1",
        amount: 700,
        spentByUserId: "user_ops",
        reason: "campaign spend",
      }),
    ).resolves.toEqual({ ok: true, kind: "spend" })

    expect(persistenceService.reserveMediaBalance).toHaveBeenCalledTimes(1)
    expect(persistenceService.releaseMediaBalance).toHaveBeenCalledTimes(1)
    expect(persistenceService.spendMediaBalance).toHaveBeenCalledTimes(1)
  })

  it("uses persistence runtime for workflow mutations in supabase mode when available", async () => {
    process.env.COMMERCIAL_PERSISTENCE_MODE = "supabase"

    const persistenceService = {
      getMediaBalanceAccountSnapshot: vi.fn(),
      reserveMediaBalance: vi.fn(),
      releaseMediaBalance: vi.fn(),
      spendMediaBalance: vi.fn(),
      resolveApprovalRequest: vi.fn().mockResolvedValue({ status: "approved" }),
      activateContract: vi.fn().mockResolvedValue({ id: "contract_1", status: "active" }),
      markInvoicePaid: vi.fn().mockResolvedValue({ id: "invoice_1", status: "paid" }),
      renewSubscription: vi.fn().mockResolvedValue({ id: "subscription_1", status: "active" }),
    }

    persistenceRuntimeMocks.getPersistenceService.mockReturnValue(persistenceService)

    await expect(
      resolveApprovalRequestRuntime({
        approvalRequestId: "approval_1",
        approverUserId: "user_finance",
        decision: "approve",
        note: "approved",
        operationKey: "approval-resolve:approval_1:approve",
      }),
    ).resolves.toEqual({ status: "approved" })

    await expect(
      activateContractRuntime({
        contractId: "contract_1",
        activatedByUserId: "user_legal",
        effectiveAt: "2026-07-29T00:00:00.000Z",
        operationKey: "contract-activate:contract_1",
      }),
    ).resolves.toEqual({ id: "contract_1", status: "active" })

    await expect(
      markInvoicePaidRuntime({
        invoiceId: "invoice_1",
        paidByUserId: "user_finance",
        paidAt: "2026-07-29T00:00:00.000Z",
        operationKey: "invoice-mark-paid:invoice_1",
      }),
    ).resolves.toEqual({ id: "invoice_1", status: "paid" })

    await expect(
      renewSubscriptionRuntime({
        subscriptionId: "subscription_1",
        renewedByUserId: "user_billing",
        renewedAt: "2026-07-29T00:00:00.000Z",
        operationKey: "subscription-renew:subscription_1",
      }),
    ).resolves.toEqual({ id: "subscription_1", status: "active" })

    expect(persistenceService.resolveApprovalRequest).toHaveBeenCalledTimes(1)
    expect(persistenceService.activateContract).toHaveBeenCalledTimes(1)
    expect(persistenceService.markInvoicePaid).toHaveBeenCalledTimes(1)
    expect(persistenceService.renewSubscription).toHaveBeenCalledTimes(1)
  })

  it("falls back to store for workflow mutations when persistence runtime does not expose them", async () => {
    process.env.COMMERCIAL_PERSISTENCE_MODE = "supabase"

    persistenceRuntimeMocks.getPersistenceService.mockReturnValue({
      getMediaBalanceAccountSnapshot: vi.fn(),
      reserveMediaBalance: vi.fn(),
      releaseMediaBalance: vi.fn(),
      spendMediaBalance: vi.fn(),
    })

    storeMocks.activateContract.mockReturnValue({
      id: "contract_store",
      status: "active",
    })

    await expect(
      activateContractRuntime({
        contractId: "contract_store",
        activatedByUserId: "user_store",
      }),
    ).resolves.toEqual({
      id: "contract_store",
      status: "active",
    })

    expect(storeMocks.activateContract).toHaveBeenCalledWith({
      contractId: "contract_store",
      activatedByUserId: "user_store",
    })
  })

  it("deduplicates store workflow mutations when operationKey is reused", async () => {
    const result = {
      status: "approved",
      approvalRequestId: "approval_1",
    }

    storeMocks.resolveApprovalRequest.mockReturnValue(result)

    await expect(
      resolveApprovalRequestRuntime({
        approvalRequestId: "approval_1",
        approverUserId: "user_finance",
        decision: "approve",
        operationKey: "approval-resolve:approval_1:approve",
      }),
    ).resolves.toEqual(result)

    await expect(
      resolveApprovalRequestRuntime({
        approvalRequestId: "approval_1",
        approverUserId: "user_finance",
        decision: "approve",
        operationKey: "approval-resolve:approval_1:approve",
      }),
    ).resolves.toEqual(result)

    expect(storeMocks.resolveApprovalRequest).toHaveBeenCalledTimes(1)
  })

  it("deduplicates persistence workflow mutations when operationKey is reused", async () => {
    process.env.COMMERCIAL_PERSISTENCE_MODE = "supabase"

    const persistenceService = {
      getMediaBalanceAccountSnapshot: vi.fn(),
      reserveMediaBalance: vi.fn(),
      releaseMediaBalance: vi.fn(),
      spendMediaBalance: vi.fn(),
      markInvoicePaid: vi.fn().mockResolvedValue({
        id: "invoice_1",
        status: "paid",
      }),
    }

    persistenceRuntimeMocks.getPersistenceService.mockReturnValue(persistenceService)

    await expect(
      markInvoicePaidRuntime({
        invoiceId: "invoice_1",
        paidByUserId: "user_finance",
        operationKey: "invoice-mark-paid:invoice_1",
      }),
    ).resolves.toEqual({
      id: "invoice_1",
      status: "paid",
    })

    await expect(
      markInvoicePaidRuntime({
        invoiceId: "invoice_1",
        paidByUserId: "user_finance",
        operationKey: "invoice-mark-paid:invoice_1",
      }),
    ).resolves.toEqual({
      id: "invoice_1",
      status: "paid",
    })

    expect(persistenceService.markInvoicePaid).toHaveBeenCalledTimes(1)
  })
})