import { describe, expect, it } from 'vitest'
import {
  buildAgreementDraft,
  calculateAgreementTotal,
  canTransitionAgreementStatus,
  getAgreementReadiness,
  transitionAgreementStatus,
} from '../../src/lib/agreements/agreement-engine'

describe('agreement-engine', () => {
  it('builds a deterministic agreement draft from a template', () => {
    const draft = buildAgreementDraft({
      templateId: 'agreement-template-service',
      workspaceKey: 'neejee',
      clientName: 'Neejee',
      clientEmail: 'ops@neejee.com',
      createdBy: 'admin@oyeimagine.com',
      createdAt: '2026-07-30T09:00:00.000Z',
      sequence: 7,
    })

    expect(draft.id).toBe('agreement-neejee-7')
    expect(draft.agreementNumber).toBe('AGR-NEEJEE-20260730-007')
    expect(draft.kind).toBe('service_agreement')
    expect(draft.status).toBe('draft')
    expect(calculateAgreementTotal(draft)).toBeGreaterThan(0)
  })

  it('enforces status transitions and readiness gates', () => {
    const draft = buildAgreementDraft({
      templateId: 'agreement-template-service',
      workspaceKey: 'neejee',
      clientName: 'Neejee',
      clientEmail: 'ops@neejee.com',
      createdBy: 'admin@oyeimagine.com',
      createdAt: '2026-07-30T09:00:00.000Z',
      sequence: 8,
    })

    expect(canTransitionAgreementStatus('draft', 'in_review')).toBe(true)
    expect(canTransitionAgreementStatus('draft', 'signed')).toBe(false)

    const inReview = transitionAgreementStatus(draft, 'in_review', 'ops@oyeimagine.com', '2026-07-30T10:00:00.000Z')
    const approved = transitionAgreementStatus(inReview, 'approved', 'director@oyeimagine.com', '2026-07-30T11:00:00.000Z')
    const issued = transitionAgreementStatus(approved, 'issued', 'ops@oyeimagine.com', '2026-07-30T12:00:00.000Z')

    const readiness = getAgreementReadiness(issued)

    expect(approved.approvalCount).toBe(approved.approvalsRequired)
    expect(issued.status).toBe('issued')
    expect(readiness.issueReady).toBe(true)
    expect(readiness.signReady).toBe(true)
  })
})