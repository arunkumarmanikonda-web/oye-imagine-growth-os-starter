import { describe, expect, it } from 'vitest'
import {
  getContactExperience,
  getLoginHubExperience,
  getMarketplaceExperience,
  getPublicHomepageExperience,
} from '../../src/lib/recovery/surface-composer'

describe('c4 website/page operating system and neejee end-to-end proof', () => {
  it('proves the public website shell exposes canonical navigation', () => {
    const homepage = getPublicHomepageExperience()
    expect(homepage.navigation.map((item) => item.label)).toEqual(['Home', 'Marketplace', 'Contact', 'Login'])
    expect(homepage.navigation.map((item) => item.href)).toEqual(['/', '/marketplace', '/contact', '/login'])
  })

  it('proves the login hub keeps the client and admin split', () => {
    const loginHub = getLoginHubExperience()
    expect(loginHub.cards.map((card) => card.href)).toEqual(['/login/client', '/login/admin'])
    expect(loginHub.cards.map((card) => card.label)).toEqual(['Client access', 'Admin workspace'])
  })

  it('proves marketplace and contact surfaces are populated', () => {
    const marketplace = getMarketplaceExperience()
    const contact = getContactExperience()

    expect(marketplace.hero.title.length).toBeGreaterThan(0)
    expect(contact.hero.title.length).toBeGreaterThan(0)
    expect(contact.supportChannels.some((channel) => String(channel.value).includes('hello@oyeimagine.com'))).toBe(true)
    expect(contact.supportChannels.some((channel) => String(channel.value).includes('+91'))).toBe(true)
  })
})