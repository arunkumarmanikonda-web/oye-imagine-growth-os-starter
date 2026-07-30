import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ActivateCommercialContractInput,
  CommercialApprovalRequestRecord,
  CommercialAuditEventRecord,
  CommercialCurrencyCode,
  CommercialLedgerEntryRecord,
  CommercialMediaBalanceAccountRecord,
  CommercialMutationInput,
  CommercialMutationResult,
  CommercialPersistenceRepository,
  MarkCommercialInvoicePaidInput,
  RenewCommercialSubscriptionInput,
  ResolveCommercialApprovalRequestInput,
} from './persistence-types';

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return 0;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function mapAccountRow(row: Record<string, unknown>): CommercialMediaBalanceAccountRecord {
  return {
    tenantId: asString(row.tenant_id ?? row.tenantId),
    currency: asString(row.currency, 'INR'),
    available: asNumber(row.available),
    reserved: asNumber(row.reserved),
    spent: asNumber(row.spent),
    updatedAt: asString(row.updated_at ?? row.updatedAt, new Date().toISOString()),
  };
}

function mapLedgerRow(row: Record<string, unknown>): CommercialLedgerEntryRecord {
  return {
    entryId: asString(row.entry_id ?? row.entryId),
    tenantId: asString(row.tenant_id ?? row.tenantId),
    entryType: asString(row.entry_type ?? row.entryType),
    direction: asString(row.direction) === 'credit' ? 'credit' : 'debit',
    amount: asNumber(row.amount),
    currency: asString(row.currency, 'INR'),
    operationKey: asString(row.operation_key ?? row.operationKey),
    reference: row.reference == null ? null : asString(row.reference),
    payload: asObject(row.payload),
    createdAt: asString(row.created_at ?? row.createdAt, new Date().toISOString()),
  };
}

function mapAuditRow(row: Record<string, unknown>): CommercialAuditEventRecord {
  return {
    eventId: asString(row.event_id ?? row.eventId),
    tenantId: asString(row.tenant_id ?? row.tenantId),
    eventType: asString(row.event_type ?? row.eventType),
    actorId: row.actor_id == null && row.actorId == null ? null : asString(row.actor_id ?? row.actorId),
    beforeState: row.before_state ?? row.beforeState ?? null,
    afterState: row.after_state ?? row.afterState ?? null,
    payload: asObject(row.payload),
    createdAt: asString(row.created_at ?? row.createdAt, new Date().toISOString()),
  };
}

function mapApprovalRow(row: Record<string, unknown>): CommercialApprovalRequestRecord {
  return {
    approvalId: asString(row.approval_id ?? row.approvalId),
    tenantId: asString(row.tenant_id ?? row.tenantId),
    approvalType: asString(row.approval_type ?? row.approvalType),
    status: asString(row.status) === 'approved'
      ? 'approved'
      : asString(row.status) === 'rejected'
        ? 'rejected'
        : 'pending',
    payload: asObject(row.payload),
    resolutionPayload: asObject(row.resolution_payload ?? row.resolutionPayload),
    actorId: row.actor_id == null && row.actorId == null ? null : asString(row.actor_id ?? row.actorId),
    createdAt: asString(row.created_at ?? row.createdAt, new Date().toISOString()),
    resolvedAt: row.resolved_at == null && row.resolvedAt == null ? null : asString(row.resolved_at ?? row.resolvedAt),
  };
}

function mapMutationResult(value: unknown): CommercialMutationResult {
  const record = asObject(value);

  return {
    account: mapAccountRow(asObject(record.account)),
    ledgerEntry: mapLedgerRow(asObject(record.ledgerEntry)),
    auditEvent: mapAuditRow(asObject(record.auditEvent)),
  };
}

