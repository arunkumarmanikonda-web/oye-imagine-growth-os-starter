import { beforeEach, describe, expect, it } from "vitest"

import { GET as getCommercialOverview } from "@/app/api/admin/commercial/overview/route"
import { POST as seedNeejeeCommercialStateRoute } from "@/app/api/admin/commercial/seed-neejee/route"
import { resetCommercialState } from "@/lib/commercial/store"

describe("admin commercial seed and overview", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("seeds Neejee commercial records and exposes overview", async () => {
    const seedResponse = await seedNeejeeCommercialStateRoute(
      new Request("http://localhost/api/admin/commercial/seed-neejee", {
        method: "POST",
      }),
    )

    expect(seedResponse.status).toBe(200)

    const seeded = await seedResponse.json()
    expect(seeded.tenant.slug).toBe("neejee")
    expect(seeded.plan.code).toBe("growth")
    expect(seeded.subscription.amount).toBe(75000)
    expect(seeded.mediaBalanceAccount.availableBalance).toBe(25000)
    expect(seeded.approvalPolicy.thresholdAmount).toBe(5000)

    const overviewResponse = await getCommercialOverview(
      new Request("http://localhost/api/admin/commercial/overview", {
        method: "GET",
      }),
    )

    expect(overviewResponse.status).toBe(200)

    const overview = await overviewResponse.json()
    expect(overview.tenantCount).toBe(1)
    expect(overview.pendingApprovalCount).toBe(0)
    expect(overview.totalMediaBalanceAvailable).toBe(25000)
    expect(overview.tenants).toEqual([
      expect.objectContaining({
        slug: "neejee",
        planCode: "growth",
        subscriptionStatus: "active",
        contractStatus: "awaiting_signature",
        mediaBalanceAvailable: 25000,
        pendingApprovalCount: 0,
      }),
    ])
  })
})