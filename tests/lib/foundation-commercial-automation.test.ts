import { describe, expect, it } from 'vitest'
import { buildCommercialAutomationJobs, getCommercialAutomationSummary } from '../../src/lib/commercial/commercial-automation'

describe('commercial-automation', () => {
  it('builds workspace-specific automation jobs for neejee', () => {
    const jobs = buildCommercialAutomationJobs('neejee', '2026-08-05T00:00:00.000Z')

    expect(jobs).toHaveLength(2)
    expect(jobs.some((job) => job.kind === 'agreement_followup')).toBe(true)
    expect(jobs.some((job) => job.kind === 'invoice_reminder')).toBe(true)
    expect(jobs.every((job) => job.workspaceKey === 'neejee')).toBe(true)
  })

  it('summarizes automation across all workspaces', () => {
    const summary = getCommercialAutomationSummary('all', '2026-08-05T00:00:00.000Z')

    expect(summary.total).toBe(4)
    expect(summary.byKind.agreement_followup).toBe(1)
    expect(summary.byKind.invoice_reminder).toBe(1)
    expect(summary.byKind.collections_escalation).toBe(1)
    expect(summary.byKind.renewal_nudge).toBe(1)
    expect(summary.byPriority.critical).toBe(1)
    expect(summary.workspaces).toContain('rocketboys')
  })
})