import { NextResponse } from "next/server"

import { renewSubscriptionRuntime } from "@/lib/commercial/runtime"

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
    const subscriptionId =
      typeof body.subscriptionId === "string" ? body.subscriptionId.trim() : ""
    const renewedByUserId =
      typeof body.renewedByUserId === "string" && body.renewedByUserId.trim()
        ? body.renewedByUserId.trim()
        : "system"
    const renewedAt =
      typeof body.renewedAt === "string" && body.renewedAt.trim()
        ? body.renewedAt.trim()
        : null

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required." },
        { status: 400 },
      )
    }

    const subscription = await renewSubscriptionRuntime({
      subscriptionId,
      renewedByUserId,
      renewedAt,
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to renew subscription."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}