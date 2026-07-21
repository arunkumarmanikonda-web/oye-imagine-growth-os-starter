import { getAdminContexts, type AdminWorkspaceContext } from "@/lib/admin/context";

export async function requireActiveAdminContext(): Promise<AdminWorkspaceContext> {
  const { active } = await getAdminContexts();

  if (!active) {
    throw new Error("No active admin context");
  }

  return active;
}