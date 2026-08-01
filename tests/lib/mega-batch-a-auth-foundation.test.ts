import { describe, expect, it } from 'vitest'
import {
  ACCESS_COOKIE_KEYS,
  getAccessDomain,
  getLoginRedirect,
  getPostLoginDestination,
  hasSupabaseSessionCookie,
  resolveAccessRoleFromCookies,
  shouldProtectPath,
  shouldRedirectForRole,
} from '@/lib/recovery/auth-foundation'

describe('mega batch a auth foundation', () => {
  it('maps route domains correctly', () => {
    expect(getAccessDomain('/')).toBe('public')
    expect(getAccessDomain('/login/client')).toBe('client_auth')
    expect(getAccessDomain('/login/admin')).toBe('operator_auth')
    expect(getAccessDomain('/client')).toBe('client_protected')
    expect(getAccessDomain('/admin/config')).toBe('operator_protected')
  })

  it('detects supabase-like session cookies', () => {
    expect(hasSupabaseSessionCookie(['sb-project-auth-token'])).toBe(true)
    expect(hasSupabaseSessionCookie(['other-cookie'])).toBe(false)
  })

  it('resolves access role from cookies', () => {
    expect(
      resolveAccessRoleFromCookies({
        [ACCESS_COOKIE_KEYS.role]: 'operator',
        [ACCESS_COOKIE_KEYS.authReady]: undefined,
      }),
    ).toBe('operator')

    expect(
      resolveAccessRoleFromCookies({
        [ACCESS_COOKIE_KEYS.role]: undefined,
        [ACCESS_COOKIE_KEYS.authReady]: 'true',
      }),
    ).toBe('client')

    expect(
      resolveAccessRoleFromCookies({
        [ACCESS_COOKIE_KEYS.role]: undefined,
        [ACCESS_COOKIE_KEYS.authReady]: undefined,
      }),
    ).toBe('anonymous')
  })

  it('builds correct login redirects and destinations', () => {
    expect(getLoginRedirect('/admin/config')).toBe('/login/admin?redirect=%2Fadmin%2Fconfig')
    expect(getLoginRedirect('/client')).toBe('/login/client?redirect=%2Fclient')
    expect(getPostLoginDestination('operator')).toBe('/admin')
    expect(getPostLoginDestination('client')).toBe('/client')
  })

  it('protects the correct paths and redirects only where appropriate', () => {
    expect(shouldProtectPath('/admin')).toBe(true)
    expect(shouldProtectPath('/client/reports')).toBe(true)
    expect(shouldProtectPath('/login')).toBe(false)

    expect(shouldRedirectForRole('/admin', 'anonymous')).toBe(true)
    expect(shouldRedirectForRole('/admin', 'client')).toBe(true)
    expect(shouldRedirectForRole('/admin', 'operator')).toBe(false)

    expect(shouldRedirectForRole('/client', 'anonymous')).toBe(true)
    expect(shouldRedirectForRole('/client', 'client')).toBe(false)
    expect(shouldRedirectForRole('/client', 'operator')).toBe(false)
  })
})