export class SupabaseCommercialPersistenceRepository implements CommercialPersistenceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getOrCreateMediaBalanceAccount(
    tenantId: string,
    currency: CommercialCurrencyCode = 'INR',
  ): Promise<CommercialMediaBalanceAccountRecord> {
    const rpc = await this.supabase.rpc('ensure_commercial_media_balance_account', {
      p_tenant_id: tenantId,
      p_currency: currency,
    });

    if (rpc.error) {
      throw new Error(`Failed to ensure commercial media balance account: ${rpc.error.message}`);
    }

    return mapAccountRow(asObject(rpc.data));
  }

  async reserveMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    const rpc = await this.supabase.rpc('commercial_reserve_media_balance', {
      p_tenant_id: input.tenantId,
      p_amount: input.amount,
      p_currency: input.currency ?? 'INR',
      p_operation_key: input.operationKey,
      p_actor_id: input.actorId ?? null,
      p_reference: input.reference ?? null,
      p_payload: input.payload ?? {},
    });

    if (rpc.error) {
      throw new Error(`Failed to reserve media balance: ${rpc.error.message}`);
    }

    return mapMutationResult(rpc.data);
  }

  async releaseMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    const rpc = await this.supabase.rpc('commercial_release_media_balance', {
      p_tenant_id: input.tenantId,
      p_amount: input.amount,
      p_currency: input.currency ?? 'INR',
      p_operation_key: input.operationKey,
      p_actor_id: input.actorId ?? null,
      p_reference: input.reference ?? null,
      p_payload: input.payload ?? {},
    });

    if (rpc.error) {
      throw new Error(`Failed to release media balance: ${rpc.error.message}`);
    }

    return mapMutationResult(rpc.data);
  }

  async spendMediaBalance(input: CommercialMutationInput): Promise<CommercialMutationResult> {
    const rpc = await this.supabase.rpc('commercial_spend_media_balance', {
      p_tenant_id: input.tenantId,
      p_amount: input.amount,
      p_currency: input.currency ?? 'INR',
      p_operation_key: input.operationKey,
      p_actor_id: input.actorId ?? null,
      p_reference: input.reference ?? null,
      p_payload: input.payload ?? {},
    });

    if (rpc.error) {
      throw new Error(`Failed to spend media balance: ${rpc.error.message}`);
    }

    return mapMutationResult(rpc.data);
  }

  async resolveApprovalRequest(
    input: ResolveCommercialApprovalRequestInput,
  ): Promise<unknown> {
    const rpc = await this.supabase.rpc('commercial_resolve_approval_request', {
      p_approval_request_id: input.approvalRequestId,
      p_decision: input.decision,
      p_actor_id: input.actorUserId ?? null,
      p_note: input.note ?? null,
      p_operation_key: input.operationKey,
      p_reference: input.reference ?? null,
    });

    if (rpc.error) {
      throw new Error(`Failed to resolve approval request: ${rpc.error.message}`);
    }

    return rpc.data;
  }

  async activateContract(
    input: ActivateCommercialContractInput,
  ): Promise<unknown> {
    const rpc = await this.supabase.rpc('commercial_activate_contract', {
      p_contract_id: input.contractId,
      p_actor_id: input.actorUserId ?? null,
      p_effective_at: input.effectiveAt ?? null,
      p_operation_key: input.operationKey,
      p_reference: input.reference ?? null,
    });

    if (rpc.error) {
      throw new Error(`Failed to activate contract: ${rpc.error.message}`);
    }

    return rpc.data;
  }

  async markInvoicePaid(
    input: MarkCommercialInvoicePaidInput,
  ): Promise<unknown> {
    const rpc = await this.supabase.rpc('commercial_mark_invoice_paid', {
      p_invoice_id: input.invoiceId,
      p_actor_id: input.actorUserId ?? null,
      p_paid_at: input.paidAt ?? null,
      p_operation_key: input.operationKey,
      p_reference: input.reference ?? null,
    });

    if (rpc.error) {
      throw new Error(`Failed to mark invoice paid: ${rpc.error.message}`);
    }

    return rpc.data;
  }

  async renewSubscription(
    input: RenewCommercialSubscriptionInput,
  ): Promise<unknown> {
    const rpc = await this.supabase.rpc('commercial_renew_subscription', {
      p_subscription_id: input.subscriptionId,
      p_actor_id: input.actorUserId ?? null,
      p_renewed_at: input.renewedAt ?? null,
      p_operation_key: input.operationKey,
      p_reference: input.reference ?? null,
    });

    if (rpc.error) {
      throw new Error(`Failed to renew subscription: ${rpc.error.message}`);
    }

    return rpc.data;
  }

  async listLedgerEntries(tenantId: string): Promise<CommercialLedgerEntryRecord[]> {
    const query = await this.supabase
      .from('commercial_ledger_entries')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (query.error) {
      throw new Error(`Failed to list commercial ledger entries: ${query.error.message}`);
    }

    return (query.data ?? []).map((row) => mapLedgerRow(asObject(row)));
  }

  async listAuditEvents(tenantId: string): Promise<CommercialAuditEventRecord[]> {
    const query = await this.supabase
      .from('commercial_audit_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (query.error) {
      throw new Error(`Failed to list commercial audit events: ${query.error.message}`);
    }

    return (query.data ?? []).map((row) => mapAuditRow(asObject(row)));
  }

  async listApprovalRequests(tenantId: string): Promise<CommercialApprovalRequestRecord[]> {
    const query = await this.supabase
      .from('commercial_approval_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (query.error) {
      throw new Error(`Failed to list commercial approval requests: ${query.error.message}`);
    }

    return (query.data ?? []).map((row) => mapApprovalRow(asObject(row)));
  }
}