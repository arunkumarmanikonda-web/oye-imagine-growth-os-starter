import { cookies } from 'next/headers'
import {
  ACCESS_COOKIE_KEYS,
  getPostLoginDestination,
  resolveAccessRoleFromCookies,
} from './recovery/auth-foundation'

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
  const role = resolveAccessRoleFromCookies({
    [ACCESS_COOKIE_KEYS.role]: cookieStore.get(ACCESS_COOKIE_KEYS.role)?.value,
    [ACCESS_COOKIE_KEYS.authReady]: cookieStore.get(ACCESS_COOKIE_KEYS.authReady)?.value,
  })

  return {
    role,
    isOperator: role === 'operator',
    isAuthenticated: role !== 'anonymous',
    postLoginDestination: getPostLoginDestination(role),
  }
}