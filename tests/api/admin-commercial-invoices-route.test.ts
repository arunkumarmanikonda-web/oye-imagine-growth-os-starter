import { beforeEach, describe, expect, it } from "vitest"

import { GET as getInvoicesRoute } from "@/app/api/admin/commercial/invoices/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial invoices route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns an empty collection before seeding", async () => {
    const response = await getInvoicesRoute(
      new Request("http://localhost/api/admin/commercial/invoices", {
        method: "GET",
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(0)
    expect(payload.items).toEqual([])
  })

  it("returns seeded invoices and supports tenant filtering", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await getInvoicesRoute(
      new Request(
        `http://localhost/api/admin/commercial/invoices?tenantId=${encodeURIComponent(seed.tenant.id)}`,
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
        invoiceNumber: "INV-2026-0001",
        status: "issued",
        total: 75000,
      }),
    ])
  })
})