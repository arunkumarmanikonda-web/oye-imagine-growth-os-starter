import { beforeEach, describe, expect, it } from "vitest"

import { POST as releaseMediaBalanceRoute } from "@/app/api/admin/commercial/media-balance/release/route"
import { POST as reserveMediaBalanceRoute } from "@/app/api/admin/commercial/media-balance/reserve/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial media balance release route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("releases reserved balance back to available", async () => {
    const seed = seedNeejeeCommercialState()

    await reserveMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance/reserve", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 4000,
          reservedByUserId: "user_finance",
          reason: "Reserve before release",
        }),
      }),
    )

    const response = await releaseMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance/release", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 1500,
          releasedByUserId: "user_finance",
          reason: "Release unused funds",
        }),
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.mediaBalanceAccount).toEqual(
      expect.objectContaining({
        availableBalance: 22500,
        reservedBalance: 2500,
      }),
    )
  })
})