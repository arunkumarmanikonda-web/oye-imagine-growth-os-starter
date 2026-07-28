import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeMocks = vi.hoisted(() => ({
  getMediaBalanceAccountSnapshot: vi.fn((tenantId: string) => ({
    mediaBalanceAccount: {
      tenantId,
      balance: 500,
      reserved: 100,
      available: 400,
      currency: 'USD',
    },
    reservations: [],
    ledgerEntries: [],
  })),
  reserveMediaBalance: vi.fn((input: any) => ({
    mediaBalanceAccount: {
      tenantId: input.tenantId,
      balance: 500,
      reserved: 150,
      available: 350,
      currency: input.currency ?? 'USD',
    },
    reservation: {
      id: 'reservation-store-1',
      amount: input.amount,
      currency: input.currency ?? 'USD',
    },
  })),
  releaseMediaBalance: vi.fn((input: any) => ({
    mediaBalanceAccount: {
      tenantId: input.tenantId,
      balance: 500,
      reserved: 50,
      available: 450,
      currency: input.currency ?? 'USD',
    },
  })),
}));

const persistenceService = vi.hoisted(() => ({
  getMediaBalanceAccountSnapshot: vi.fn(async (tenantId: string) => ({
    mediaBalanceAccount: {
      tenantId,
      balance: 900,
      reserved: 200,
      available: 700,
      currency: 'USD',
    },
    reservations: [],
    ledgerEntries: [],
  })),
  reserveMediaBalance: vi.fn(async (input: any) => ({
    mediaBalanceAccount: {
      tenantId: input.tenantId,
      balance: 900,
      reserved: 250,
      available: 650,
      currency: input.currency ?? 'USD',
    },
    reservation: {
      id: 'reservation-supabase-1',
      amount: input.amount,
      currency: input.currency ?? 'USD',
    },
  })),
  releaseMediaBalance: vi.fn(async (input: any) => ({
    mediaBalanceAccount: {
      tenantId: input.tenantId,
      balance: 900,
      reserved: 150,
      available: 750,
      currency: input.currency ?? 'USD',
    },
  })),
  spendMediaBalance: vi.fn(async (input: any) => ({
    mediaBalanceAccount: {
      tenantId: input.tenantId,
      balance: 780,
      reserved: 80,
      available: 700,
      currency: input.currency ?? 'USD',
    },
    ledgerEntry: {
      id: 'ledger-supabase-1',
      source: 'campaign_spend',
      amount: input.amount,
      currency: input.currency ?? 'USD',
    },
  })),
}));

vi.mock('@/lib/commercial/store', () => ({
  getMediaBalanceAccountSnapshot: storeMocks.getMediaBalanceAccountSnapshot,
  reserveMediaBalance: storeMocks.reserveMediaBalance,
  releaseMediaBalance: storeMocks.releaseMediaBalance,
}));

vi.mock('@/lib/commercial/persistence-service', () => ({
  getPersistenceService: vi.fn(() => persistenceService),
}));

describe('commercial runtime bridge', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.COMMERCIAL_PERSISTENCE_MODE;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    process.env.NODE_ENV = 'test';
  });

  it('defaults to store mode in tests and uses store reserve path', async () => {
    const runtime = await import('@/lib/commercial/runtime');

    expect(runtime.getCommercialPersistenceMode()).toBe('store');

    await runtime.reserveMediaBalanceRuntime({
      tenantId: 'tenant-store',
      amount: 50,
      currency: 'USD',
      operationKey: 'store-op-1',
    });

    expect(storeMocks.reserveMediaBalance).toHaveBeenCalledTimes(1);
    expect(persistenceService.reserveMediaBalance).not.toHaveBeenCalled();
  });

  it('supports forced supabase mode and uses persistence service methods', async () => {
    process.env.COMMERCIAL_PERSISTENCE_MODE = 'supabase';

    const runtime = await import('@/lib/commercial/runtime');

    expect(runtime.getCommercialPersistenceMode()).toBe('supabase');

    await runtime.reserveMediaBalanceRuntime({
      tenantId: 'tenant-supabase',
      amount: 75,
      currency: 'USD',
      operationKey: 'supabase-op-1',
    });

    expect(persistenceService.reserveMediaBalance).toHaveBeenCalledTimes(1);
    expect(storeMocks.reserveMediaBalance).not.toHaveBeenCalled();
  });
});