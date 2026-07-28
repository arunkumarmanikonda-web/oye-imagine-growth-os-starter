import { NextResponse } from "next/server"

import { listContracts } from "@/lib/commercial/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")?.trim() || undefined
  const items = listContracts(tenantId)

  return NextResponse.json({
    items,
    count: items.length,
  })
}