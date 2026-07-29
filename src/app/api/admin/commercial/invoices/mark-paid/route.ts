import { NextResponse } from "next/server"

import { markInvoicePaidRuntime } from "@/lib/commercial/runtime"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const value: unknown = await request.json()
  if (!isRecord(value)) {
    throw new Error("Request body must be a JSON object.")
  }

  return value
}

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request)
    const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId.trim() : ""
    const paidByUserId =
      typeof body.paidByUserId === "string" && body.paidByUserId.trim()
        ? body.paidByUserId.trim()
        : "system"
    const paidAt =
      typeof body.paidAt === "string" && body.paidAt.trim()
        ? body.paidAt.trim()
        : null

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId is required." },
        { status: 400 },
      )
    }

    const invoice = await markInvoicePaidRuntime({
      invoiceId,
      paidByUserId,
      paidAt,
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to mark invoice paid."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}