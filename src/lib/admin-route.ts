import { adminUnauthorized } from "@/lib/admin-api";
import { authorizeAdminRequest } from "@/lib/admin-auth";

export function requireAdmin(request: Request) {
  const auth = authorizeAdminRequest(request);
  if (!auth.ok) {
    return adminUnauthorized(auth.reason);
  }

  return null;
}