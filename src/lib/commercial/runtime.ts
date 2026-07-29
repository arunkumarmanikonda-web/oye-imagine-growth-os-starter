import {
  getMediaBalanceAccountSnapshot as getStoreMediaBalanceAccountSnapshot,
  releaseMediaBalance as releaseStoreMediaBalance,
  reserveMediaBalance as reserveStoreMediaBalance,
} from './store';
import { getPersistenceService } from './persistence-runtime';

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

export async function getMediaBalanceAccountSnapshotRuntime(tenantId: string) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceService().getMediaBalanceAccountSnapshot(tenantId);
  }

  return getStoreMediaBalanceAccountSnapshot(tenantId);
}

export async function reserveMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceService().reserveMediaBalance(input as any);
  }

  return (reserveStoreMediaBalance as unknown as (value: RuntimeMutationInput) => unknown)(input);
}

export async function releaseMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceService().releaseMediaBalance(input as any);
  }

  return (releaseStoreMediaBalance as unknown as (value: RuntimeMutationInput) => unknown)(input);
}

export async function spendMediaBalanceRuntime(input: RuntimeMutationInput) {
  if (getCommercialPersistenceMode() === 'supabase') {
    return getPersistenceService().spendMediaBalance(input as any);
  }

  throw new Error('Store-mode spend is handled by the route fallback.');
}