import { describe, expect, it } from 'vitest'
import {
  getLoginHubExperience,
  getLoginSurfaceExperience,
  getOperatorDashboardExperience,
} from '@/lib/recovery/surface-composer'

describe('foundation-recovery-surface-composer-operator', () => {
  it('builds operator dashboard from controller-backed command data', () => {
    const experience = getOperatorDashboardExperience()

    expect(experience.page.slug).toBe('/admin')
    expect(experience.contentPanels.length).toBeGreaterThan(0)
    expect(experience.workspaceOptions.some((workspace) => workspace.workspaceId === 'workspace_neejee')).toBe(true)
  })

  it('builds distinct secure login surfaces for client and operator roles', () => {
    const clientExperience = getLoginSurfaceExperience('client')
    const operatorExperience = getLoginSurfaceExperience('operator')
    const hubExperience = getLoginHubExperience()

    expect(clientExperience.hiddenRole).toBe('client')
    expect(operatorExperience.hiddenRole).toBe('operator')
    expect(hubExperience.options.length).toBe(2)
  })
})