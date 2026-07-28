import {
  getMediaBalanceAccountSnapshot as getStoreMediaBalanceAccountSnapshot,
  releaseMediaBalance as releaseStoreMediaBalance,
  reserveMediaBalance as reserveStoreMediaBalance,
} from './store';
import * as persistenceServiceModule from './persistence-service';

export type CommercialPersistenceMode = 'store' | 'supabase';

type RuntimeMutationInput = {
  tenantId: string;
  amount: number;
  currency?: string;
  operationKey?: string;
  actorId?: string;
  reference?: string;
  payload?: Record<string, unknown>;
};

type PersistenceServiceLike = {
  getMediaBalanceAccountSnapshot: (tenantId: string) => unknown | Promise<unknown>;
  reserveMediaBalance: (input: RuntimeMutationInput) => unknown | Promise<unknown>;
  releaseMediaBalance: (input: RuntimeMutationInput) => unknown | Promise<unknown>;
  spendMediaBalance: (input: RuntimeMutationInput) => unknown | Promise<unknown>;
};

function readEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

export function getCommercialPersistenceMode(): CommercialPersistenceMode {
  const forcedMode = readEnv(['COMMERCIAL_PERSISTENCE_MODE']);
  if (forcedMode === 'store' || forcedMode === 'supabase') {
    return forcedMode;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'store';
  }

  const url = readEnv(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL']);
  const key = readEnv(['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY']);
  return url && key ? 'supabase' : 'store';
}

function getPersistenceServiceCompat(): PersistenceServiceLike {
  const moduleRecord = persistenceServiceModule as Record<string, unknown>;

  const factoryNames = [
    'getPersistenceService',
    'getCommercialPersistenceService',
    'createPersistenceService',
    'createCommercialPersistenceService',
  ];

  for (const name of factoryNames) {
    const candidate = moduleRecord[name];
    if (typeof candidate === 'function') {
      return (candidate as () => PersistenceServiceLike)();
    }
  }

  const singletonNames = [
    'persistenceService',
    'commercialPersistenceService',
  ];

  for (const name of singletonNames) {
    const candidate = moduleRecord[name];
    if (candidate && typeof candidate === 'object') {
      return candidate as PersistenceServiceLike;
    }
  }

  throw new Error('No compatible persistence-service export found.');
}

export async function getMediaBalanceAccountSnapshotRuntime(tenantId: string) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceServiceCompat().getMediaBalanceAccountSnapshot(tenantId);
  }
  return getStoreMediaBalanceAccountSnapshot(tenantId);
}

export async function reserveMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceServiceCompat().reserveMediaBalance(input);
  }
  return (reserveStoreMediaBalance as unknown as (value: RuntimeMutationInput) => unknown)(input);
}

export async function releaseMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceServiceCompat().releaseMediaBalance(input);
  }
  return (releaseStoreMediaBalance as unknown as (value: RuntimeMutationInput) => unknown)(input);
}

export async function spendMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceServiceCompat().spendMediaBalance(input);
  }

  throw new Error('Store-mode spend is handled by the route fallback.');
}