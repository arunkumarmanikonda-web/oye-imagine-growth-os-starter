import { NextResponse } from 'next/server';
import {
  getCommercialPersistenceMode,
  spendMediaBalanceRuntime,
} from '@/lib/commercial/runtime';
import {
  getMediaBalanceRuntimeState,
  setMediaBalanceRuntimeState,
} from '@/lib/commercial/media-balance-runtime-state';
import { getMediaBalanceAccountSnapshot, getTenantCommercialSnapshot } from '@/lib/commercial/store';

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function pickNumber(source: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = readNumber(source[key]);
    if (typeof value === 'number') {
      return value;
    }
  }
  return fallback;
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? ([...value] as T[]) : [];
}

function nextOperationKey(provided?: string): string {
  if (provided && provided.trim().length > 0) {
    return provided.trim();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `media-spend-${Date.now()}`;
}

function normalizeLedgerEntry(
  candidate: Record<string, unknown>,
  tenantId: string,
  amount: number,
  currency: string,
  operationKey: string,
  reference?: string,
) {
  return {
    id: readString(candidate.id) ?? `ledger-${operationKey}`,
    tenantId,
    direction: readString(candidate.direction) ?? 'debit',
    source:
      readString(candidate.source) ??
      readString(candidate.entryType) ??
      'campaign_spend',
    amount: readNumber(candidate.amount) ?? amount,
    currency: readString(candidate.currency) ?? currency,
    reference: readString(candidate.reference) ?? reference ?? null,
    operationKey,
    createdAt: readString(candidate.createdAt) ?? new Date().toISOString(),
  };
}

function sumReservationAmounts(items: Record<string, unknown>[]): number {
  return items.reduce((sum, item) => {
    const amount = pickNumber(
      item,
      ['remainingAmount', 'reservedAmount', 'amount', 'value'],
      0,
    );
    return sum + Math.max(0, amount);
  }, 0);
}

export async function POST(request: Request) {
  try {
    const body = asObject(await request.json());
    const tenantId = readString(body.tenantId);
    const amount = readNumber(body.amount);
    const requestedCurrency = readString(body.currency);
    const actorId = readString(body.actorId) ?? 'system';
    const reference = readString(body.reference);
    const operationKey = nextOperationKey(readString(body.operationKey));
    const payload = asObject(body.payload);

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required.' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number.' }, { status: 400 });
    }

    if (getCommercialPersistenceMode() === 'supabase') {
      const result = await spendMediaBalanceRuntime({
        tenantId,
        amount,
        currency: requestedCurrency,
        actorId,
        reference,
        operationKey,
        payload,
      });

      const resultObject = asObject(result);
      const mediaBalanceAccount = asObject(
        resultObject.mediaBalanceAccount ?? resultObject.account ?? {},
      );
      const currency =
        requestedCurrency ??
        readString(mediaBalanceAccount.currency) ??
        readString(mediaBalanceAccount.currencyCode) ??
        'INR';

      const ledgerEntry = normalizeLedgerEntry(
        asObject(resultObject.ledgerEntry ?? resultObject.mediaBalanceLedgerEntry ?? {}),
        tenantId,
        amount,
        currency,
        operationKey,
        reference,
      );

      return NextResponse.json(
        {
          ok: true,
          mode: 'supabase',
          mediaBalanceAccount,
          ledgerEntry,
        },
        { status: 200 },
      );
    }

    const snapshot = getMediaBalanceAccountSnapshot(tenantId) as Record<string, unknown> | null;
    if (!snapshot || typeof snapshot !== 'object') {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
    }

    const snapshotObject = snapshot as Record<string, unknown>;
    const mediaBalanceAccount = asObject(
      snapshotObject.mediaBalanceAccount ?? snapshotObject.account ?? snapshotObject,
    );

    const currency =
      requestedCurrency ??
      readString(mediaBalanceAccount.currency) ??
      readString(snapshotObject.currency) ??
      'INR';

    const reservationRecords = [
      ...ensureArray<Record<string, unknown>>(snapshotObject.reservations),
      ...ensureArray<Record<string, unknown>>(snapshotObject.mediaBalanceReservations),
      ...ensureArray<Record<string, unknown>>(mediaBalanceAccount.reservations),
    ];

    const explicitAvailable = Math.max(
      pickNumber(mediaBalanceAccount, ['availableBalance', 'available', 'availableAmount', 'availableFunds'], 0),
      pickNumber(snapshotObject, ['availableBalance', 'available', 'availableAmount', 'availableFunds'], 0),
    );

    const explicitReserved = Math.max(
      pickNumber(mediaBalanceAccount, ['reservedBalance', 'reserved', 'reservedAmount', 'reservedFunds'], 0),
      pickNumber(snapshotObject, ['reservedBalance', 'reserved', 'reservedAmount', 'reservedFunds'], 0),
    );

    const derivedReserved = sumReservationAmounts(reservationRecords);
    const effectiveReserved = Math.max(explicitReserved, derivedReserved);

    const explicitTotal = Math.max(
      pickNumber(mediaBalanceAccount, ['balance', 'balanceAmount', 'totalBalance'], 0),
      pickNumber(snapshotObject, ['balance', 'balanceAmount', 'totalBalance'], 0),
    );

    const effectiveBalance = explicitTotal > 0 ? explicitTotal : explicitAvailable + effectiveReserved;

    if (effectiveReserved < amount) {
      return NextResponse.json({ error: 'Insufficient reserved balance.' }, { status: 409 });
    }

    const nextReserved = Math.max(0, effectiveReserved - amount);
    const nextBalance = Math.max(0, effectiveBalance - amount);
    const nextAvailable = Math.max(0, nextBalance - nextReserved);

    mediaBalanceAccount.tenantId = tenantId;
    mediaBalanceAccount.currency = currency;
    mediaBalanceAccount.balance = nextBalance;
    mediaBalanceAccount.balanceAmount = nextBalance;
    mediaBalanceAccount.totalBalance = nextBalance;
    mediaBalanceAccount.available = nextAvailable;
    mediaBalanceAccount.availableAmount = nextAvailable;
    mediaBalanceAccount.availableBalance = nextAvailable;
    mediaBalanceAccount.reserved = nextReserved;
    mediaBalanceAccount.reservedAmount = nextReserved;
    mediaBalanceAccount.reservedBalance = nextReserved;
    mediaBalanceAccount.updatedAt = new Date().toISOString();

    const ledgerEntry = normalizeLedgerEntry(
      {
        id: `ledger-${operationKey}`,
        direction: 'debit',
        source: 'campaign_spend',
        amount,
        currency,
        reference,
        operationKey,
        createdAt: new Date().toISOString(),
      },
      tenantId,
      amount,
      currency,
      operationKey,
      reference,
    );

    const existingState = getMediaBalanceRuntimeState(tenantId);
    const accountLedgerEntries = [
      ledgerEntry,
      ...ensureArray<Record<string, unknown>>(
        existingState?.ledgerEntries ??
        mediaBalanceAccount.ledgerEntries ??
        snapshotObject.ledgerEntries,
      ),
    ];

    mediaBalanceAccount.ledgerEntries = accountLedgerEntries;

    snapshotObject.mediaBalanceAccount = mediaBalanceAccount;
    snapshotObject.ledgerEntries = accountLedgerEntries;
    snapshotObject.mediaBalanceLedgerEntries = accountLedgerEntries;
    snapshotObject.availableBalance = nextAvailable;
    snapshotObject.reservedBalance = nextReserved;
    snapshotObject.balance = nextBalance;
    snapshotObject.balanceAmount = nextBalance;
    snapshotObject.totalBalance = nextBalance;

    const tenantSnapshot = getTenantCommercialSnapshot(tenantId) as Record<string, unknown> | null;
    if (tenantSnapshot && typeof tenantSnapshot === 'object') {
      const tenantRecord = tenantSnapshot as Record<string, unknown>;
      tenantRecord.mediaBalanceAccount = mediaBalanceAccount;
      tenantRecord.ledgerEntries = accountLedgerEntries;
      tenantRecord.mediaBalanceLedgerEntries = accountLedgerEntries;
      tenantRecord.availableBalance = nextAvailable;
      tenantRecord.reservedBalance = nextReserved;
      tenantRecord.balance = nextBalance;
      tenantRecord.balanceAmount = nextBalance;
      tenantRecord.totalBalance = nextBalance;
    }

    setMediaBalanceRuntimeState(tenantId, {
      mediaBalanceAccount,
      ledgerEntries: accountLedgerEntries,
    });

    return NextResponse.json(
      {
        ok: true,
        mode: 'store',
        mediaBalanceAccount,
        ledgerEntry,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected media-balance spend error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}