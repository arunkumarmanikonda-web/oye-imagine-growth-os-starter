import { afterEach, describe, expect, it } from 'vitest'

import {
  getBatchARuntimeFlags,
  getRuntimeRoutePolicies,
  getRuntimeShellAudit,
  resolveRuntimeAccess
} from '../../src/lib/recovery/runtime-enforcement-foundation'

const originalGuards = process.env.ENABLE_BATCH_A_ROUTE_GUARDS
const originalLiveSession = process.env.ENABLE_BATCH_A_LIVE_SESSION

afterEach(() => {
  if (typeof originalGuards === 'undefined') {
    delete process.env.ENABLE_BATCH_A_ROUTE_GUARDS
  } else {
    process.env.ENABLE_BATCH_A_ROUTE_GUARDS = originalGuards
  }

  if (typeof originalLiveSession === 'undefined') {
    delete process.env.ENABLE_BATCH_A_LIVE_SESSION
  } else {
    process.env.ENABLE_BATCH_A_LIVE_SESSION = originalLiveSession
  }
})

describe('mega batch a runtime enforcement foundation', () => {
  it('defaults runtime flags to disabled when env values are absent', () => {
    delete process.env.ENABLE_BATCH_A_ROUTE_GUARDS
    delete process.env.ENABLE_BATCH_A_LIVE_SESSION

    const flags = getBatchARuntimeFlags()

    expect(flags.guardsEnabled).toBe(false)
    expect(flags.liveSessionEnabled).toBe(false)
  })

  it('registers the protected client and admin route policies', () => {
    const prefixes = getRuntimeRoutePolicies().map((policy) => policy.prefix)

    expect(prefixes).toContain('/client')
    expect(prefixes).toContain('/admin')
    expect(prefixes).toContain('/admin/content')
    expect(prefixes).toContain('/admin/config')
    expect(prefixes).toContain('/admin/support')
    expect(prefixes).toContain('/admin/runtime')
  })

  it('allows protected routes when route guards are disabled', () => {
    delete process.env.ENABLE_BATCH_A_ROUTE_GUARDS

    const decision = resolveRuntimeAccess({
      pathname: '/admin/support',
      role: 'public',
      isAuthenticated: false,
      workspaceId: null
    })

    expect(decision.allow).toBe(true)
    expect(decision.reason).toBe('guards_disabled')
    expect(decision.surface).toBe('admin')
  })

  it('redirects unauthenticated client access to client login when guards are enabled', () => {
    process.env.ENABLE_BATCH_A_ROUTE_GUARDS = 'true'

    const decision = resolveRuntimeAccess({
      pathname: '/client',
      role: 'public',
      isAuthenticated: false,
      workspaceId: null
    })

    expect(decision.allow).toBe(false)
    expect(decision.redirectTo).toBe('/login/client')
    expect(decision.errorCode).toBe('unauthenticated')
    expect(decision.redirectPath).toBe('/client')
  })

  it('redirects mismatched roles away from admin routes when guards are enabled', () => {
    process.env.ENABLE_BATCH_A_ROUTE_GUARDS = 'true'

    const decision = resolveRuntimeAccess({
      pathname: '/admin/config',
      role: 'client',
      isAuthenticated: true,
      workspaceId: 'neejee'
    })

    expect(decision.allow).toBe(false)
    expect(decision.redirectTo).toBe('/login/admin')
    expect(decision.errorCode).toBe('insufficient_role')
  })

  it('requires a workspace and permits authenticated admin access when workspace is present', () => {
    process.env.ENABLE_BATCH_A_ROUTE_GUARDS = 'true'

    const missingWorkspaceDecision = resolveRuntimeAccess({
      pathname: '/client',
      role: 'client',
      isAuthenticated: true,
      workspaceId: null
    })

    expect(missingWorkspaceDecision.allow).toBe(false)
    expect(missingWorkspaceDecision.errorCode).toBe('workspace_required')

    const allowedDecision = resolveRuntimeAccess({
      pathname: '/admin/runtime',
      role: 'admin',
      isAuthenticated: true,
      workspaceId: 'neejee'
    })

    expect(allowedDecision.allow).toBe(true)
    expect(allowedDecision.reason).toBe('allowed')

    const audit = getRuntimeShellAudit()
    expect(audit.protectedPrefixes).toContain('/admin/runtime')
    expect(audit.governanceRules.some((rule) => rule.toLowerCase().includes('workspace'))).toBe(true)
  })
})