import { NextResponse } from "next/server";

import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown = {};

  try {
    const rawBody = await request.text();

    if (rawBody.trim()) {
      body = JSON.parse(rawBody);
    }
  } catch {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  const pilotId =
    typeof body.pilotId === "string" && body.pilotId.trim()
      ? body.pilotId.trim()
      : "pilot-demo";

  try {
    const draft = generateExecutionStatusDraft({ pilotId });
    return NextResponse.json(draft);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Pilot not found")) {
      return NextResponse.json(
        { error: `Execution status draft could not be generated for "${pilotId}".` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate execution status draft." },
      { status: 500 },
    );
  }
}