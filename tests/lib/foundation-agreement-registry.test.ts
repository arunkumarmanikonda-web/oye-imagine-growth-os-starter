import { describe, expect, it } from 'vitest'
import {
  AGREEMENT_REGISTRY,
  findAgreementById,
  getAgreementRegistrySummary,
  getAgreementSummaryCards,
} from '../../src/lib/agreements/agreement-registry'

describe('agreement-registry', () => {
  it('returns seeded agreements with multiple lifecycle states', () => {
    expect(AGREEMENT_REGISTRY.length).toBe(4)
    expect(AGREEMENT_REGISTRY.some((record) => record.status === 'issued')).toBe(true)
    expect(AGREEMENT_REGISTRY.some((record) => record.status === 'signed')).toBe(true)
  })

  it('builds summary counts and admin cards', () => {
    const summary = getAgreementRegistrySummary()
    const cards = getAgreementSummaryCards()

    expect(summary.total).toBe(4)
    expect(summary.templates).toBe(5)
    expect(summary.byStatus.draft).toBe(1)
    expect(summary.byStatus.in_review).toBe(1)
    expect(summary.byStatus.issued).toBe(1)
    expect(summary.byStatus.signed).toBe(1)
    expect(cards).toHaveLength(4)
    expect(cards[0].clientName.length).toBeGreaterThan(0)
  })

  it('finds a seeded agreement by id', () => {
    const agreement = findAgreementById('agreement-neejee-2')
    expect(agreement?.agreementNumber).toBe('AGR-NEEJEE-20260730-002')
  })
})