import { getWorkspaceBrandingDiagnostics } from "@/lib/admin/workspace-branding";
import { createClient } from "@supabase/supabase-js";
import { adminError, adminJson, adminUnauthorized } from "@/lib/admin-api";
import {
  authorizeAdminRequest,
  getConfiguredAdminSecretKeys,
} from "@/lib/admin-auth";

export async function GET(request: Request) {
  const auth = authorizeAdminRequest(request);
  if (!auth.ok) {
    return adminUnauthorized(auth.reason);
  }

  const timestamp = new Date().toISOString();
  const branding = getWorkspaceBrandingDiagnostics();
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  const configuredSecretKeys = getConfiguredAdminSecretKeys();

  const envChecks = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(supabaseUrl),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceRoleKey),
    ADMIN_SECRET_CONFIGURED: configuredSecretKeys.length > 0,
  };

  const missingEnv = Object.entries(envChecks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    return adminError(
      500,
      "Admin health check failed",
      `Missing required environment configuration: ${missingEnv.join(", ")}`
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { data, error } = await supabase
      .from("workspace_settings")
      .select("id, tenant_id, brand_id, workspace_id, key, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) {
      return adminError(500, "Admin health check failed", error.message);
    }

    const latestWorkspaceSetting =
      Array.isArray(data) && data.length > 0 ? data[0] : null;

    const workspaceDisplayName = branding.workspaceDisplayName;

    return adminJson({
      branding,
      ok: true,
      
      workspaceDisplayName,
      timestamp,
      auth: {
        ok: true,
        matchedHeader: auth.matchedHeader,
        matchedEnvKey: auth.matchedEnvKey,
      },
      checks: {
        env: {
          ok: true,
          configuredSecretKeys,
        },
        db: {
          ok: true,
          latestWorkspaceSetting,
        },
      },
      links: {
        adminHome: "/admin",
        summary: "/admin/summary",
        strategy: "/admin/strategy",
        execution: "/admin/execution",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown admin health error";

    return adminError(500, "Admin health check failed", message);
  }
}