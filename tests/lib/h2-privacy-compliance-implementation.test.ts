import { describe, expect, it } from 'vitest'
import {
  buildComplianceDecision,
  canSendMarketing,
  getRetentionRule,
  governanceCheckpoints,
  grievanceWorkflow,
  isComplianceBaselineOperational,
  isRetentionExpired,
  isSuppressed,
} from '../../src/lib/compliance/h2-privacy-compliance-implementation'

describe('h2 privacy and compliance implementation', () => {
  it('allows marketing only when consent is granted and not suppressed', () => {
    expect(canSendMarketing('cust-active', 'email')).toBe(true)
    expect(canSendMarketing('cust-suppressed', 'email')).toBe(false)
    expect(canSendMarketing('cust-contract-only', 'email')).toBe(false)
  })

  it('tracks suppression explicitly', () => {
    expect(isSuppressed('cust-suppressed')).toBe(true)
    expect(isSuppressed('cust-active')).toBe(false)
  })

  it('defines retention rules for governed data kinds', () => {
    expect(getRetentionRule('invoice')).toBeDefined()
    expect(getRetentionRule('generated-artifact')).toBeDefined()
  })

  it('flags retention expiry for deletable records', () => {
    expect(
      isRetentionExpired(
        'marketing-contact',
        '2024-01-01T00:00:00Z',
        '2026-08-07T00:00:00Z',
      ),
    ).toBe(true)
  })

  it('builds blocked decisions for suppressed marketing requests', () => {
    const decision = buildComplianceDecision({
      subjectId: 'cust-suppressed',
      channel: 'email',
      requiresMarketingConsent: true,
      dataKind: 'marketing-contact',
      createdAt: '2026-08-01T00:00:00Z',
      asOf: '2026-08-07T00:00:00Z',
    })

    expect(decision.status).toBe('blocked')
    expect(decision.reasons.join(' ')).toContain('Suppression')
  })

  it('builds review-required decisions for expired deletable data', () => {
    const decision = buildComplianceDecision({
      subjectId: 'cust-active',
      channel: 'email',
      requiresMarketingConsent: false,
      dataKind: 'marketing-contact',
      createdAt: '2024-01-01T00:00:00Z',
      asOf: '2026-08-07T00:00:00Z',
    })

    expect(decision.status).toBe('review-required')
  })

  it('keeps grievance and policy enforcement controls visible', () => {
    expect(grievanceWorkflow.length).toBe(3)
    expect(governanceCheckpoints.some((item) => item.domain === 'policy-enforcement')).toBe(true)
  })

  it('meets operational baseline completeness', () => {
    expect(isComplianceBaselineOperational()).toBe(true)
  })
})
