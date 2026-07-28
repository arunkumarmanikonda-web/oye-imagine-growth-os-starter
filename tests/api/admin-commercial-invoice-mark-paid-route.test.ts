import { beforeEach, describe, expect, it } from "vitest"

import { POST as markInvoicePaidRoute } from "@/app/api/admin/commercial/invoices/mark-paid/route"
import { resetCommercialState, seedNeejeeCommercialState } from "@/lib/commercial/store"

describe("admin commercial invoice mark-paid route", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("marks a seeded invoice paid", async () => {
    const seed = seedNeejeeCommercialState()

    const response = await markInvoicePaidRoute(
      new Request("http://localhost/api/admin/commercial/invoices/mark-paid", {
        method: "POST",
        body: JSON.stringify({
          invoiceId: seed.invoice.id,
          paidByUserId: "user_finance",
        }),
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.invoice).toEqual(
      expect.objectContaining({
        id: seed.invoice.id,
        status: "paid",
      }),
    )
    expect(payload.invoice.paidAt).not.toBeNull()
  })

  it("returns 400 when invoiceId is missing", async () => {
    const response = await markInvoicePaidRoute(
      new Request("http://localhost/api/admin/commercial/invoices/mark-paid", {
        method: "POST",
        body: JSON.stringify({
          paidByUserId: "user_finance",
        }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "invoiceId is required.",
    })
  })
})