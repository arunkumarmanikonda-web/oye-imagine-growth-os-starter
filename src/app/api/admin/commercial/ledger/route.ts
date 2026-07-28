import { NextResponse } from "next/server"

import { listLedgerEntries } from "@/lib/commercial/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")?.trim() || undefined
  const items = listLedgerEntries(tenantId)

  const totalCredits = items
    .filter((item) => item.direction === "credit")
    .reduce((sum, item) => sum + item.amount, 0)

  const totalDebits = items
    .filter((item) => item.direction === "debit")
    .reduce((sum, item) => sum + item.amount, 0)

  return NextResponse.json({
    items,
    count: items.length,
    totalCredits,
    totalDebits,
  })
}