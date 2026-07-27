import { NextResponse } from "next/server";

import { generateEmailSequenceDraft } from "@/lib/admin/email-sequence-generator";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};

  try {
    const raw = await request.text();

    if (raw.trim()) {
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) {
        return NextResponse.json(
          { error: "Request body must be a JSON object." },
          { status: 400 },
        );
      }
      body = parsed;
    }
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const pilotId =
    typeof body.pilotId === "string" && body.pilotId.trim()
      ? body.pilotId.trim()
      : "pilot-demo";

  try {
    const draft = generateEmailSequenceDraft(pilotId);
    return NextResponse.json(draft);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";

    if (message.includes("Pilot not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}