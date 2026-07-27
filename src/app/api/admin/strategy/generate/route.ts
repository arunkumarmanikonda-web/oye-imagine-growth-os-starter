import { NextResponse } from "next/server";

import { generateStrategyBrief } from "@/lib/admin/strategy-generator";
import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

type StrategyGenerateRequest = {
  pilotId?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractPilotId(body: unknown): string | undefined {
  if (!isObject(body)) {
    return undefined;
  }

  const rawPilotId = body.pilotId;
  if (typeof rawPilotId !== "string") {
    return undefined;
  }

  const trimmed = rawPilotId.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(request: Request) {
  const workspaceDisplayName = getWorkspaceDisplayName();

  try {
    const body = (await request.json()) as StrategyGenerateRequest | unknown;

    if (!isObject(body)) {
      return NextResponse.json(
        {
          ok: false,
          workspaceDisplayName,
          error: "Request body must be a JSON object.",
        },
        { status: 400 },
      );
    }

    const pilotId = extractPilotId(body);
    const strategy = generateStrategyBrief(pilotId);

    return NextResponse.json(
      {
        ok: true,
        workspaceDisplayName,
        strategy,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate strategy brief.";

    const status = message.includes("not found") ? 404 : 500;

    return NextResponse.json(
      {
        ok: false,
        workspaceDisplayName,
        error: message,
      },
      { status },
    );
  }
}