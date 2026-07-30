export type CommercialApprovalDecision = 'approve' | 'reject'

export interface CommercialWorkflowMutationInputBase {
  operationKey: string
  reference?: string | null
  actorUserId?: string | null
}

export interface ResolveCommercialApprovalRequestInput
  extends CommercialWorkflowMutationInputBase {
  approvalRequestId: string
  decision: CommercialApprovalDecision
  note?: string | null
}

export interface ActivateCommercialContractInput
  extends CommercialWorkflowMutationInputBase {
  contractId: string
  effectiveAt?: string | null
}

export interface MarkCommercialInvoicePaidInput
  extends CommercialWorkflowMutationInputBase {
  invoiceId: string
  paidAt?: string | null
}

export interface RenewCommercialSubscriptionInput
  extends CommercialWorkflowMutationInputBase {
  subscriptionId: string
  renewedAt?: string | null
}

export interface CommercialWorkflowPersistenceRuntimeSurface {
  resolveApprovalRequest?(
    input: ResolveCommercialApprovalRequestInput,
  ): Promise<unknown>

  activateContract?(
    input: ActivateCommercialContractInput,
  ): Promise<unknown>

  markInvoicePaid?(
    input: MarkCommercialInvoicePaidInput,
  ): Promise<unknown>

  renewSubscription?(
    input: RenewCommercialSubscriptionInput,
  ): Promise<unknown>
}

export function hasCommercialWorkflowPersistenceSurface(
  value: unknown,
): value is CommercialWorkflowPersistenceRuntimeSurface {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.resolveApprovalRequest === 'function' ||
    typeof candidate.activateContract === 'function' ||
    typeof candidate.markInvoicePaid === 'function' ||
    typeof candidate.renewSubscription === 'function'
  )
}