import type {
  ActivateCommercialContractInput,
  CommercialAuditEventRecord,
  CommercialLedgerEntryRecord,
  CommercialMediaBalanceAccountRecord,
  CommercialMutationInput,
  CommercialMutationResult,
  CommercialPersistenceRepository,
  MarkCommercialInvoicePaidInput,
  RenewCommercialSubscriptionInput,
  ResolveCommercialApprovalRequestInput,
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

async function invokeWorkflowMethod(
  service: CommercialPersistenceService,
  methodName:
    | 'resolveApprovalRequest'
    | 'activateContract'
    | 'markInvoicePaid'
    | 'renewSubscription',
  input: unknown,
): Promise<unknown> {
  const candidate = (service as unknown as Record<string, unknown>)[methodName];

  if (typeof candidate !== 'function') {
    throw new Error(
      `${methodName} is not implemented by the commercial persistence service`,
    );
  }

  return await (
    candidate as (value: unknown) => Promise<unknown>
  ).call(service, input);
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

  async resolveApprovalRequest(
    input: ResolveCommercialApprovalRequestInput,
  ): Promise<unknown> {
    assertNonEmpty(input.approvalRequestId, 'approvalRequestId');
    assertNonEmpty(input.operationKey, 'operationKey');
    assertNonEmpty(input.decision, 'decision');
    return this.repository.resolveApprovalRequest(input);
  }

  async activateContract(
    input: ActivateCommercialContractInput,
  ): Promise<unknown> {
    assertNonEmpty(input.contractId, 'contractId');
    assertNonEmpty(input.operationKey, 'operationKey');
    return this.repository.activateContract(input);
  }

  async markInvoicePaid(
    input: MarkCommercialInvoicePaidInput,
  ): Promise<unknown> {
    assertNonEmpty(input.invoiceId, 'invoiceId');
    assertNonEmpty(input.operationKey, 'operationKey');
    return this.repository.markInvoicePaid(input);
  }

  async renewSubscription(
    input: RenewCommercialSubscriptionInput,
  ): Promise<unknown> {
    assertNonEmpty(input.subscriptionId, 'subscriptionId');
    assertNonEmpty(input.operationKey, 'operationKey');
    return this.repository.renewSubscription(input);
  }

  async listLedgerEntries(tenantId: string): Promise<CommercialLedgerEntryRecord[]> {
    assertNonEmpty(tenantId, 'tenantId');
    return this.repository.listLedgerEntries(tenantId);
  }

  async listAuditEvents(tenantId: string): Promise<CommercialAuditEventRecord[]> {
    assertNonEmpty(tenantId, 'tenantId');
    return this.repository.listAuditEvents(tenantId);
  }

  async listApprovalRequests(tenantId: string) {
    assertNonEmpty(tenantId, 'tenantId');
    return this.repository.listApprovalRequests(tenantId);
  }
}

export async function resolveApprovalRequestViaPersistenceService(
  service: CommercialPersistenceService,
  input: ResolveCommercialApprovalRequestInput,
): Promise<unknown> {
  return invokeWorkflowMethod(service, 'resolveApprovalRequest', input);
}

export async function activateContractViaPersistenceService(
  service: CommercialPersistenceService,
  input: ActivateCommercialContractInput,
): Promise<unknown> {
  return invokeWorkflowMethod(service, 'activateContract', input);
}

export async function markInvoicePaidViaPersistenceService(
  service: CommercialPersistenceService,
  input: MarkCommercialInvoicePaidInput,
): Promise<unknown> {
  return invokeWorkflowMethod(service, 'markInvoicePaid', input);
}

export async function renewSubscriptionViaPersistenceService(
  service: CommercialPersistenceService,
  input: RenewCommercialSubscriptionInput,
): Promise<unknown> {
  return invokeWorkflowMethod(service, 'renewSubscription', input);
}