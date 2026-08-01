import { describe, expect, it } from 'vitest'
import {
  COMMERCIAL_AGREEMENT_STATUSES,
  COMMERCIAL_APPROVAL_STAGES,
  COMMERCIAL_BILLING_MODELS,
  COMMERCIAL_SCOPE_LANES,
} from '@/lib/recovery/commercial-agreement-types'

describe('foundation-commercial-agreement-types', () => {
  it('exposes commercial status, approval and lane constants', () => {
    expect(COMMERCIAL_AGREEMENT_STATUSES).toContain('intake_ready')
    expect(COMMERCIAL_APPROVAL_STAGES).toContain('legal_review')
    expect(COMMERCIAL_BILLING_MODELS).toContain('monthly_retainer')
    expect(COMMERCIAL_SCOPE_LANES).toContain('marketplace_specialist')
  })
})