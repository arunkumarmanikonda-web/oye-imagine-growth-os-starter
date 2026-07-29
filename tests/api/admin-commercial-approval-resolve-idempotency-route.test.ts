import { beforeEach, describe, expect, it } from "vitest"

import { POST as resolveApprovalRequestRoute } from "@/app/api/admin/commercial/approval-resolve/route"
import {
  getTenantCommercialSnapshot,
  requestMediaBalanceAdjustment,
  resetCommercialState,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store"
import { clearWorkflowMutationRuntimeState } from "@/lib/commercial/workflow-mutation-runtime-state"

describe("admin commercial approval resolve route idempotency", () => {
  beforeEach(() => {
    clearWorkflowMutationRuntimeState()
    resetCommercialState()
  })

  it("returns the original result when the same operationKey is replayed", async () => {
    const seed = seedNeejeeCommercialState()

    const pending = requestMediaBalanceAdjustment({
      tenantId: seed.tenant.id,
      amount: 9000,
      requestedByUserId: "user_requester",
      reason: "Launch allocation",
    })

    expect(pending.status).toBe("approval_required")

    if (pending.status !== "approval_required") {
      throw new Error("Expected approval_required")
    }

    const body = {
      approvalRequestId: pending.approvalRequest.id,
      approverUserId: "user_finance",
      decision: "approve",
      note: "Approved",
      operationKey: "approval-resolve:test",
    }

    const firstResponse = await resolveApprovalRequestRoute(
      new Request("http://localhost/api/admin/commercial/approval-resolve", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    )

    expect(firstResponse.status).toBe(200)
    const firstPayload = await firstResponse.json()

    const secondResponse = await resolveApprovalRequestRoute(
      new Request("http://localhost/api/admin/commercial/approval-resolve", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    )

    expect(secondResponse.status).toBe(200)
    const secondPayload = await secondResponse.json()

    expect(secondPayload).toEqual(firstPayload)

    const snapshot = getTenantCommercialSnapshot(seed.tenant.id)
    expect(snapshot.pendingApprovalCount).toBe(0)
    expect(snapshot.ledgerEntries).toHaveLength(1)
  })
})