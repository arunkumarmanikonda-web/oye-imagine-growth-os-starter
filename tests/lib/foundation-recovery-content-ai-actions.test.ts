import { describe, expect, it } from 'vitest'
import {
  createAiDraftEnvelope,
  listAiAssistedContentActions,
} from '@/lib/recovery/content-governance'

describe('foundation-recovery-content-ai-actions', () => {
  it('creates governed draft envelopes only for known targets and actions', () => {
    const response = createAiDraftEnvelope({
      targetId: 'marketplace-hero',
      actionId: 'draft_hero_variant',
      prompt: 'Emphasize premium specialist matching and governed delivery.',
      requestedFields: ['title', 'summary'],
    })

    expect(response.status).toBe('draft_ready')
    expect(response.requiresReview).toBe(true)
    expect(response.allowedFields).toContain('title')
  })

  it('keeps the action catalog review-aware', () => {
    const actions = listAiAssistedContentActions()
    expect(actions.length).toBeGreaterThan(0)
    expect(actions.some((action) => action.requiresReview)).toBe(true)
  })
})