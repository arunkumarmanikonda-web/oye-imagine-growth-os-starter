import { describe, expect, it } from 'vitest'
import {
  getContentControllerPanels,
  getContentStudioSnapshot,
  listAiContentOperations,
  listContentPromotions,
  listPeopleProfiles,
  listSectionsForPage,
} from '@/lib/recovery/content-controller'

describe('foundation-recovery-content-controller', () => {
  it('builds the CMS/controller foundation for visible business-facing content', () => {
    const snapshot = getContentStudioSnapshot()

    expect(snapshot.totalPages).toBeGreaterThan(0)
    expect(snapshot.totalSections).toBeGreaterThan(0)
    expect(snapshot.totalPromotions).toBeGreaterThan(0)
    expect(snapshot.totalPeopleProfiles).toBeGreaterThan(0)
  })

  it('exposes leadership, promo and ai-operated surfaces', () => {
    const panels = getContentControllerPanels()
    const aiOps = listAiContentOperations()
    const promotions = listContentPromotions()
    const people = listPeopleProfiles()
    const homeSections = listSectionsForPage('page_public_home')

    expect(panels.some((panel) => panel.label === 'Leadership and experts')).toBe(true)
    expect(aiOps.some((operation) => operation.kind === 'generate_banner')).toBe(true)
    expect(aiOps.some((operation) => operation.kind === 'rollback_version')).toBe(true)
    expect(promotions.length).toBeGreaterThan(0)
    expect(people.some((person) => person.role === 'leadership')).toBe(true)
    expect(homeSections.some((section) => section.kind === 'hero')).toBe(true)
  })
})