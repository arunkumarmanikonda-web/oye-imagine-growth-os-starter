import type {
  ActivateCommercialContractInput,
  MarkCommercialInvoicePaidInput,
  RenewCommercialSubscriptionInput,
  ResolveCommercialApprovalRequestInput,
} from './persistence-types';

import { SupabaseCommercialPersistenceRepository } from './persistence';
import { CommercialPersistenceService } from './persistence-service';
import { getCommercialSupabaseAdminClient } from './supabase-admin';

export type CommercialPersistenceRuntime = {
  getMediaBalanceAccountSnapshot: (tenantId: string) => Promise<unknown>;
  reserveMediaBalance: (input: unknown) => Promise<unknown>;
  releaseMediaBalance: (input: unknown) => Promise<unknown>;
  spendMediaBalance: (input: unknown) => Promise<unknown>;
  resolveApprovalRequest: (
    input: ResolveCommercialApprovalRequestInput,
  ) => Promise<unknown>;
  activateContract: (
    input: ActivateCommercialContractInput,
  ) => Promise<unknown>;
  markInvoicePaid: (
    input: MarkCommercialInvoicePaidInput,
  ) => Promise<unknown>;
  renewSubscription: (
    input: RenewCommercialSubscriptionInput,
  ) => Promise<unknown>;
};

let persistenceRuntimeSingleton: CommercialPersistenceRuntime | null = null;

type DynamicRecord = Record<string, unknown>;

function asRecord(value: unknown): DynamicRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as DynamicRecord)
    : {};
}

async function callFirst(
  target: DynamicRecord,
  names: string[],
  args: unknown[],
): Promise<unknown> {
  for (const name of names) {
    const candidate = target[name];
    if (typeof candidate === 'function') {
      return await (candidate as (...innerArgs: unknown[]) => unknown)(...args);
    }
  }

  throw new Error(`No compatible repository method found. Tried: ${names.join(', ')}`);
}

async function getMediaBalanceAccountSnapshotViaRepository(
  repository: DynamicRecord,
  tenantId: string,
): Promise<unknown> {
  const account = await callFirst(
    repository,
    [
      'getMediaBalanceAccountSnapshot',
      'getMediaBalanceAccount',
      'getCommercialMediaBalanceAccount',
      'ensureMediaBalanceAccount',
      'ensureCommercialMediaBalanceAccount',
      'getOrCreateMediaBalanceAccount',
    ],
    [tenantId],
  );

  let ledgerEntries: unknown[] = [];
  for (const name of [
    'listLedgerEntries',
    'getLedgerEntries',
    'listCommercialLedgerEntries',
    'getCommercialLedgerEntries',
  ]) {
    const candidate = repository[name];
    if (typeof candidate === 'function') {
      const result = await (candidate as (tenantId?: string) => unknown)(tenantId);
      if (Array.isArray(result)) {
        ledgerEntries = result;
      }
      break;
    }
  }

  const accountRecord = asRecord(account);
  const mediaBalanceAccount =
    Object.keys(asRecord(accountRecord.mediaBalanceAccount)).length > 0
      ? asRecord(accountRecord.mediaBalanceAccount)
      : Object.keys(asRecord(accountRecord.account)).length > 0
        ? asRecord(accountRecord.account)
        : accountRecord;

  return {
    ...accountRecord,
    mediaBalanceAccount,
    ledgerEntries,
    mediaBalanceLedgerEntries: ledgerEntries,
  };
}

export function getPersistenceService(): CommercialPersistenceRuntime {
  if (!persistenceRuntimeSingleton) {
    const repository = new SupabaseCommercialPersistenceRepository(
      getCommercialSupabaseAdminClient(),
    );
    const service = new CommercialPersistenceService(repository);
    const repositoryRecord = repository as unknown as DynamicRecord;

    persistenceRuntimeSingleton = {
      getMediaBalanceAccountSnapshot: (tenantId: string) =>
        getMediaBalanceAccountSnapshotViaRepository(repositoryRecord, tenantId),
      reserveMediaBalance: (input: unknown) =>
        service.reserveMediaBalance(input as any),
      releaseMediaBalance: (input: unknown) =>
        service.releaseMediaBalance(input as any),
      spendMediaBalance: (input: unknown) =>
        service.spendMediaBalance(input as any),
      resolveApprovalRequest: (input: ResolveCommercialApprovalRequestInput) =>
        service.resolveApprovalRequest(input),
      activateContract: (input: ActivateCommercialContractInput) =>
        service.activateContract(input),
      markInvoicePaid: (input: MarkCommercialInvoicePaidInput) =>
        service.markInvoicePaid(input),
      renewSubscription: (input: RenewCommercialSubscriptionInput) =>
        service.renewSubscription(input),
    };
  }

  return persistenceRuntimeSingleton;
}

export function resetPersistenceServiceForTests(): void {
  persistenceRuntimeSingleton = null;
}