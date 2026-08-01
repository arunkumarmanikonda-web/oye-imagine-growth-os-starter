import { describe, expect, it } from 'vitest'
import {
  getContactExperience,
  getMarketplaceExperience,
} from '@/lib/recovery/surface-composer'

describe('foundation-recovery-surface-composer-commercial', () => {
  it('builds marketplace experience with service lanes and premium request process', () => {
    const experience = getMarketplaceExperience()

    expect(experience.page.slug).toBe('/marketplace')
    expect(experience.lanes.length).toBeGreaterThan(1)
    expect(experience.process.length).toBe(3)
    expect(experience.entryCtas.some((cta) => cta.href === '/contact')).toBe(true)
  })

  it('builds contact experience from governed support and legal identity surfaces', () => {
    const experience = getContactExperience()

    expect(experience.page.slug).toBe('/contact')
    expect(experience.contactCards.length).toBe(3)
    expect(experience.supportChannels.some((channel) => channel.value === 'hello@oyeimagine.com')).toBe(true)
  })
})