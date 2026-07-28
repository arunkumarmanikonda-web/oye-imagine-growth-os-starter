import { NextResponse } from "next/server"

import { requestMediaBalanceAdjustment } from "@/lib/commercial/store"

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
    const requestedByUserId =
      typeof body.requestedByUserId === "string" && body.requestedByUserId.trim()
        ? body.requestedByUserId.trim()
        : "system"
    const reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : "Manual media balance adjustment"
    const amount = typeof body.amount === "number" ? body.amount : Number.NaN

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required." },
        { status: 400 },
      )
    }

    if (!Number.isFinite(amount) || amount === 0) {
      return NextResponse.json(
        { error: "amount must be a non-zero number." },
        { status: 400 },
      )
    }

    const result = requestMediaBalanceAdjustment({
      tenantId,
      amount,
      requestedByUserId,
      reason,
    })

    if (result.status === "approval_required") {
      return NextResponse.json(
        {
          approvalRequired: true,
          approvalRequest: result.approvalRequest,
          mediaBalanceAccount: result.mediaBalanceAccount,
        },
        { status: 202 },
      )
    }

    return NextResponse.json({
      approvalRequired: false,
      mediaBalanceAccount: result.mediaBalanceAccount,
      ledgerEntry: result.ledgerEntry,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process media balance adjustment."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}