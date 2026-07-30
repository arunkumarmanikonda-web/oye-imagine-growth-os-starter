import { describe, expect, it } from 'vitest'
import { buildOperatorWorkflowClosure } from '@/lib/recovery/commercial-dashboard-foundation'

describe('foundation-commercial-workflow-closure', () => {
  it('closes the sales to delivery workflow when commercial continuity layers are present', () => {
    const workflow = buildOperatorWorkflowClosure({
      clientLegalName: 'Neejee Retail Private Limited',
      requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
      billingModel: 'monthly_retainer',
      baseFeeInr: 125000,
      paymentTerm: 'net_15',
      invoiceSequence: 25,
      openingBalanceInr: 25000,
      receivedPaymentInr: 50000,
    })

    expect(workflow.overallStatus).toBe('workflow_closed')
    expect(workflow.completedStageCount).toBe(4)
    expect(workflow.handoffSummary.invoiceNumber).toBe('INV-2026-0025')
    expect(workflow.operatorActions.length).toBe(3)
  })
})