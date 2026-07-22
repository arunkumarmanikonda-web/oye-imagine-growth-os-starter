import { adminJson, adminError, adminUnauthorized } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-route";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function createServiceRoleClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return adminJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const action = request.nextUrl.searchParams.get("action")?.trim() ?? "";
    const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "25");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 25;

    const admin = createServiceRoleClient();

    let query = admin
      .from("admin_audit_events")
      .select("id, action, actor_user_id, actor_email, tenant_id, brand_id, workspace_id, target_type, target_id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq("action", action);
    }

    const { data, error } = await query;

    if (error) {
      return adminJson(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return adminJson({
      ok: true,
      filters: {
        action,
        limit,
      },
      items: data ?? [],
    });
  } catch (error) {
    return adminJson(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}