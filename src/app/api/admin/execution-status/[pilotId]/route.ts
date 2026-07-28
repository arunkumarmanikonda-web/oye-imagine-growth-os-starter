import { NextResponse } from "next/server";

import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";

type RouteParams = {
  pilotId: string;
};

type RouteContext = {
  params: Promise<RouteParams> | RouteParams;
};

function isMissingPilotError(error: unknown) {
  return (
    error instanceof Error &&
    /pilot/i.test(error.message) &&
    /(missing|not found|cannot be found|does not exist)/i.test(error.message)
  );
}

async function loadExecutionStatusDraft(pilotId: string) {
  const storedDraft = getExecutionStatusDraft();

  if (storedDraft?.pilotId === pilotId) {
    return storedDraft;
  }

  return await generateExecutionStatusDraft({ pilotId });
}

export async function GET(_request: Request, context: RouteContext) {
  const { pilotId } = await Promise.resolve(context.params);

  if (!pilotId?.trim()) {
    return NextResponse.json(
      { error: "Pilot id is required." },
      { status: 400 },
    );
  }

  try {
    const draft = await loadExecutionStatusDraft(pilotId);

    if (!draft || draft.pilotId !== pilotId) {
      return NextResponse.json(
        { error: `Pilot ${pilotId} was not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json(draft);
  } catch (error) {
    if (isMissingPilotError(error)) {
      return NextResponse.json(
        { error: `Pilot ${pilotId} was not found.` },
        { status: 404 },
      );
    }

    throw error;
  }
}