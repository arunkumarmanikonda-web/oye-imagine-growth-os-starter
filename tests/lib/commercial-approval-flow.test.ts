import { beforeEach, describe, expect, it } from "vitest"

import {
  getCommercialAuditEvents,
  requestMediaBalanceAdjustment,
  resolveApprovalRequest,
  resetCommercialState,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store"

describe("commercial approval flow store behavior", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("prevents requester self-approval", () => {
    const seed = seedNeejeeCommercialState()
    const pending = requestMediaBalanceAdjustment({
      tenantId: seed.tenant.id,
      amount: 7000,
      requestedByUserId: "user_same",
      reason: "Self-approval should fail",
    })

    expect(pending.status).toBe("approval_required")

    if (pending.status !== "approval_required") {
      throw new Error("Expected approval_required")
    }

    expect(() =>
      resolveApprovalRequest({
        approvalRequestId: pending.approvalRequest.id,
        approverUserId: "user_same",
        decision: "approve",
      }),
    ).toThrow(/Requester cannot approve their own request\./)
  })

  it("records audit events for approval flow", () => {
    const seed = seedNeejeeCommercialState()
    const pending = requestMediaBalanceAdjustment({
      tenantId: seed.tenant.id,
      amount: 7000,
      requestedByUserId: "user_requester",
      reason: "Launch budget approval",
    })

    expect(pending.status).toBe("approval_required")

    if (pending.status !== "approval_required") {
      throw new Error("Expected approval_required")
    }

    resolveApprovalRequest({
      approvalRequestId: pending.approvalRequest.id,
      approverUserId: "user_finance",
      decision: "approve",
      note: "Approved",
    })

    const actions = getCommercialAuditEvents(seed.tenant.id).map((event) => event.action)

    expect(actions).toContain("commercial.tenant.seeded")
    expect(actions).toContain("commercial.approval.requested")
    expect(actions).toContain("commercial.approval.resolved")
    expect(actions).toContain("commercial.media_balance.adjusted")
  })
})