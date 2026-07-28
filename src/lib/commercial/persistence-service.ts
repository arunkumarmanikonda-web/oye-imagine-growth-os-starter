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