import { NextResponse } from "next/server";

import { type NeejeePilotInput } from "@/lib/admin/pilot-schema";
import { getPilot, savePilot } from "@/lib/admin/pilot-store";
import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

export async function GET() {
  const pilot = getPilot();
  const workspaceDisplayName = getWorkspaceDisplayName();

  return NextResponse.json({
    ok: true,
    workspaceDisplayName,
    pilot,
  });
}

export async function POST(request: Request) {
  let body: NeejeePilotInput = {};

  try {
    const parsed = await request.json();
    body =
      parsed && typeof parsed === "object" ? (parsed as NeejeePilotInput) : {};
  } catch {
    body = {};
  }

  const pilot = savePilot({
    ...body,
    workspaceDisplayName: body.workspaceDisplayName ?? getWorkspaceDisplayName(),
  });

  return NextResponse.json(
    {
      ok: true,
      workspaceDisplayName: getWorkspaceDisplayName(),
      pilot,
    },
    { status: 201 },
  );
}