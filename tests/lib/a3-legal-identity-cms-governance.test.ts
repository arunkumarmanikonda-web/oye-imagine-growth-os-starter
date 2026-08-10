import { describe, expect, it } from 'vitest'
import {
  getLegalGovernanceExperience,
  governanceDocuments,
  legalIdentity,
  supportChannels
} from '@/lib/recovery/legal-governance-foundation'

describe('mega batch a a3 legal identity cms governance', () => {
  it('publishes non-empty legal identity fields', () => {
    expect(legalIdentity.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(legalIdentity.gstin).toBe('09AAECO6856D1Z8')
    expect(legalIdentity.supportEmail).toBe('hello@oyeimagine.com')
    expect(legalIdentity.principalAddress.length).toBeGreaterThan(20)
  })

  it('publishes canonical public legal and support routes', () => {
    expect(governanceDocuments.map((entry) => entry.href).sort()).toEqual(
      ['/legal', '/privacy', '/support', '/terms'].sort()
    )
    expect(governanceDocuments.every((entry) => entry.obligations.length >= 3)).toBe(true)
  })

  it('binds support operations to the same company identity', () => {
    const experience = getLegalGovernanceExperience()

    expect(supportChannels.map((entry) => entry.value)).toEqual(
      expect.arrayContaining([legalIdentity.supportEmail, legalIdentity.supportPhone])
    )
    expect(experience.cmsPublicationNote).toContain('published')
    expect(experience.legalIdentity.legalName).toBe(legalIdentity.legalName)
  })
})