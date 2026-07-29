import { NextResponse } from 'next/server';
import {
  getCommercialPersistenceMode,
  getMediaBalanceAccountSnapshotRuntime,
} from '@/lib/commercial/runtime';
import { getMediaBalanceRuntimeState } from '@/lib/commercial/media-balance-runtime-state';

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getTenantId(request: Request): string | undefined {
  const url = new URL(request.url);
  return readString(url.searchParams.get('tenantId'));
}

export async function GET(request: Request) {
  try {
    const tenantId = getTenantId(request);

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required.' }, { status: 400 });
    }

    const mode = getCommercialPersistenceMode();
    const snapshot = await getMediaBalanceAccountSnapshotRuntime(tenantId);
    const snapshotObject = asObject(snapshot);

    const baseAccount = asObject(
      snapshotObject.mediaBalanceAccount ?? snapshotObject.account ?? snapshotObject,
    );

    const reservations = asArray<JsonObject>(
      snapshotObject.reservations ??
      snapshotObject.mediaBalanceReservations ??
      baseAccount.reservations,
    );

    const baseLedgerEntries = asArray<JsonObject>(
      snapshotObject.ledgerEntries ??
      snapshotObject.mediaBalanceLedgerEntries ??
      baseAccount.ledgerEntries,
    );

    const runtimeState = mode === 'store' ? getMediaBalanceRuntimeState(tenantId) : undefined;

    const mediaBalanceAccount = runtimeState?.mediaBalanceAccount
      ? { ...baseAccount, ...runtimeState.mediaBalanceAccount }
      : baseAccount;

    const ledgerEntries = runtimeState?.ledgerEntries ?? baseLedgerEntries;

    return NextResponse.json(
      {
        ok: true,
        mode,
        mediaBalanceAccount,
        reservations,
        ledgerEntries,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected media-balance account error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}