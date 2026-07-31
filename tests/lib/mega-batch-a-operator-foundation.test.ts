import { describe, expect, it } from 'vitest'
import {
  getOperatorConfigExperience,
  getOperatorContentStudioExperience,
  getOperatorDashboardExperience,
} from '@/lib/recovery/operator-foundation'

describe('mega batch a operator foundation', () => {
  it('builds operator dashboard cards for content studio and config control plane', () => {
    const experience = getOperatorDashboardExperience()
    expect(experience.cards.map((card) => card.href)).toEqual(['/admin/content', '/admin/config', '/login'])
    expect(experience.trustBlock.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
  })

  it('builds content studio snapshot for visible ui control', () => {
    const experience = getOperatorContentStudioExperience()
    expect(experience.snapshot.homepageSectionCount).toBeGreaterThan(0)
    expect(experience.snapshot.supportChannelCount).toBe(3)
    expect(experience.modules.length).toBe(6)
  })

  it('builds config control plane with legal profile and provider scaffold', () => {
    const experience = getOperatorConfigExperience()
    expect(experience.legalProfile.gstin).toBe('09AAECO6856D1Z8')
    expect(experience.supportChannels[0].value).toBe('hello@oyeimagine.com')
    expect(experience.providers.map((provider) => provider.name)).toContain('Resend')
  })
})