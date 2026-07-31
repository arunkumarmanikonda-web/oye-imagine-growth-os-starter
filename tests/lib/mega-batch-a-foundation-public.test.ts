import { describe, expect, it } from 'vitest'
import { getContactExperience, getLoginHubExperience, getPublicHomepageExperience } from '@/lib/recovery/surface-composer'

describe('mega batch a public foundation', () => {
  it('exposes legal identity and removes fake readiness messaging from homepage experience', () => {
    const experience = getPublicHomepageExperience()

    expect(experience.trustBlock.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.trustBlock.taxIdentity.gstin).toBe('09AAECO6856D1Z8')

    const labels = experience.navigation.map((item) => item.label)
    expect(labels).toEqual(['Home', 'Marketplace', 'Contact', 'Login'])

    expect(experience.hero.title.toLowerCase()).not.toContain('100%')
    expect(experience.hero.title.toLowerCase()).not.toContain('shell overhaul')
    expect(experience.hero.body.toLowerCase()).not.toContain('operational readiness is complete')
  })

  it('provides separate client and operator access paths', () => {
    const experience = getLoginHubExperience()
    expect(experience.cards.map((card) => card.href)).toEqual(['/login/client', '/login/admin'])
  })

  it('embeds support contact in the contact experience', () => {
    const experience = getContactExperience()
    expect(experience.supportChannels[0].value).toBe('hello@oyeimagine.com')
    expect(experience.supportChannels[1].value).toBe('+91 8 988 988 988')
  })
})