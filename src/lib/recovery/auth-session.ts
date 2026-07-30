import type { RecoveryAuthRole, RecoveryAuthSession } from './auth-types'
import { RECOVERY_AUTH_COOKIE_KEYS } from './auth-types'

function sanitizeSessionValue(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '-')
}

export function normalizeRecoveryAuthRole(value?: string | null): RecoveryAuthRole {
  const normalized = (value ?? '').trim().toLowerCase()

  if (normalized === 'client') {
    return 'client'
  }

  if (normalized === 'admin' || normalized === 'operator' || normalized === 'ops') {
    return 'operator'
  }

  return 'public'
}

export function buildRecoveryAuthSession(
  cookieMap: Record<string, string | undefined>
): RecoveryAuthSession {
  const role = normalizeRecoveryAuthRole(cookieMap[RECOVERY_AUTH_COOKIE_KEYS.role])
  const sessionId = cookieMap[RECOVERY_AUTH_COOKIE_KEYS.sessionId] ?? null
  const email = cookieMap[RECOVERY_AUTH_COOKIE_KEYS.email] ?? null
  const displayName = cookieMap[RECOVERY_AUTH_COOKIE_KEYS.displayName] ?? null
  const isAuthenticated = Boolean(sessionId && role !== 'public')

  return {
    sessionId,
    role,
    email,
    displayName,
    isAuthenticated,
  }
}

export function createRecoverySessionPayload(input: {
  email: string
  role: string
  displayName?: string
}) {
  const normalizedRole = normalizeRecoveryAuthRole(input.role)
  const normalizedEmail = sanitizeSessionValue(input.email)
  const displayName = input.displayName?.trim() || normalizedEmail.split('@')[0] || 'User'
  const sessionId = `sess_${normalizedRole}_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`

  return {
    sessionId,
    role: normalizedRole,
    email: normalizedEmail,
    displayName,
  }
}

export function clearRecoverySessionPayload() {
  return {
    sessionId: '',
    role: 'public',
    email: '',
    displayName: '',
  }
}