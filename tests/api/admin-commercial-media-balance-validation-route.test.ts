import { beforeEach, describe, expect, it } from "vitest"

import { POST as adjustMediaBalanceRoute } from "@/app/api/admin/commercial/media-balance-adjust/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial media balance validation route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns 400 when tenantId is missing", async () => {
    seedNeejeeCommercialState()

    const response = await adjustMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance-adjust", {
        method: "POST",
        body: JSON.stringify({
          amount: 1000,
          requestedByUserId: "user_ops",
        }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "tenantId is required.",
    })
  })

  it("returns 400 when amount is zero", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await adjustMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance-adjust", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 0,
          requestedByUserId: "user_ops",
        }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "amount must be a non-zero number.",
    })
  })

  it("returns 500 when the tenant does not exist", async () => {
    const response = await adjustMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance-adjust", {
        method: "POST",
        body: JSON.stringify({
          tenantId: "tenant_missing",
          amount: 1200,
          requestedByUserId: "user_ops",
        }),
      }),
    )

    expect(response.status).toBe(500)

    const payload = await response.json()
    expect(payload.error).toMatch(/Tenant not found/)
  })
})