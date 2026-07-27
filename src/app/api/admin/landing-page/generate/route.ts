import { NextResponse } from "next/server";
import { generateLandingPageBrief } from "@/lib/admin/landing-page-generator";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!isRecord(body)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Request body must be a JSON object.",
        },
        { status: 400 },
      );
    }

    const pilotId =
      typeof body.pilotId === "string" && body.pilotId.trim().length > 0
        ? body.pilotId.trim()
        : undefined;

    const forceRegenerate = body.forceRegenerate === true;

    const landingPage = generateLandingPageBrief({
      pilotId,
      forceRegenerate,
    });

    const workspaceDisplayName =
      typeof (landingPage as Record<string, unknown>).workspaceDisplayName === "string" &&
      ((landingPage as Record<string, unknown>).workspaceDisplayName as string).trim().length > 0
        ? ((landingPage as Record<string, unknown>).workspaceDisplayName as string).trim()
        : "Oye Imagine";

    return NextResponse.json(
      {
        ok: true,
        workspaceDisplayName,
        landingPage,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.startsWith("Pilot not found:")) {
      return NextResponse.json(
        {
          ok: false,
          error: message,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}