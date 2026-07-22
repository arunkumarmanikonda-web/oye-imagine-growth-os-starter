import { adminJson, adminError, adminUnauthorized } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-route";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminContexts } from "@/lib/admin/context";

export async function GET(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return adminJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { active, options } = await getAdminContexts();

    return adminJson({
      ok: true,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      active,
      options,
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