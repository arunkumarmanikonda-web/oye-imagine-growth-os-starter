import { NextResponse } from "next/server"

import { spendReservedMediaBalance } from "@/lib/commercial/store"

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
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : ""
    const amount = typeof body.amount === "number" ? body.amount : Number.NaN
    const spentByUserId =
      typeof body.spentByUserId === "string" && body.spentByUserId.trim()
        ? body.spentByUserId.trim()
        : "system"
    const reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : "Spend reserved media balance"

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required." },
        { status: 400 },
      )
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number." },
        { status: 400 },
      )
    }

    const result = spendReservedMediaBalance({
      tenantId,
      amount,
      spentByUserId,
      reason,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to spend reserved media balance."

    if (message.includes("Insufficient reserved media balance")) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}