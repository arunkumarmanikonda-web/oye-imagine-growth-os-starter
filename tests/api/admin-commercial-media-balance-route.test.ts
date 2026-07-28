import { beforeEach, describe, expect, it } from "vitest"

import { POST as resolveApprovalRequestRoute } from "@/app/api/admin/commercial/approval-resolve/route"
import { POST as adjustMediaBalanceRoute } from "@/app/api/admin/commercial/media-balance-adjust/route"
import {
  getTenantCommercialSnapshot,
  resetCommercialState,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store"

describe("admin commercial media balance routes", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("creates a pending approval for high-value adjustments and applies it on approval", async () => {
    const seed = seedNeejeeCommercialState()

    const adjustResponse = await adjustMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance-adjust", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 6000,
          requestedByUserId: "user_requester",
          reason: "Top up launch budget",
        }),
      }),
    )

    expect(adjustResponse.status).toBe(202)

    const adjustment = await adjustResponse.json()
    expect(adjustment.approvalRequired).toBe(true)
    expect(adjustment.approvalRequest.status).toBe("pending")

    const resolveResponse = await resolveApprovalRequestRoute(
      new Request("http://localhost/api/admin/commercial/approval-resolve", {
        method: "POST",
        body: JSON.stringify({
          approvalRequestId: adjustment.approvalRequest.id,
          approverUserId: "user_finance",
          decision: "approve",
          note: "Approved for pilot launch",
        }),
      }),
    )

    expect(resolveResponse.status).toBe(200)

    const resolution = await resolveResponse.json()
    expect(resolution.approvalRequest.status).toBe("approved")
    expect(resolution.mediaBalanceAccount.availableBalance).toBe(31000)

    const snapshot = getTenantCommercialSnapshot(seed.tenant.id)
    expect(snapshot.pendingApprovalCount).toBe(0)
    expect(snapshot.mediaBalanceAccount?.availableBalance).toBe(31000)
    expect(snapshot.ledgerEntries).toHaveLength(1)
  })

  it("applies low-value adjustments immediately", async () => {
    const seed = seedNeejeeCommercialState()

    const adjustResponse = await adjustMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance-adjust", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 1200,
          requestedByUserId: "user_ops",
          reason: "Minor credit correction",
        }),
      }),
    )

    expect(adjustResponse.status).toBe(200)

    const adjustment = await adjustResponse.json()
    expect(adjustment.approvalRequired).toBe(false)
    expect(adjustment.mediaBalanceAccount.availableBalance).toBe(26200)

    const snapshot = getTenantCommercialSnapshot(seed.tenant.id)
    expect(snapshot.pendingApprovalCount).toBe(0)
    expect(snapshot.mediaBalanceAccount?.availableBalance).toBe(26200)
    expect(snapshot.ledgerEntries).toHaveLength(1)
  })
})