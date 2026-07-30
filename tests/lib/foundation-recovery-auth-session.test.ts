import { describe, expect, it } from 'vitest'
import {
  buildRecoveryAuthSession,
  createRecoverySessionPayload,
  normalizeRecoveryAuthRole,
} from '@/lib/recovery/auth-session'
import { RECOVERY_AUTH_COOKIE_KEYS } from '@/lib/recovery/auth-types'

describe('foundation-recovery-auth-session', () => {
  it('normalizes operator and client roles into the unified human auth model', () => {
    expect(normalizeRecoveryAuthRole('admin')).toBe('operator')
    expect(normalizeRecoveryAuthRole('operator')).toBe('operator')
    expect(normalizeRecoveryAuthRole('client')).toBe('client')
    expect(normalizeRecoveryAuthRole('')).toBe('public')
  })

  it('builds an authenticated session from cookies', () => {
    const session = buildRecoveryAuthSession({
      [RECOVERY_AUTH_COOKIE_KEYS.sessionId]: 'sess_operator_test',
      [RECOVERY_AUTH_COOKIE_KEYS.role]: 'operator',
      [RECOVERY_AUTH_COOKIE_KEYS.email]: 'operator@oyeimagine.com',
      [RECOVERY_AUTH_COOKIE_KEYS.displayName]: 'Oye Operator',
    })

    expect(session.isAuthenticated).toBe(true)
    expect(session.role).toBe('operator')
    expect(session.email).toBe('operator@oyeimagine.com')
  })

  it('creates a foundation session payload for login routes', () => {
    const payload = createRecoverySessionPayload({
      email: 'client@oyeimagine.com',
      role: 'client',
      displayName: 'Oye Client',
    })

    expect(payload.role).toBe('client')
    expect(payload.sessionId.startsWith('sess_client_')).toBe(true)
    expect(payload.email).toBe('client@oyeimagine.com')
  })
})