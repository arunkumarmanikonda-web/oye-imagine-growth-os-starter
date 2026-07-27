import { NextResponse } from "next/server";

import { getPilot } from "@/lib/admin/pilot-store";
import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

const requiredFieldKeys = [
  "brandName",
  "website",
  "industry",
  "geo",
  "targetAudience",
  "offer",
  "monthlyBudget",
  "primaryChannels",
  "goals",
  "successMetrics",
] as const;

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

export async function GET() {
  const pilot = getPilot();
  const workspaceDisplayName = getWorkspaceDisplayName();

  const missingFields = requiredFieldKeys.filter((key) => !hasValue(pilot[key]));
  const completedFields = requiredFieldKeys.length - missingFields.length;
  const completionPercent = Math.round(
    (completedFields / requiredFieldKeys.length) * 100,
  );

  return NextResponse.json({
    ok: true,
    workspaceDisplayName,
    pilotId: pilot.id,
    status: pilot.status,
    completedFields,
    totalFields: requiredFieldKeys.length,
    completionPercent,
    missingFields,
    lastUpdatedAt: pilot.lastUpdatedAt,
  });
}