import { NextResponse } from "next/server";

import { generateCampaignSummaryDraft } from "@/lib/admin/campaign-summary-generator";

type LooseRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is LooseRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: LooseRecord = {};

  try {
    const rawBody = await request.json();

    if (rawBody === null || rawBody === undefined) {
      body = {};
    } else if (!isPlainObject(rawBody)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 },
      );
    } else {
      body = rawBody;
    }
  } catch {
    body = {};
  }

  const pilotId =
    typeof body.pilotId === "string" && body.pilotId.trim().length > 0
      ? body.pilotId.trim()
      : "pilot-demo";

  try {
    const draft = generateCampaignSummaryDraft(pilotId);
    return NextResponse.json(draft);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";

    if (/not found/i.test(message)) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to generate campaign summary draft." },
      { status: 500 },
    );
  }
}