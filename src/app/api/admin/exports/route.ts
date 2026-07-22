import { adminJson, adminError, adminUnauthorized } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-route";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type ActiveContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  brandId: string | null;
  brandName: string | null;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string | null;
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing environment variable: " + name);
  }
  return value;
}

async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          try {
            for (const cookie of cookiesToSet) {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            }
          } catch {
            // ignored
          }
        },
      },
    }
  );
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

async function requireUser() {
  const authClient = await createAuthClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

async function getActiveContext(
  serviceClient: ReturnType<typeof createServiceClient>
): Promise<ActiveContext | null> {
  const cookieStore = await cookies();
  const workspaceId = cookieStore.get("oye_admin_workspace_id")?.value;

  if (!workspaceId) {
    return null;
  }

  const { data: workspace, error: workspaceError } = await serviceClient
    .from("workspaces")
    .select("id, name, slug, tenant_id, brand_id")
    .eq("id", workspaceId)
    .single();

  if (workspaceError || !workspace) {
    return null;
  }

  const { data: tenant } = await serviceClient
    .from("tenants")
    .select("id, display_name, slug")
    .eq("id", workspace.tenant_id)
    .single();

  let brandName: string | null = null;

  if (workspace.brand_id) {
    const { data: brand } = await serviceClient
      .from("brands")
      .select("id, name")
      .eq("id", workspace.brand_id)
      .single();

    brandName = brand?.name ?? null;
  }

  return {
    tenantId: workspace.tenant_id,
    tenantName: tenant?.display_name ?? "Unknown Tenant",
    tenantSlug: tenant?.slug ?? null,
    brandId: workspace.brand_id ?? null,
    brandName,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug ?? null,
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

export async function GET(request: NextRequest) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const user = await requireUser();

    if (!user) {
      return adminJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const kind = request.nextUrl.searchParams.get("kind") || "settings";
    const serviceClient = createServiceClient();
    const active = await getActiveContext(serviceClient);

    if (!active) {
      return adminJson(
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
        return adminJson({ ok: false, error: error.message }, { status: 500 });
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
        return adminJson({ ok: false, error: error.message }, { status: 500 });
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
        return adminJson({ ok: false, error: error.message }, { status: 500 });
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

    return adminJson(
      { ok: false, error: "Unsupported export kind" },
      { status: 400 }
    );
  } catch (error) {
    return adminJson(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}