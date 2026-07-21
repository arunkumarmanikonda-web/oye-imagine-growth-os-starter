import { NextRequest, NextResponse } from "next/server";
import { sendAiSensyCampaign } from "@/lib/providers/aisensy";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "aisensy",
    ready: Boolean(env.AISENSY_API_KEY) && Boolean(env.AISENSY_CAMPAIGN_NAME),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const destination =
      typeof body.to === "string"
        ? body.to
        : typeof body.destination === "string"
        ? body.destination
        : "";

    const userName =
      typeof body.userName === "string"
        ? body.userName
        : typeof body.name === "string"
        ? body.name
        : "Test User";

    const templateParams = Array.isArray(body.templateParams)
      ? body.templateParams.map((x: unknown) => String(x))
      : [];

    if (!destination) {
      return NextResponse.json(
        { ok: false, error: "Missing 'to' or 'destination' in request body." },
        { status: 400 }
      );
    }

    const result = await sendAiSensyCampaign({
      destination,
      userName,
      templateParams,
      source: typeof body.source === "string" ? body.source : undefined,
      tags: Array.isArray(body.tags) ? body.tags.map((x: unknown) => String(x)) : undefined,
      attributes:
        body.attributes && typeof body.attributes === "object"
          ? Object.fromEntries(
              Object.entries(body.attributes).map(([k, v]) => [k, String(v)])
            )
          : undefined,
      media:
        body.media &&
        typeof body.media === "object" &&
        typeof body.media.url === "string" &&
        typeof body.media.filename === "string"
          ? { url: body.media.url, filename: body.media.filename }
          : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: "aisensy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}