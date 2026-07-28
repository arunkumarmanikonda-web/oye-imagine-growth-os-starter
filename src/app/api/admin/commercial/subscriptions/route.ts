import { NextResponse } from "next/server"

import { listSubscriptions } from "@/lib/commercial/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")?.trim() || undefined
  const items = listSubscriptions(tenantId)

  return NextResponse.json({
    items,
    count: items.length,
  })
}