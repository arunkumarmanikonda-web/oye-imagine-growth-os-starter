import { describe, expect, it } from 'vitest'
import {
  CONCIERGE_ACTION_TONES,
  CONCIERGE_EXPERIENCE_MODES,
} from '@/lib/ai/concierge-experience-types'

describe('foundation-concierge-experience-types', () => {
  it('exposes premium experience modes and tones', () => {
    expect(CONCIERGE_EXPERIENCE_MODES).toContain('global_search')
    expect(CONCIERGE_EXPERIENCE_MODES).toContain('guided_answer')
    expect(CONCIERGE_EXPERIENCE_MODES).toContain('artifact_jump')
    expect(CONCIERGE_ACTION_TONES).toContain('primary')
    expect(CONCIERGE_ACTION_TONES).toContain('support')
  })
})