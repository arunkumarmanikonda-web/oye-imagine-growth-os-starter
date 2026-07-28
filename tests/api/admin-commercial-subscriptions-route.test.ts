import { beforeEach, describe, expect, it } from "vitest"

import { GET as getSubscriptionsRoute } from "@/app/api/admin/commercial/subscriptions/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial subscriptions route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns an empty collection before seeding", async () => {
    const response = await getSubscriptionsRoute(
      new Request("http://localhost/api/admin/commercial/subscriptions", {
        method: "GET",
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(0)
    expect(payload.items).toEqual([])
  })

  it("returns seeded subscriptions and supports tenant filtering", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await getSubscriptionsRoute(
      new Request(
        `http://localhost/api/admin/commercial/subscriptions?tenantId=${encodeURIComponent(seed.tenant.id)}`,
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
        status: "active",
        amount: 75000,
        currency: "INR",
      }),
    ])
  })
})