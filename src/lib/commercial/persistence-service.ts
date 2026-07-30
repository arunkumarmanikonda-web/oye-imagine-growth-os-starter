import type {
  CommercialAuditEventRecord,
  CommercialLedgerEntryRecord,
  CommercialMediaBalanceAccountRecord,
  CommercialMutationInput,
  CommercialMutationResult,
  CommercialPersistenceRepository,
} from './persistence-types';

function assertNonEmpty(value: string, field: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
}

function assertPositiveAmount(value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('amount must be positive');
  }
}

export class CommercialPersistenceService {
  constructor(private readonly repository: CommercialPersistenceRepository) {}

  async getOrCreateMediaBalanceAccount(
    tenantId: string,
    currency = 'INR',
  ): Promise<CommercialMediaBalanceAccountRecord> {
    assertNonEmpty(tenantId, 'tenantId');
    return this.repository.getOrCreateMediaBalanceAccount(tenantId, currency);
  }

  async reserveMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    assertNonEmpty(input.tenantId, 'tenantId');
    assertNonEmpty(input.operationKey, 'operationKey');
    assertPositiveAmount(input.amount);
    return this.repository.reserveMediaBalance(input);
  }

  async releaseMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    assertNonEmpty(input.tenantId, 'tenantId');
    assertNonEmpty(input.operationKey, 'operationKey');
    assertPositiveAmount(input.amount);
    return this.repository.releaseMediaBalance(input);
  }

  async spendMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    assertNonEmpty(input.tenantId, 'tenantId');
    assertNonEmpty(input.operationKey, 'operationKey');
    assertPositiveAmount(input.amount);
    return this.repository.spendMediaBalance(input);
  }

  async listLedgerEntries(tenantId: string): Promise<CommercialLedgerEntryRecord[]> {
    assertNonEmpty(tenantId, 'tenantId');
    return this.repository.listLedgerEntries(tenantId);
  }

  async listAuditEvents(tenantId: string): Promise<CommercialAuditEventRecord[]> {
    assertNonEmpty(tenantId, 'tenantId');
    return this.repository.listAuditEvents(tenantId);
  }
}

type CommercialPersistenceServiceWithWorkflowSurface =
  CommercialPersistenceService &
    import('./workflow-persistence-surface').CommercialWorkflowPersistenceRuntimeSurface

function getCommercialPersistenceServiceWorkflowSurface(
  service: CommercialPersistenceService,
): CommercialPersistenceServiceWithWorkflowSurface {
  return service as CommercialPersistenceServiceWithWorkflowSurface
}

export async function resolveApprovalRequestViaPersistenceService(
  service: CommercialPersistenceService,
  input: import('./workflow-persistence-surface').ResolveCommercialApprovalRequestInput,
): Promise<unknown> {
  const workflowService = getCommercialPersistenceServiceWorkflowSurface(service)

  if (typeof workflowService.resolveApprovalRequest !== 'function') {
    throw new Error(
      'resolveApprovalRequest is not implemented by the commercial persistence service',
    )
  }

  return workflowService.resolveApprovalRequest(input)
}

export async function activateContractViaPersistenceService(
  service: CommercialPersistenceService,
  input: import('./workflow-persistence-surface').ActivateCommercialContractInput,
): Promise<unknown> {
  const workflowService = getCommercialPersistenceServiceWorkflowSurface(service)

  if (typeof workflowService.activateContract !== 'function') {
    throw new Error(
      'activateContract is not implemented by the commercial persistence service',
    )
  }

  return workflowService.activateContract(input)
}

export async function markInvoicePaidViaPersistenceService(
  service: CommercialPersistenceService,
  input: import('./workflow-persistence-surface').MarkCommercialInvoicePaidInput,
): Promise<unknown> {
  const workflowService = getCommercialPersistenceServiceWorkflowSurface(service)

  if (typeof workflowService.markInvoicePaid !== 'function') {
    throw new Error(
      'markInvoicePaid is not implemented by the commercial persistence service',
    )
  }

  return workflowService.markInvoicePaid(input)
}

export async function renewSubscriptionViaPersistenceService(
  service: CommercialPersistenceService,
  input: import('./workflow-persistence-surface').RenewCommercialSubscriptionInput,
): Promise<unknown> {
  const workflowService = getCommercialPersistenceServiceWorkflowSurface(service)

  if (typeof workflowService.renewSubscription !== 'function') {
    throw new Error(
      'renewSubscription is not implemented by the commercial persistence service',
    )
  }

  return workflowService.renewSubscription(input)
}
