import { describe, expect, it } from 'vitest'
import { buildConciergeExperiencePayload } from '@/lib/ai/concierge-experience'
import {
  buildDemoAdminConciergeScope,
  buildDemoMarketplaceConciergeScope,
} from '@/lib/ai/concierge-retrieval-registry'

describe('foundation-concierge-experience-marketplace', () => {
  it('builds marketplace-native prompt presets and guided actions without client finance leakage', () => {
    const payload = buildConciergeExperiencePayload(
      buildDemoMarketplaceConciergeScope(),
      'marketplace_surface',
      'proposal status, specialist availability and approved deliverables'
    )

    expect(payload.shell.promptPresets.length).toBeGreaterThan(0)
    expect(payload.guidedAnswer.answer.results.some((result) => result.kind === 'invoice')).toBe(false)
    expect(
      payload.guidedAnswer.answer.results.some(
        (result) => result.kind === 'proposal' || result.kind === 'marketplace_request'
      )
    ).toBe(true)
  })

  it('allows admin audit payload to retain source chips for guarded internal answers', () => {
    const payload = buildConciergeExperiencePayload(
      buildDemoAdminConciergeScope(),
      'help_panel',
      'margin health and secret config'
    )

    expect(payload.guidedAnswer.sourceChips.length).toBeGreaterThan(0)
    expect(payload.guidedAnswer.answer.resultCount).toBeGreaterThan(0)
  })
})