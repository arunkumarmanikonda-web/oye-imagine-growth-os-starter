import { NextResponse } from "next/server"

import { listInvoices } from "@/lib/commercial/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")?.trim() || undefined
  const items = listInvoices(tenantId)

  return NextResponse.json({
    items,
    count: items.length,
  })
}