import { beforeEach, describe, expect, it } from "vitest"

import { GET as getMediaBalanceAccountRoute } from "@/app/api/admin/commercial/media-balance/account/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial media balance account route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns 400 when tenantId is missing", async () => {
    const response = await getMediaBalanceAccountRoute(
      new Request("http://localhost/api/admin/commercial/media-balance/account", {
        method: "GET",
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "tenantId is required.",
    })
  })

  it("returns seeded media balance account snapshot", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await getMediaBalanceAccountRoute(
      new Request(
        `http://localhost/api/admin/commercial/media-balance/account?tenantId=${encodeURIComponent(seed.tenant.id)}`,
        { method: "GET" },
      ),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.mediaBalanceAccount).toEqual(
      expect.objectContaining({
        availableBalance: 25000,
        reservedBalance: 0,
      }),
    )
    expect(payload.ledgerEntries).toEqual([])
  })
})