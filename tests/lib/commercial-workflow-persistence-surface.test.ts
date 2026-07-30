import { describe, expect, it, vi } from 'vitest'

import {
  activateContractViaPersistenceService,
  markInvoicePaidViaPersistenceService,
  renewSubscriptionViaPersistenceService,
  resolveApprovalRequestViaPersistenceService,
} from '../../src/lib/commercial/persistence-service'
import {
  hasCommercialWorkflowPersistenceSurface,
  type ActivateCommercialContractInput,
  type MarkCommercialInvoicePaidInput,
  type RenewCommercialSubscriptionInput,
  type ResolveCommercialApprovalRequestInput,
} from '../../src/lib/commercial/workflow-persistence-surface'

describe('commercial workflow persistence surface', () => {
  it('detects when at least one workflow persistence method is exposed', () => {
    expect(hasCommercialWorkflowPersistenceSurface({})).toBe(false)
    expect(
      hasCommercialWorkflowPersistenceSurface({
        resolveApprovalRequest: async () => ({ ok: true }),
      }),
    ).toBe(true)
  })

  it('forwards resolveApprovalRequest through the persistence service surface', async () => {
    const input: ResolveCommercialApprovalRequestInput = {
      approvalRequestId: 'approval_123',
      decision: 'approve',
      operationKey: 'approval-resolve:approval_123:approve',
      reference: 'test-ref',
      actorUserId: 'user_123',
    }

    const resolveApprovalRequest = vi.fn().mockResolvedValue({ ok: true, input })
    const service = { resolveApprovalRequest } as never

    const result = await resolveApprovalRequestViaPersistenceService(service, input)

    expect(resolveApprovalRequest).toHaveBeenCalledWith(input)
    expect(result).toEqual({ ok: true, input })
  })

  it('forwards activateContract / markInvoicePaid / renewSubscription through the persistence service surface', async () => {
    const activateInput: ActivateCommercialContractInput = {
      contractId: 'contract_123',
      operationKey: 'contract-activate:contract_123',
      reference: 'contract-ref',
      actorUserId: 'user_123',
    }

    const invoiceInput: MarkCommercialInvoicePaidInput = {
      invoiceId: 'invoice_123',
      operationKey: 'invoice-mark-paid:invoice_123',
      reference: 'invoice-ref',
      actorUserId: 'user_123',
    }

    const renewInput: RenewCommercialSubscriptionInput = {
      subscriptionId: 'subscription_123',
      operationKey: 'subscription-renew:subscription_123',
      reference: 'subscription-ref',
      actorUserId: 'user_123',
    }

    const activateContract = vi.fn().mockResolvedValue({ ok: true, kind: 'contract' })
    const markInvoicePaid = vi.fn().mockResolvedValue({ ok: true, kind: 'invoice' })
    const renewSubscription = vi.fn().mockResolvedValue({ ok: true, kind: 'subscription' })

    const service = {
      activateContract,
      markInvoicePaid,
      renewSubscription,
    } as never

    await expect(
      activateContractViaPersistenceService(service, activateInput),
    ).resolves.toEqual({ ok: true, kind: 'contract' })

    await expect(
      markInvoicePaidViaPersistenceService(service, invoiceInput),
    ).resolves.toEqual({ ok: true, kind: 'invoice' })

    await expect(
      renewSubscriptionViaPersistenceService(service, renewInput),
    ).resolves.toEqual({ ok: true, kind: 'subscription' })

    expect(activateContract).toHaveBeenCalledWith(activateInput)
    expect(markInvoicePaid).toHaveBeenCalledWith(invoiceInput)
    expect(renewSubscription).toHaveBeenCalledWith(renewInput)
  })

  it('throws a clear error when the persistence workflow method is missing', async () => {
    const input: ResolveCommercialApprovalRequestInput = {
      approvalRequestId: 'approval_missing',
      decision: 'reject',
      operationKey: 'approval-resolve:approval_missing:reject',
    }

    await expect(
      resolveApprovalRequestViaPersistenceService({} as never, input),
    ).rejects.toThrow(
      'resolveApprovalRequest is not implemented by the commercial persistence service',
    )
  })
})