import { describe, expect, it } from 'vitest'
import {
  getAdminLoginExperience,
  getClientLoginExperience,
} from '../../src/lib/recovery/auth-entry-foundation'

describe('mega batch a auth entry foundation', () => {
  it('separates client and operator audiences visibly and structurally', () => {
    const client = getClientLoginExperience()
    const admin = getAdminLoginExperience()

    expect(client.audience).toBe('client')
    expect(admin.audience).toBe('operator')
    expect(client.route).toBe('/login/client')
    expect(admin.route).toBe('/login/admin')
    expect(client.title).not.toBe(admin.title)
  })

  it('keeps operator messaging off the client login experience', () => {
    const client = getClientLoginExperience()
    expect(client.body).not.toContain('operator workspace')
    expect(client.allowedRedirects).toEqual(['/client', '/client/finance', '/client/concierge'])
  })

  it('keeps client messaging off the admin login experience', () => {
    const admin = getAdminLoginExperience()
    expect(admin.body).toContain('not intended for client users')
    expect(admin.allowedRedirects).toEqual([
      '/admin',
      '/admin/ops',
      '/admin/settings',
      '/admin/commercial/onboarding-workspace',
    ])
  })

  it('preserves support/help routes for both login surfaces', () => {
    const client = getClientLoginExperience()
    const admin = getAdminLoginExperience()

    expect(client.supportLinks.map((link) => link.label)).toEqual([
      'Need onboarding help',
      'Email support',
    ])
    expect(admin.supportLinks.map((link) => link.label)).toEqual([
      'Operator support',
      'System contact',
    ])
  })
})
