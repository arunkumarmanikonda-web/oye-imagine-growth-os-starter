import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-route";
import { getAdminContexts } from "@/lib/admin/context";
const workspaceDisplayName = getWorkspaceDisplayName();

type ExportContext = {
  workspaceId: string;
  workspaceSlug: string | null;
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing environment variable: " + name);
  }
  return value;
}

function createServiceClient() {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function getActiveExportContext(): Promise<ExportContext | null> {
  const { active } = await getAdminContexts();

  if (!active?.workspaceId) {
    return null;
  }

  return {
    workspaceId: active.workspaceId,
    workspaceSlug: active.workspaceSlug ?? null,
  };
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : JSON.stringify(value);

  return '"' + text.replace(/"/g, '""') + '"';
}

function toCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ];

  return lines.join("\n");
}

function fileNameFor(kind: string, workspaceSlug: string | null): string {
  const date = new Date().toISOString().slice(0, 10);
  const prefix = workspaceSlug || "workspace";
  return prefix + "_" + kind + "_" + date + ".csv";
}

export async function GET(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind") || "settings";

    const serviceClient = createServiceClient();
    const active = await getActiveExportContext();

    if (!active) {
      return NextResponse.json(
        { ok: false, error: "No active admin workspace selected" },
        { status: 400 }
      );
    }

    if (kind === "settings") {
      const { data, error } = await serviceClient
        .from("workspace_settings")
        .select("id, key, value, created_by_email, updated_by_email, created_at, updated_at")
        .eq("workspace_id", active.workspaceId)
        .order("updated_at", { ascending: false });

      if (error) {
        return NextResponse.json({
      workspaceDisplayName, ok: false, error: error.message }, { status: 500 });
      }

      const csv = toCsv(
        ["id", "key", "value", "created_by_email", "updated_by_email", "created_at", "updated_at"],
        (data ?? []) as Array<Record<string, unknown>>
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="' + fileNameFor("settings", active.workspaceSlug) + '"',
        },
      });
    }

    if (kind === "versions") {
      const { data, error } = await serviceClient
        .from("workspace_setting_versions")
        .select("id, workspace_setting_id, key, action, value, actor_email, created_at")
        .eq("workspace_id", active.workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({
      workspaceDisplayName, ok: false, error: error.message }, { status: 500 });
      }

      const csv = toCsv(
        ["id", "workspace_setting_id", "key", "action", "value", "actor_email", "created_at"],
        (data ?? []) as Array<Record<string, unknown>>
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="' + fileNameFor("versions", active.workspaceSlug) + '"',
        },
      });
    }

    if (kind === "audit") {
      const { data, error } = await serviceClient
        .from("admin_audit_events")
        .select("id, action, actor_email, target_type, target_id, payload, created_at")
        .eq("workspace_id", active.workspaceId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({
      workspaceDisplayName, ok: false, error: error.message }, { status: 500 });
      }

      const csv = toCsv(
        ["id", "action", "actor_email", "target_type", "target_id", "payload", "created_at"],
        (data ?? []) as Array<Record<string, unknown>>
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="' + fileNameFor("audit", active.workspaceSlug) + '"',
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: "Unsupported export kind" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}