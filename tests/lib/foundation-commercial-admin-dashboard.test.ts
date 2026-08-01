import { describe, expect, it } from 'vitest'
import {
  getAdminCommercialDashboardExperience,
  getCommercialDashboardSnapshot,
} from '@/lib/recovery/commercial-dashboard-foundation'

describe('foundation-commercial-admin-dashboard', () => {
  it('exposes stable admin commercial dashboard metadata and workflow cards', () => {
    const snapshot = getCommercialDashboardSnapshot()
    const experience = getAdminCommercialDashboardExperience()

    expect(snapshot.supportStatusCount).toBe(4)
    expect(snapshot.workflowStageCount).toBe(4)
    expect(experience.workflowCards.length).toBe(3)
    expect(experience.workflow.overallStatus).toBe('workflow_closed')
  })

  it('keeps client dashboard payload embedded in the admin experience', () => {
    const experience = getAdminCommercialDashboardExperience()

    expect(experience.dashboard.invoiceSummary.totalInr).toBeGreaterThan(0)
    expect(experience.dashboard.supportSummary.activeThreadCount).toBeGreaterThan(0)
  })
})