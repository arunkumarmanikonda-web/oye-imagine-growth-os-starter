import { describe, expect, it } from 'vitest'

import { contentPages } from '../../src/lib/recovery/content-controller'
import {
  contentPublishingWorkItems,
  getContentPublishingExperience,
  getContentPublishingSnapshot
} from '../../src/lib/recovery/content-governance-foundation'
import {
  getSupportInboxExperience,
  getSupportInboxSnapshot
} from '../../src/lib/recovery/support-inbox-foundation'

describe('mega batch a support inbox and content governance foundation', () => {
  it('produces the expected support inbox totals', () => {
    const snapshot = getSupportInboxSnapshot()

    expect(snapshot.totalEvents).toBe(4)
    expect(snapshot.openCount).toBe(3)
    expect(snapshot.unassignedCount).toBe(1)
    expect(snapshot.awaitingCustomerCount).toBe(1)
    expect(snapshot.criticalOpenCount).toBe(1)
  })

  it('keeps the canonical support mailbox identity intact', () => {
    const experience = getSupportInboxExperience()

    expect(experience.mailbox.email).toBe('hello@oyeimagine.com')
    expect(experience.mailbox.phone).toBe('+91 8 988 988 988')
    expect(experience.trustProfile.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
  })

  it('produces the expected publishing state distribution', () => {
    const snapshot = getContentPublishingSnapshot()

    expect(snapshot.totalWorkItems).toBe(6)
    expect(snapshot.stateCounts.draft).toBe(2)
    expect(snapshot.stateCounts.review).toBe(2)
    expect(snapshot.stateCounts.scheduled).toBe(1)
    expect(snapshot.stateCounts.published).toBe(1)
  })

  it('keeps preview and rollback coverage for every governed work item', () => {
    const snapshot = getContentPublishingSnapshot()

    expect(snapshot.previewReadyCount).toBe(6)
    expect(snapshot.rollbackReadyCount).toBe(6)
  })

  it('maps governed work items only to known content page slugs', () => {
    const validSlugs = new Set(contentPages.map((page) => page.slug))

    for (const workItem of contentPublishingWorkItems) {
      expect(validSlugs.has(workItem.pageSlug)).toBe(true)
    }
  })

  it('exposes preview routes and governance rules to the content studio experience', () => {
    const experience = getContentPublishingExperience()

    expect(experience.previewRoutes).toHaveLength(6)
    expect(experience.previewRoutes.every((route) => route.previewPath.startsWith('/'))).toBe(true)
    expect(experience.governanceRules.some((rule) => rule.toLowerCase().includes('preview'))).toBe(true)
    expect(experience.governanceRules.some((rule) => rule.toLowerCase().includes('rollback'))).toBe(true)
    expect(experience.governanceRules.some((rule) => rule.toLowerCase().includes('traceable'))).toBe(true)
  })
})