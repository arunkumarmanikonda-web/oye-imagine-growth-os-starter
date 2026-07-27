import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import {
  getWorkspaceOnboardingSnapshotLive,
  saveWorkspaceOnboardingSnapshotLive,
} from "@/lib/admin/workspace-live";
import { type NeejeePilotInput } from "@/lib/admin/pilot-schema";
import { getPilot, savePilot } from "@/lib/admin/pilot-store";
import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pilotKeys = new Set([
  "id",
  "workspaceDisplayName",
  "brandName",
  "website",
  "industry",
  "geo",
  "targetAudience",
  "offer",
  "monthlyBudget",
  "primaryChannels",
  "competitors",
  "goals",
  "successMetrics",
  "status",
  "lastUpdatedAt",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(source: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function normalizeLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toPilotPatch(source: Record<string, unknown>): NeejeePilotInput {
  const patch: NeejeePilotInput = {};

  if (hasOwn(source, "brandName")) patch.brandName = String(source.brandName ?? "");
  if (hasOwn(source, "website")) patch.website = String(source.website ?? "");
  if (hasOwn(source, "industry")) patch.industry = String(source.industry ?? "");
  if (hasOwn(source, "geo")) patch.geo = String(source.geo ?? "");
  if (hasOwn(source, "targetAudience")) {
    patch.targetAudience = String(source.targetAudience ?? "");
  }
  if (hasOwn(source, "offer")) patch.offer = String(source.offer ?? "");
  if (hasOwn(source, "monthlyBudget")) {
    patch.monthlyBudget = String(source.monthlyBudget ?? "");
  }
  if (hasOwn(source, "primaryChannels")) {
    patch.primaryChannels = normalizeLines(source.primaryChannels);
  }
  if (hasOwn(source, "competitors")) {
    patch.competitors = normalizeLines(source.competitors);
  }
  if (hasOwn(source, "goals")) {
    patch.goals = normalizeLines(source.goals);
  }
  if (hasOwn(source, "successMetrics")) {
    patch.successMetrics = normalizeLines(source.successMetrics);
  }
  if (hasOwn(source, "status")) patch.status = String(source.status ?? "") as any;

  return patch;
}

function extractSnapshotPatch(source: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (key === "pilot") continue;
    if (key === "snapshot") continue;
    if (pilotKeys.has(key)) continue;
    patch[key] = value;
  }

  return patch;
}

function hasPilotPatch(source: NeejeePilotInput): boolean {
  return Object.keys(source).length > 0;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const snapshot = await getWorkspaceOnboardingSnapshotLive();
  const pilot = getPilot();

  return NextResponse.json(
    {
      ok: true,
      snapshot,
      pilot,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON body",
      },
      { status: 400 }
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expected an object body",
      },
      { status: 400 }
    );
  }

  const snapshotPatch = isRecord(body.snapshot)
    ? body.snapshot
    : extractSnapshotPatch(body);

  const explicitPilotPatch = isRecord(body.pilot) ? toPilotPatch(body.pilot) : {};
  const topLevelPilotPatch = toPilotPatch(body);
  const pilotPatch = hasPilotPatch(explicitPilotPatch)
    ? explicitPilotPatch
    : topLevelPilotPatch;

  const snapshot = await saveWorkspaceOnboardingSnapshotLive(snapshotPatch);
  const pilot = hasPilotPatch(pilotPatch)
    ? savePilot({
        ...pilotPatch,
        workspaceDisplayName:
          pilotPatch.workspaceDisplayName ?? getWorkspaceDisplayName(),
      })
    : getPilot();

  return NextResponse.json(
    {
      ok: true,
      snapshot,
      pilot,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}