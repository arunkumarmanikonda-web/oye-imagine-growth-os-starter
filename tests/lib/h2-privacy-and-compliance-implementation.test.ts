import { describe, expect, it } from 'vitest'
import { getLegalGovernanceExperience } from '@/lib/recovery/legal-governance-foundation'

describe('H2 privacy and compliance implementation', () => {
  it('publishes canonical legal identity', () => {
    const experience = getLegalGovernanceExperience()
    expect(experience.legalIdentity.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.legalIdentity.gstin).toBe('09AAECO6856D1Z8')
    expect(experience.legalIdentity.cin).toBe('U47190UP2025PTC220916')
    expect(experience.legalIdentity.supportEmail).toBe('hello@oyeimagine.com')
    expect(experience.legalIdentity.domain).toBe('oyeimagine.com')
  })

  it('publishes governed compliance documents', () => {
    const experience = getLegalGovernanceExperience()
    expect(experience.governanceDocuments.map((entry) => entry.href)).toEqual([
      '/privacy',
      '/terms',
      '/legal',
      '/support',
    ])
    expect(experience.governanceDocuments.every((entry) => entry.obligations.length >= 3)).toBe(true)
  })

  it('publishes accountable support channels and governance note', () => {
    const experience = getLegalGovernanceExperience()
    expect(experience.supportChannels.length).toBeGreaterThanOrEqual(2)
    expect(experience.supportChannels.some((entry) => entry.value.includes('@'))).toBe(true)
    expect(experience.cmsPublicationNote).toContain('canonical public surfaces')
  })
})