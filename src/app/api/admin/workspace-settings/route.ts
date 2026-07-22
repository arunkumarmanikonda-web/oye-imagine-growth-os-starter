import { NextRequest, NextResponse } from "next/server";
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
            // no-op in route handlers if cookies cannot be mutated here
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

async function getActiveContext(serviceClient: ReturnType<typeof createServiceClient>): Promise<ActiveContext | null> {
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

function isValidKey(key: string): boolean {
  return /^[a-zA-Z0-9._-]{1,120}$/.test(key);
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

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const active = await getActiveContext(serviceClient);

    if (!active) {
      return NextResponse.json(
        { ok: false, error: "No active admin workspace selected" },
        { status: 400 }
      );
    }

    const { data, error } = await serviceClient
      .from("workspace_settings")
      .select("id, key, value, created_by_email, updated_by_email, created_at, updated_at")
      .eq("workspace_id", active.workspaceId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      active,
      items: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const key = typeof body?.key === "string" ? body.key.trim() : "";
    const value = body?.value;

    if (!key || !isValidKey(key)) {
      return NextResponse.json(
        { ok: false, error: "Invalid key. Use letters, numbers, dot, underscore, or dash." },
        { status: 400 }
      );
    }

    if (value === undefined) {
      return NextResponse.json(
        { ok: false, error: "value is required" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const active = await getActiveContext(serviceClient);

    if (!active) {
      return NextResponse.json(
        { ok: false, error: "No active admin workspace selected" },
        { status: 400 }
      );
    }

    const { data: existing } = await serviceClient
      .from("workspace_settings")
      .select("id")
      .eq("workspace_id", active.workspaceId)
      .eq("key", key)
      .maybeSingle();

    const payload = {
      tenant_id: active.tenantId,
      brand_id: active.brandId,
      workspace_id: active.workspaceId,
      key,
      value,
      updated_by_user_id: user.id,
      updated_by_email: user.email ?? null,
    } as Record<string, unknown>;

    if (!existing) {
      payload.created_by_user_id = user.id;
      payload.created_by_email = user.email ?? null;
    }

    const { data: row, error } = await serviceClient
      .from("workspace_settings")
      .upsert(payload, { onConflict: "workspace_id,key" })
      .select("id, key, value, created_by_email, updated_by_email, created_at, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const action = existing
      ? "admin_workspace_setting_updated"
      : "admin_workspace_setting_created";

    await serviceClient.from("admin_audit_events").insert({
      actor_user_id: user.id,
      actor_email: user.email ?? null,
      action,
      target_type: "workspace",
      target_id: active.workspaceId,
      tenant_id: active.tenantId,
      brand_id: active.brandId,
      workspace_id: active.workspaceId,
      payload: {
        key,
        settingId: row.id,
      },
    });

    return NextResponse.json({
      ok: true,
      active,
      item: row,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}