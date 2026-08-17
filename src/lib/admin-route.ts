/**
 * Compatibility guard for legacy admin route handlers.
 *
 * Network requests to /api/admin/:path* are authenticated before route
 * execution by src/proxy.ts -> updateSession(), which requires an active
 * admin-lane membership and AAL2 for every privileged request. New routes
 * should additionally use requireApiAccess() for permission-level checks.
 */
export function requireAdmin(_request: Request) {
  return null
}
