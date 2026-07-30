import { describe, expect, it } from 'vitest';

import { CommercialPersistenceService } from '@/lib/commercial/persistence-service';
import type {
  ActivateCommercialContractInput,
  CommercialApprovalRequestRecord,
  CommercialAuditEventRecord,
  CommercialLedgerEntryRecord,
  CommercialMediaBalanceAccountRecord,
  CommercialMutationInput,
  CommercialMutationResult,
  CommercialPersistenceRepository,
  MarkCommercialInvoicePaidInput,
  RenewCommercialSubscriptionInput,
  ResolveCommercialApprovalRequestInput,
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

  async resolveApprovalRequest(
    input: ResolveCommercialApprovalRequestInput,
  ): Promise<unknown> {
    return {
      status: input.decision === 'approve' ? 'approved' : 'rejected',
      approvalRequestId: input.approvalRequestId,
      operationKey: input.operationKey,
    };
  }

  async activateContract(
    input: ActivateCommercialContractInput,
  ): Promise<unknown> {
    return {
      id: input.contractId,
      status: 'active',
      operationKey: input.operationKey,
    };
  }

  async markInvoicePaid(
    input: MarkCommercialInvoicePaidInput,
  ): Promise<unknown> {
    return {
      id: input.invoiceId,
      status: 'paid',
      operationKey: input.operationKey,
    };
  }

  async renewSubscription(
    input: RenewCommercialSubscriptionInput,
  ): Promise<unknown> {
    return {
      id: input.subscriptionId,
      status: 'active',
      operationKey: input.operationKey,
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

  it('routes workflow persistence operations through repository contract', async () => {
    const service = new CommercialPersistenceService(new FakeRepository());

    await expect(service.resolveApprovalRequest({
      approvalRequestId: 'approval-1',
      decision: 'approve',
      operationKey: 'approval-resolve:approval-1:approve',
      actorUserId: 'user-finance',
    })).resolves.toEqual({
      status: 'approved',
      approvalRequestId: 'approval-1',
      operationKey: 'approval-resolve:approval-1:approve',
    });

    await expect(service.activateContract({
      contractId: 'contract-1',
      operationKey: 'contract-activate:contract-1',
      actorUserId: 'user-legal',
    })).resolves.toEqual({
      id: 'contract-1',
      status: 'active',
      operationKey: 'contract-activate:contract-1',
    });

    await expect(service.markInvoicePaid({
      invoiceId: 'invoice-1',
      operationKey: 'invoice-mark-paid:invoice-1',
      actorUserId: 'user-finance',
    })).resolves.toEqual({
      id: 'invoice-1',
      status: 'paid',
      operationKey: 'invoice-mark-paid:invoice-1',
    });

    await expect(service.renewSubscription({
      subscriptionId: 'subscription-1',
      operationKey: 'subscription-renew:subscription-1',
      actorUserId: 'user-billing',
    })).resolves.toEqual({
      id: 'subscription-1',
      status: 'active',
      operationKey: 'subscription-renew:subscription-1',
    });
  });
});