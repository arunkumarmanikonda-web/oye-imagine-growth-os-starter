import { NextResponse } from "next/server";
import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";

function countItems(items: unknown) {
  return Array.isArray(items) ? items.filter(Boolean).length : 0;
}

function buildSummary(draft: {
  pilotId: string;
  campaignName: string;
  overallStatus: string;
  completedItems?: unknown;
  inProgressItems?: unknown;
  blockedItems?: unknown;
  upcomingItems?: unknown;
  lastUpdatedAt: string;
}) {
  return {
    pilotId: draft.pilotId,
    campaignName: draft.campaignName,
    overallStatus: draft.overallStatus,
    completedCount: countItems(draft.completedItems),
    inProgressCount: countItems(draft.inProgressItems),
    blockedCount: countItems(draft.blockedItems),
    upcomingCount: countItems(draft.upcomingItems),
    lastUpdatedAt: draft.lastUpdatedAt,
    detailHref: `/admin/execution-status/${draft.pilotId}`,
  };
}

function isMissingPilotError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("pilot") &&
    (
      message.includes("missing") ||
      message.includes("not found") ||
      message.includes("does not exist")
    )
  );
}

export async function GET() {
  try {
    const storedDraft = await Promise.resolve(getExecutionStatusDraft());
    const draft =
      storedDraft ??
      (await Promise.resolve(generateExecutionStatusDraft({})));

    return NextResponse.json(buildSummary(draft));
  } catch (error) {
    if (isMissingPilotError(error)) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Unable to load execution status summary" },
      { status: 500 },
    );
  }
}