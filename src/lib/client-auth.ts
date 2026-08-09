import { cookies } from 'next/headers'
import { authCookieKeys, resolveAuthSessionFromCookieMap } from './auth/session'
import { ACTIVE_WORKSPACE_COOKIE_KEY, buildWorkspaceContext } from './recovery/workspace-foundation'

export async function getClientAccessState() {
  const cookieStore = await cookies()
  const session = resolveAuthSessionFromCookieMap({
    [authCookieKeys.lane]: cookieStore.get(authCookieKeys.lane)?.value,
    [authCookieKeys.email]: cookieStore.get(authCookieKeys.email)?.value,
    [authCookieKeys.workspaceSlug]: cookieStore.get(authCookieKeys.workspaceSlug)?.value,
    [authCookieKeys.tenantSlug]: cookieStore.get(authCookieKeys.tenantSlug)?.value,
    [authCookieKeys.brandSlug]: cookieStore.get(authCookieKeys.brandSlug)?.value,
    [authCookieKeys.issuedAt]: cookieStore.get(authCookieKeys.issuedAt)?.value,
  })

  const workspaceCookie = cookieStore.get(ACTIVE_WORKSPACE_COOKIE_KEY)?.value ?? session.workspaceSlug ?? undefined
  const workspaceContext = buildWorkspaceContext({
    role: 'client',
    cookieWorkspaceId: workspaceCookie,
    allowedWorkspaceIds: ['workspace_neejee_primary'],
  })

  return {
    lane: session.lane,
    email: session.email,
    isClient: session.lane === 'client',
    isAuthenticated: session.isAuthenticated,
    workspaceSlug: workspaceContext.activeWorkspaceId,
    tenantSlug: session.tenantSlug ?? workspaceContext.activeTenantId,
    brandSlug: session.brandSlug ?? workspaceContext.activeBrandId,
    postLoginDestination: '/client',
  }
}
