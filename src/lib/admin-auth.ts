import { cookies } from 'next/headers'
import { authCookieKeys, resolveAuthSessionFromCookieMap } from './auth/session'
import { ACTIVE_WORKSPACE_COOKIE_KEY, buildWorkspaceContext } from './recovery/workspace-foundation'

type AdminAuthSuccess = {
  ok: true
  matchedHeader: string
  matchedEnvKey: string
}

type AdminAuthFailure = {
  ok: false
  reason: string
}

type AdminSecretEntry = {
  envKey: string
  value: string
}

function readConfiguredAdminSecrets(): AdminSecretEntry[] {
  return [
    { envKey: 'ADMIN_SECRET', value: String(process.env.ADMIN_SECRET ?? '').trim() },
    { envKey: 'ADMIN_API_KEY', value: String(process.env.ADMIN_API_KEY ?? '').trim() },
    { envKey: 'ADMIN_SECRET_KEY', value: String(process.env.ADMIN_SECRET_KEY ?? '').trim() },
  ].filter((entry) => entry.value.length > 0)
}

export function getConfiguredAdminSecretKeys() {
  return readConfiguredAdminSecrets().map((entry) => entry.envKey)
}

export function authorizeAdminRequest(request: Request): AdminAuthSuccess | AdminAuthFailure {
  const configuredSecrets = readConfiguredAdminSecrets()

  if (configuredSecrets.length === 0) {
    return {
      ok: false,
      reason: 'admin_secret_not_configured',
    }
  }

  const headerCandidates = [
    {
      header: 'x-admin-secret',
      value: String(request.headers.get('x-admin-secret') ?? '').trim(),
    },
    {
      header: 'authorization',
      value: String(request.headers.get('authorization') ?? '')
        .replace(/^Bearer\s+/i, '')
        .trim(),
    },
  ].filter((candidate) => candidate.value.length > 0)
for (const candidate of headerCandidates) {
    const matchedSecret = configuredSecrets.find((entry) => entry.value === candidate.value)
    if (matchedSecret) {
      return {
        ok: true,
        matchedHeader: candidate.header,
        matchedEnvKey: matchedSecret.envKey,
      }
    }
  }

  return {
    ok: false,
    reason: 'admin_secret_invalid',
  }
}

export async function getOperatorAccessState() {
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
    role: 'operator',
    cookieWorkspaceId: workspaceCookie,
    allowedWorkspaceIds: ['workspace_neejee_primary', 'workspace_oye_internal'],
  })

  return {
    lane: session.lane,
    email: session.email,
    isOperator: session.lane === 'admin',
    isAuthenticated: session.isAuthenticated,
    workspaceSlug: workspaceContext.activeWorkspaceId,
    tenantSlug: session.tenantSlug ?? workspaceContext.activeTenantId,
    brandSlug: session.brandSlug ?? workspaceContext.activeBrandId,
    postLoginDestination: '/admin',
  }
}


