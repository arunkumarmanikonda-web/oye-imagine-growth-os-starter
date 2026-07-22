import { adminJson, adminError, adminUnauthorized } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-route";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAdminContext } from "@/lib/admin/active-context";
import { logAdminAuditEvent } from "@/lib/admin/audit";

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

export async function GET(request: Request) {
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

    const active = await requireActiveAdminContext();
    const admin = createServiceRoleClient();

    const [{ count: tenantCount, error: tenantError }, { count: brandCount, error: brandError }, { count: workspaceCount, error: workspaceError }] = await Promise.all([
      admin.from("tenants").select("*", { count: "exact", head: true }).eq("id", active.tenantId),
      admin.from("brands").select("*", { count: "exact", head: true }).eq("tenant_id", active.tenantId).eq("id", active.brandId),
      admin.from("workspaces").select("*", { count: "exact", head: true }).eq("tenant_id", active.tenantId).eq("brand_id", active.brandId).eq("id", active.workspaceId),
    ]);

    const summaryError = tenantError || brandError || workspaceError;
    if (summaryError) {
      return adminJson({ ok: false, error: summaryError.message }, { status: 500 });
    }

    try {
      await logAdminAuditEvent({
        event: "admin_workspace_summary_viewed",
        actorUserId: user.id,
        actorEmail: user.email ?? null,
        tenantId: active.tenantId,
        brandId: active.brandId,
        workspaceId: active.workspaceId,
        payload: {
          tenantSlug: active.tenantSlug,
          workspaceSlug: active.workspaceSlug,
        },
      });
    } catch (auditError) {
      console.error("Failed to write workspace summary audit event", auditError);
    }

    return adminJson({
      ok: true,
      active,
      counts: {
        tenants: tenantCount ?? 0,
        brands: brandCount ?? 0,
        workspaces: workspaceCount ?? 0,
      },
    });
  } catch (error) {
    return adminJson(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}