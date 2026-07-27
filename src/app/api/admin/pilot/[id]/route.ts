import { NextResponse } from "next/server";

import { type NeejeePilotInput } from "@/lib/admin/pilot-schema";
import { getPilot, updatePilot } from "@/lib/admin/pilot-store";
import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function resolveId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function GET(_request: Request, context: RouteContext) {
  const pilot = getPilot();
  const id = await resolveId(context);

  if (id !== pilot.id) {
    return NextResponse.json(
      {
        ok: false,
        error: `Pilot ${id} not found`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    workspaceDisplayName: getWorkspaceDisplayName(),
    pilot,
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const current = getPilot();
  const id = await resolveId(context);

  if (id !== current.id) {
    return NextResponse.json(
      {
        ok: false,
        error: `Pilot ${id} not found`,
      },
      { status: 404 },
    );
  }

  let body: NeejeePilotInput = {};

  try {
    const parsed = await request.json();
    body =
      parsed && typeof parsed === "object" ? (parsed as NeejeePilotInput) : {};
  } catch {
    body = {};
  }

  const pilot = updatePilot({
    ...body,
    id,
    workspaceDisplayName: body.workspaceDisplayName ?? getWorkspaceDisplayName(),
  });

  return NextResponse.json({
    ok: true,
    workspaceDisplayName: getWorkspaceDisplayName(),
    pilot,
  });
}