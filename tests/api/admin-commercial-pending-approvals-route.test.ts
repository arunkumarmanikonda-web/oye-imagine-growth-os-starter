import { beforeEach, describe, expect, it } from "vitest"

import { GET as getPendingApprovalsRoute } from "@/app/api/admin/commercial/pending-approvals/route"
import {
  requestMediaBalanceAdjustment,
  resetCommercialState,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store"

describe("admin commercial pending approvals route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns an empty queue when no approvals are pending", async () => {
    seedNeejeeCommercialState()

    const response = await getPendingApprovalsRoute()
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(0)
    expect(payload.items).toEqual([])
  })

  it("returns pending approval requests after high-value media balance adjustments", async () => {
    const seed = seedNeejeeCommercialState()

    const result = requestMediaBalanceAdjustment({
      tenantId: seed.tenant.id,
      amount: 9000,
      requestedByUserId: "user_requester",
      reason: "Launch allocation",
    })

    expect(result.status).toBe("approval_required")

    const response = await getPendingApprovalsRoute()
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(1)
    expect(payload.items).toEqual([
      expect.objectContaining({
        tenantId: seed.tenant.id,
        actionType: "media_balance_adjustment",
        status: "pending",
        requestedByUserId: "user_requester",
        payload: expect.objectContaining({
          amount: 9000,
          reason: "Launch allocation",
        }),
      }),
    ])
  })
})