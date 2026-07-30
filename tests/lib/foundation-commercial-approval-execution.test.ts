import { describe, expect, it } from 'vitest'
import { advanceApprovalExecution } from '@/lib/recovery/commercial-agreement-execution'

describe('foundation-commercial-approval-execution', () => {
  it('advances the approval chain and exposes the next ready stage', () => {
    const execution = advanceApprovalExecution({
      clientLegalName: 'Neejee Retail Private Limited',
      requestedLanes: ['growth_strategy'],
      currentStage: 'commercial_review',
    })

    expect(execution.approvedCount).toBe(2)
    expect(execution.currentApprovedStage).toBe('commercial_review')
    expect(execution.nextStage).toBe('legal_review')
    expect(execution.executionChain.find((stage) => stage.stage === 'legal_review')?.executionStatus).toBe('ready')
  })
})