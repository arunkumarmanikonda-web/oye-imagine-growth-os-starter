import { beforeEach, describe, expect, it } from "vitest"

import { GET as getMediaBalanceAccountRoute } from "@/app/api/admin/commercial/media-balance/account/route"
import { POST as reserveMediaBalanceRoute } from "@/app/api/admin/commercial/media-balance/reserve/route"
import { POST as spendReservedMediaBalanceRoute } from "@/app/api/admin/commercial/media-balance/spend/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial media balance spend route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("spends from reserved balance and records a debit ledger entry", async () => {
    const seed = seedNeejeeCommercialState()

    await reserveMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance/reserve", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 3000,
          reservedByUserId: "user_finance",
          reason: "Reserve for paid campaign",
        }),
      }),
    )

    const spendResponse = await spendReservedMediaBalanceRoute(
      new Request("http://localhost/api/admin/commercial/media-balance/spend", {
        method: "POST",
        body: JSON.stringify({
          tenantId: seed.tenant.id,
          amount: 3000,
          spentByUserId: "user_ops",
          reason: "Campaign launch spend",
        }),
      }),
    )

    expect(spendResponse.status).toBe(200)

    const spendPayload = await spendResponse.json()
    expect(spendPayload.mediaBalanceAccount).toEqual(
      expect.objectContaining({
        availableBalance: 22000,
        reservedBalance: 0,
      }),
    )
    expect(spendPayload.ledgerEntry).toEqual(
      expect.objectContaining({
        direction: "debit",
        amount: 3000,
        source: "campaign_spend",
      }),
    )

    const accountResponse = await getMediaBalanceAccountRoute(
      new Request(
        `http://localhost/api/admin/commercial/media-balance/account?tenantId=${encodeURIComponent(seed.tenant.id)}`,
        { method: "GET" },
      ),
    )

    expect(accountResponse.status).toBe(200)

    const accountPayload = await accountResponse.json()
    expect(accountPayload.ledgerEntries).toHaveLength(1)
    expect(accountPayload.ledgerEntries[0]).toEqual(
      expect.objectContaining({
        direction: "debit",
        amount: 3000,
      }),
    )
  })
})