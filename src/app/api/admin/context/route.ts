import { adminError, adminJson } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-route";
import { getAdminContexts } from "@/lib/admin/context";

export async function GET(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
    const { active, options } = await getAdminContexts();

    return adminJson({
      ok: true,
      user: null,
      active,
      options,
    });
  } catch (error) {
    return adminError(
      500,
      "Failed to load admin context",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}