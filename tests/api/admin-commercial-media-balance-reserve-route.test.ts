import { beforeEach, describe, expect, it } from "vitest"

import { POST as reserveMediaBalanceRoute } from "@/app/api/admin/commercial/media-balance/reserve/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial media balance reserve route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("reserves available balance for a tenant", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await reserveMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance/reserve", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 4000,
          reservedByUserId: "user_finance",
          reason: "Reserve for launch burst",
        }),
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.mediaBalanceAccount).toEqual(
      expect.objectContaining({
        availableBalance: 21000,
        reservedBalance: 4000,
      }),
    )
  })

  it("returns 409 when available balance is insufficient", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await reserveMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance/reserve", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 999999,
          reservedByUserId: "user_finance",
        }),
      }),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: "Insufficient available media balance.",
    })
  })
})