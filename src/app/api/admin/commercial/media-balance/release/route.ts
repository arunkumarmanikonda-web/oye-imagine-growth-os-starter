import { NextRequest, NextResponse } from 'next/server';

import {
  getCommercialPersistenceMode,
  releaseMediaBalanceRuntime,
} from '@/lib/commercial/runtime';

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return Number.NaN;
}

function normalizeMediaBalanceAccount(value: unknown): Record<string, unknown> {
  const root = asRecord(value);
  const candidate = Object.keys(asRecord(root.mediaBalanceAccount)).length > 0
    ? asRecord(root.mediaBalanceAccount)
    : Object.keys(asRecord(root.account)).length > 0
      ? asRecord(root.account)
      : root;

  const availableBalance = Number(candidate.availableBalance ?? candidate.available ?? 0);
  const reservedBalance = Number(candidate.reservedBalance ?? candidate.reserved ?? 0);
  const spentBalance = Number(candidate.spentBalance ?? candidate.spent ?? 0);

  return {
    ...candidate,
    available: availableBalance,
    reserved: reservedBalance,
    spent: spentBalance,
    availableBalance,
    reservedBalance,
    spentBalance,
  };
}

function buildOperationKey(explicitKey: unknown, tenantId: string, prefix: string): string {
  if (typeof explicitKey === 'string' && explicitKey.trim().length > 0) {
    return explicitKey.trim();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}:${tenantId}:${crypto.randomUUID()}`;
  }

  return `${prefix}:${tenantId}:${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.json().catch(() => null);
  const body = asRecord(rawBody);

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const tenantId = typeof body.tenantId === 'string' ? body.tenantId.trim() : '';
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  const amount = asNumber(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount must be positive' }, { status: 400 });
  }

  try {
    const raw = await releaseMediaBalanceRuntime({
      tenantId,
      amount,
      currency: typeof body.currency === 'string' && body.currency.trim() ? body.currency.trim() : 'INR',
      operationKey: buildOperationKey(body.operationKey, tenantId, 'release'),
      actorId: typeof body.actorId === 'string' ? body.actorId : undefined,
      reference: typeof body.reference === 'string' ? body.reference : undefined,
      payload: asRecord(body.payload),
    });

    const root = asRecord(raw);
    const mediaBalanceAccount = normalizeMediaBalanceAccount(raw);

    return NextResponse.json({
      ...root,
      mediaBalanceAccount,
      mode: getCommercialPersistenceMode(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to release media balance';
    const status = /insufficient/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}