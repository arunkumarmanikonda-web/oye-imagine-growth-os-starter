import { buildRecoveryAuthSession } from './auth-session'
import { RECOVERY_AUTH_COOKIE_KEYS } from './auth-types'

type CookieReader = {
  get(name: string): { value: string } | undefined
}

export function buildRecoveryAuthSessionFromCookieStore(cookieStore: CookieReader) {
  return buildRecoveryAuthSession({
    [RECOVERY_AUTH_COOKIE_KEYS.sessionId]: cookieStore.get(RECOVERY_AUTH_COOKIE_KEYS.sessionId)?.value,
    [RECOVERY_AUTH_COOKIE_KEYS.role]: cookieStore.get(RECOVERY_AUTH_COOKIE_KEYS.role)?.value,
    [RECOVERY_AUTH_COOKIE_KEYS.email]: cookieStore.get(RECOVERY_AUTH_COOKIE_KEYS.email)?.value,
    [RECOVERY_AUTH_COOKIE_KEYS.displayName]: cookieStore.get(RECOVERY_AUTH_COOKIE_KEYS.displayName)?.value,
  })
}

export function getSelectedWorkspaceIdFromCookieStore(cookieStore: CookieReader) {
  return cookieStore.get(RECOVERY_AUTH_COOKIE_KEYS.activeWorkspaceId)?.value ?? null
}