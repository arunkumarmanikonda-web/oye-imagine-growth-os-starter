import { beforeEach, describe, expect, it } from "vitest"

import { GET as getLedgerRoute } from "@/app/api/admin/commercial/ledger/route"
import {
  requestMediaBalanceAdjustment,
  resetCommercialState,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store"

describe("admin commercial ledger route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("returns an empty ledger before any adjustment", async () => {
    seedNeejeeCommercialState()

    const response = await getLedgerRoute(
      new Request("http://localhost/api/admin/commercial/ledger", {
        method: "GET",
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(0)
    expect(payload.totalCredits).toBe(0)
    expect(payload.totalDebits).toBe(0)
    expect(payload.items).toEqual([])
  })

  it("returns ledger entries and totals after an applied adjustment", async () => {
    const seed = seedNeejeeCommercialState()

    const result = requestMediaBalanceAdjustment({
      tenantId: seed.tenant.id,
      amount: 1200,
      requestedByUserId: "user_ops",
      reason: "Minor credit correction",
    })

    expect(result.status).toBe("applied")

    const response = await getLedgerRoute(
      new Request(
        `http://localhost/api/admin/commercial/ledger?tenantId=${encodeURIComponent(seed.tenant.id)}`,
        {
          method: "GET",
        },
      ),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.count).toBe(1)
    expect(payload.totalCredits).toBe(1200)
    expect(payload.totalDebits).toBe(0)
    expect(payload.items).toEqual([
      expect.objectContaining({
        tenantId: seed.tenant.id,
        direction: "credit",
        amount: 1200,
        source: "direct_adjustment",
      }),
    ])
  })
})