import { beforeEach, describe, expect, it } from "vitest"

import {
  getCommercialOverview,
  resetCommercialState,
  seedNeejeeCommercialState,
} from "@/lib/commercial/store"

describe("commercial store seed behavior", () => {
  beforeEach(() => {
    resetCommercialState()
  })

  it("seeds idempotently for Neejee", () => {
    const first = seedNeejeeCommercialState()
    const second = seedNeejeeCommercialState()
    const overview = getCommercialOverview()

    expect(first.tenant.id).toBe(second.tenant.id)
    expect(first.mediaBalanceAccount.id).toBe(second.mediaBalanceAccount.id)
    expect(first.subscription.id).toBe(second.subscription.id)
    expect(overview.tenantCount).toBe(1)
    expect(overview.tenants).toHaveLength(1)
    expect(overview.tenants[0]?.slug).toBe("neejee")
  })
})