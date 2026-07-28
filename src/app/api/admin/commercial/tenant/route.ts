import { NextResponse } from "next/server"

import { getTenantCommercialSnapshot } from "@/lib/commercial/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")?.trim() ?? ""

  if (!tenantId) {
    return NextResponse.json(
      { error: "tenantId is required." },
      { status: 400 },
    )
  }

  try {
    const snapshot = getTenantCommercialSnapshot(tenantId)
    return NextResponse.json(snapshot)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load tenant commercial snapshot."

    if (message.includes("Tenant not found")) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}