import { describe, expect, it } from 'vitest'
import { validateNewPassword } from '../../src/lib/auth/password-policy'

describe('first-login password policy', () => {
  it('rejects short or weak passwords', () => {
    expect(validateNewPassword('simple').valid).toBe(false)
    expect(validateNewPassword('alllowercase123!').valid).toBe(false)
  })

  it('accepts a sufficiently strong replacement password', () => {
    expect(validateNewPassword('OyeSecure@2026')).toEqual({ valid: true, issues: [] })
  })
})
