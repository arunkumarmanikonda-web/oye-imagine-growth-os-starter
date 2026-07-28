import { beforeEach, describe, expect, it } from "vitest"

import { POST as activateContractRoute } from "@/app/api/admin/commercial/contracts/activate/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial contract activate route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("activates a seeded contract", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await activateContractRoute(
      new Request("http://localhost/api/admin/commercial/contracts/activate", {
        method: "POST",
        body: JSON.stringify({
          contractId: seed.contract.id,
          activatedByUserId: "user_legal",
        }),
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.contract).toEqual(
      expect.objectContaining({
        id: seed.contract.id,
        status: "active",
      }),
    )
    expect(payload.contract.effectiveAt).not.toBeNull()
  })

  it("returns 400 when contractId is missing", async () => {
    const response = await activateContractRoute(
      new Request("http://localhost/api/admin/commercial/contracts/activate", {
        method: "POST",
        body: JSON.stringify({
          activatedByUserId: "user_legal",
        }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "contractId is required.",
    })
  })
})