import { describe, expect, it } from 'vitest'
import {
  buildConciergeExperiencePayload,
  buildConciergeExperienceShell,
} from '@/lib/ai/concierge-experience'
import { buildDemoClientConciergeScope } from '@/lib/ai/concierge-retrieval-registry'

describe('foundation-concierge-experience-engine', () => {
  it('builds premium shell and guided answer for client finance retrieval', () => {
    const scope = buildDemoClientConciergeScope()
    const shell = buildConciergeExperienceShell(scope, 'client_dashboard')
    const payload = buildConciergeExperiencePayload(
      scope,
      'client_dashboard',
      'where is my overdue invoice and what reports are available'
    )

    expect(shell.promptPresets.length).toBeGreaterThan(0)
    expect(payload.guidedAnswer.answer.permissionScoped).toBe(true)
    expect(payload.guidedAnswer.sourceChips.length).toBeGreaterThan(0)
    expect(payload.guidedAnswer.actionCards.length).toBeGreaterThan(0)
    expect(
      payload.guidedAnswer.actionCards.some(
        (card) => card.action === 'open_invoice' || card.action === 'open_report'
      )
    ).toBe(true)
  })

  it('builds support-center experience with next-step guidance', () => {
    const payload = buildConciergeExperiencePayload(
      buildDemoClientConciergeScope(),
      'support_center',
      'show support requests and onboarding blockers'
    )

    expect(payload.shell.title).toContain('Support')
    expect(payload.guidedAnswer.nextStepCards.length).toBeGreaterThan(0)
  })
})