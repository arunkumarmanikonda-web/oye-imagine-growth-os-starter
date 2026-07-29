import { NextResponse } from "next/server"

import { resolveApprovalRequestRuntime } from "@/lib/commercial/runtime"

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
    const approvalRequestId =
      typeof body.approvalRequestId === "string" ? body.approvalRequestId.trim() : ""
    const approverUserId =
      typeof body.approverUserId === "string" ? body.approverUserId.trim() : ""
    const decision = body.decision

    if (!approvalRequestId) {
      return NextResponse.json(
        { error: "approvalRequestId is required." },
        { status: 400 },
      )
    }

    if (!approverUserId) {
      return NextResponse.json(
        { error: "approverUserId is required." },
        { status: 400 },
      )
    }

    if (decision !== "approve" && decision !== "reject") {
      return NextResponse.json(
        { error: "decision must be either 'approve' or 'reject'." },
        { status: 400 },
      )
    }

    const result = await resolveApprovalRequestRuntime({
      approvalRequestId,
      approverUserId,
      decision,
      note: typeof body.note === "string" ? body.note : null,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to resolve approval request."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}