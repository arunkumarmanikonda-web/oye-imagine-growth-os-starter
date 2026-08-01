import { describe, expect, it } from 'vitest'
import {
  getContactExperience,
  getMarketplaceExperience,
  getPublicHomepageExperience,
  publicPrototypeDenylist
} from '../../src/lib/recovery/public-premium-experience'

describe('mega batch a public premium experience foundation', () => {
  it('exposes a premium public shell contract with trust-bound identity', () => {
    const experience = getPublicHomepageExperience()

    expect(experience.hero.title).toContain('premium operating system')
    expect(experience.navigation.map((item) => item.label)).toEqual([
      'Platform',
      'Marketplace',
      'Solutions',
      'Contact',
      'Client login'
    ])
    expect(experience.legalIdentity.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(experience.legalIdentity.gstin).toBe('09AAECO6856D1Z8')
  })

  it('keeps curated public experience text free of prototype denylist phrases', () => {
    const bundledExperienceText = JSON.stringify({
      homepage: getPublicHomepageExperience(),
      marketplace: getMarketplaceExperience(),
      contact: getContactExperience()
    })

    for (const phrase of publicPrototypeDenylist) {
      expect(bundledExperienceText).not.toContain(phrase)
    }
  })

  it('surfaces marketplace discovery as governed categories instead of placeholder readiness', () => {
    const marketplace = getMarketplaceExperience()

    expect(marketplace.categories).toHaveLength(3)
    expect(marketplace.categories.map((category) => category.name)).toEqual([
      'Growth strategy and diagnostics',
      'Execution and content operations',
      'Commercial and managed services'
    ])
  })

  it('embeds contact and legal trust details in the public contact surface', () => {
    const contact = getContactExperience()

    expect(contact.supportChannels.map((channel) => channel.value)).toEqual([
      'hello@oyeimagine.com',
      '+91 8 988 988 988'
    ])
    expect(contact.trustPanel.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(contact.trustPanel.principalAddress).toContain('Sector-132 Maharishi Nagar')
  })
})