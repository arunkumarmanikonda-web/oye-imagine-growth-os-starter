import { beforeEach, describe, expect, it } from "vitest"

import { GET as getTenantRoute } from "@/app/api/admin/commercial/tenant/route"
import {
  requestMediaBalanceAdjustment,
  resetCommercialState,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store"

describe("admin commercial tenant route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns 400 when tenantId is missing", async () => {
    const response = await getTenantRoute(
      new Request("http://localhost/api/admin/commercial/tenant", {
        method: "GET",
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "tenantId is required.",
    })
  })

  it("returns 404 when the tenant is unknown", async () => {
    const response = await getTenantRoute(
      new Request("http://localhost/api/admin/commercial/tenant?tenantId=tenant_missing", {
        method: "GET",
      }),
    )

    expect(response.status).toBe(404)

    const payload = await response.json()
    expect(payload.error).toMatch(/Tenant not found/)
  })

  it("returns tenant commercial snapshot for a known tenant", async () => {
    const seed = seedNeejeeCommercialState()

    const result = requestMediaBalanceAdjustment({
      tenantId: seed.tenant.id,
      amount: 1200,
      requestedByUserId: "user_ops",
      reason: "Correction",
    })

    expect(result.status).toBe("applied")

    const response = await getTenantRoute(
      new Request(
        `http://localhost/api/admin/commercial/tenant?tenantId=${encodeURIComponent(seed.tenant.id)}`,
        {
          method: "GET",
        },
      ),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.tenant).toEqual(
      expect.objectContaining({
        id: seed.tenant.id,
        slug: "neejee",
      }),
    )
    expect(payload.mediaBalanceAccount).toEqual(
      expect.objectContaining({
        availableBalance: 26200,
      }),
    )
    expect(payload.pendingApprovalCount).toBe(0)
    expect(payload.ledgerEntries).toHaveLength(1)
    expect(payload.auditEvents.length).toBeGreaterThanOrEqual(2)
  })
})