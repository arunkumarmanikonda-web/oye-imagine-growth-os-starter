import { describe, expect, it } from 'vitest';

import { CommercialPersistenceService } from '@/lib/commercial/persistence-service';
import type {
  CommercialApprovalRequestRecord,
  CommercialAuditEventRecord,
  CommercialLedgerEntryRecord,
  CommercialMediaBalanceAccountRecord,
  CommercialMutationInput,
  CommercialMutationResult,
  CommercialPersistenceRepository,
} from '@/lib/commercial/persistence-types';

class FakeRepository implements CommercialPersistenceRepository {
  account: CommercialMediaBalanceAccountRecord = {
    tenantId: 'tenant-1',
    currency: 'INR',
    available: 1000,
    reserved: 0,
    spent: 0,
    updatedAt: '2026-07-28T00:00:00.000Z',
  };

  async getOrCreateMediaBalanceAccount(): Promise<CommercialMediaBalanceAccountRecord> {
    return this.account;
  }

  async reserveMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    this.account = {
      ...this.account,
      available: this.account.available - input.amount,
      reserved: this.account.reserved + input.amount,
    };

    return {
      account: this.account,
      ledgerEntry: {
        entryId: 'entry-1',
        tenantId: input.tenantId,
        entryType: 'media_balance_reserve',
        direction: 'debit',
        amount: input.amount,
        currency: input.currency ?? 'INR',
        operationKey: input.operationKey,
        reference: input.reference ?? null,
        payload: input.payload ?? {},
        createdAt: '2026-07-28T00:00:00.000Z',
      },
      auditEvent: {
        eventId: 'event-1',
        tenantId: input.tenantId,
        eventType: 'media_balance_reserved',
        actorId: input.actorId ?? null,
        beforeState: {},
        afterState: this.account,
        payload: input.payload ?? {},
        createdAt: '2026-07-28T00:00:00.000Z',
      },
    };
  }

  async releaseMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    this.account = {
      ...this.account,
      available: this.account.available + input.amount,
      reserved: this.account.reserved - input.amount,
    };

    return {
      account: this.account,
      ledgerEntry: {
        entryId: 'entry-2',
        tenantId: input.tenantId,
        entryType: 'media_balance_release',
        direction: 'credit',
        amount: input.amount,
        currency: input.currency ?? 'INR',
        operationKey: input.operationKey,
        reference: input.reference ?? null,
        payload: input.payload ?? {},
        createdAt: '2026-07-28T00:00:00.000Z',
      },
      auditEvent: {
        eventId: 'event-2',
        tenantId: input.tenantId,
        eventType: 'media_balance_released',
        actorId: input.actorId ?? null,
        beforeState: {},
        afterState: this.account,
        payload: input.payload ?? {},
        createdAt: '2026-07-28T00:00:00.000Z',
      },
    };
  }

  async spendMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    this.account = {
      ...this.account,
      reserved: this.account.reserved - input.amount,
      spent: this.account.spent + input.amount,
    };

    return {
      account: this.account,
      ledgerEntry: {
        entryId: 'entry-3',
        tenantId: input.tenantId,
        entryType: 'media_balance_spend',
        direction: 'debit',
        amount: input.amount,
        currency: input.currency ?? 'INR',
        operationKey: input.operationKey,
        reference: input.reference ?? null,
        payload: input.payload ?? {},
        createdAt: '2026-07-28T00:00:00.000Z',
      },
      auditEvent: {
        eventId: 'event-3',
        tenantId: input.tenantId,
        eventType: 'media_balance_spent',
        actorId: input.actorId ?? null,
        beforeState: {},
        afterState: this.account,
        payload: input.payload ?? {},
        createdAt: '2026-07-28T00:00:00.000Z',
      },
    };
  }

  async listLedgerEntries(): Promise<CommercialLedgerEntryRecord[]> {
    return [];
  }

  async listAuditEvents(): Promise<CommercialAuditEventRecord[]> {
    return [];
  }

  async listApprovalRequests(): Promise<CommercialApprovalRequestRecord[]> {
    return [];
  }
}

describe('commercial persistence service', () => {
  it('rejects non-positive mutation amounts', async () => {
    const service = new CommercialPersistenceService(new FakeRepository());

    await expect(service.reserveMediaBalance({
      tenantId: 'tenant-1',
      amount: 0,
      operationKey: 'reserve-1',
    })).rejects.toThrow(/amount must be positive/);
  });

  it('reserves and spends through repository contract', async () => {
    const service = new CommercialPersistenceService(new FakeRepository());

    const reserved = await service.reserveMediaBalance({
      tenantId: 'tenant-1',
      amount: 300,
      operationKey: 'reserve-1',
    });

    expect(reserved.account.available).toBe(700);
    expect(reserved.account.reserved).toBe(300);

    const spent = await service.spendMediaBalance({
      tenantId: 'tenant-1',
      amount: 125,
      operationKey: 'spend-1',
    });

    expect(spent.account.reserved).toBe(175);
    expect(spent.account.spent).toBe(125);
  });
});