import { NextResponse } from "next/server"

import { activateContractRuntime } from "@/lib/commercial/runtime"

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
    const contractId = typeof body.contractId === "string" ? body.contractId.trim() : ""
    const activatedByUserId =
      typeof body.activatedByUserId === "string" && body.activatedByUserId.trim()
        ? body.activatedByUserId.trim()
        : "system"
    const effectiveAt =
      typeof body.effectiveAt === "string" && body.effectiveAt.trim()
        ? body.effectiveAt.trim()
        : null

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId is required." },
        { status: 400 },
      )
    }

    const contract = await activateContractRuntime({
      contractId,
      activatedByUserId,
      effectiveAt,
    })

    return NextResponse.json({ contract })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to activate contract."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}