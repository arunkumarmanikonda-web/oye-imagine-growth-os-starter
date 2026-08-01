import { describe, expect, it } from 'vitest'
import {
  createPublishWorkflow,
  getAdminContentStudioExperience,
} from '@/lib/recovery/content-governance'

describe('foundation-recovery-content-publish-workflow', () => {
  it('blocks immutable identity edits during publish planning', () => {
    const response = createPublishWorkflow({
      targetId: 'contact-hero',
      requestedFields: ['title', 'gstin'],
      changeSummary: 'Refresh hero copy and identity line.',
      actorLabel: 'Recovery operator',
    })

    expect(response.status).toBe('blocked')
    expect(response.blockedFields).toContain('gstin')
    expect(response.allowedFields).toContain('title')
  })

  it('builds the admin content studio experience from controller-backed data', () => {
    const experience = getAdminContentStudioExperience()

    expect(experience.workflowLanes.length).toBe(3)
    expect(experience.controllerPanels.length).toBeGreaterThan(0)
    expect(experience.publishedPromotions.length).toBeGreaterThan(0)
  })
})