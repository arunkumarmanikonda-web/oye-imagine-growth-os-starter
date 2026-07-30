import { describe, expect, it } from 'vitest'
import { getPublicHomepageExperience } from '@/lib/recovery/surface-composer'

describe('foundation-recovery-surface-composer-public', () => {
  it('builds a premium public homepage experience from controller-backed content', () => {
    const experience = getPublicHomepageExperience()

    expect(experience.page.slug).toBe('/')
    expect(experience.hero.title.toLowerCase()).toContain('ai-native')
    expect(experience.featureSections.length).toBeGreaterThan(0)
    expect(experience.primaryCtas.length).toBe(3)
  })

  it('carries legal identity, featured people and faq support into the public surface', () => {
    const experience = getPublicHomepageExperience()

    expect(experience.organization.legalIdentity.gstin).toBe('09AAECO6856D1Z8')
    expect(experience.featuredPeople.length).toBeGreaterThan(0)
    expect(experience.faqEntries.length).toBeGreaterThan(0)
  })
})