import { NextResponse } from "next/server"

import { getMediaBalanceAccountSnapshot } from "@/lib/commercial/store"

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
    return NextResponse.json(getMediaBalanceAccountSnapshot(tenantId))
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load media balance account."

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}