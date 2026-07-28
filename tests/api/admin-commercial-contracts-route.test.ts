import { beforeEach, describe, expect, it } from "vitest"

import { GET as getContractsRoute } from "@/app/api/admin/commercial/contracts/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial contracts route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns an empty collection before seeding", async () => {
    const response = await getContractsRoute(
      new Request("http://localhost/api/admin/commercial/contracts", {
        method: "GET",
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(0)
    expect(payload.items).toEqual([])
  })

  it("returns seeded contracts and supports tenant filtering", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await getContractsRoute(
      new Request(
        `http://localhost/api/admin/commercial/contracts?tenantId=${encodeURIComponent(seed.tenant.id)}`,
        {
          method: "GET",
        },
      ),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(1)
    expect(payload.items).toEqual([
      expect.objectContaining({
        tenantId: seed.tenant.id,
        contractType: "subscription_order",
        status: "awaiting_signature",
      }),
    ])
  })
})