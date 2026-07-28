import { NextResponse } from "next/server"

import { listPendingApprovalRequests } from "@/lib/commercial/store"

export async function GET() {
  const items = listPendingApprovalRequests()

  return NextResponse.json({
    items,
    count: items.length,
  })
}