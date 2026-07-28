import { beforeEach, describe, expect, it } from "vitest"

import { POST as renewSubscriptionRoute } from "@/app/api/admin/commercial/subscriptions/renew/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial subscription renew route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("renews a seeded subscription", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await renewSubscriptionRoute(
      new Request("http://localhost/api/admin/commercial/subscriptions/renew", {
        method: "POST",
        body: JSON.stringify({
          subscriptionId: seed.subscription.id,
          renewedByUserId: "user_billing",
        }),
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.subscription).toEqual(
      expect.objectContaining({
        id: seed.subscription.id,
        status: "active",
      }),
    )
    expect(payload.subscription.renewedAt).not.toBeNull()
  })

  it("returns 400 when subscriptionId is missing", async () => {
    const response = await renewSubscriptionRoute(
      new Request("http://localhost/api/admin/commercial/subscriptions/renew", {
        method: "POST",
        body: JSON.stringify({
          renewedByUserId: "user_billing",
        }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "subscriptionId is required.",
    })
  })
})