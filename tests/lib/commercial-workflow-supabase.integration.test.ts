import { createClient } from '@supabase/supabase-js';
import { beforeAll, describe, expect, it } from 'vitest';

import { SupabaseCommercialPersistenceRepository } from '../../src/lib/commercial/persistence';
import { CommercialPersistenceService } from '../../src/lib/commercial/persistence-service';

const enabled = process.env.RUN_COMMERCIAL_SUPABASE_INTEGRATION === '1';

function must(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type Row = Record<string, any>;

const suite = enabled ? describe : describe.skip;

suite('commercial workflow supabase integration', () => {
  const supabaseUrl = must('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'Missing one of SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY / SUPABASE_SECRET_KEY',
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const db: any = supabase;
  const repository = new SupabaseCommercialPersistenceRepository(supabase);
  const service = new CommercialPersistenceService(repository);

  let tenantId: string;
  let approvalKey: string;
  let contractKey: string;
  let invoiceKey: string;
  let subscriptionKey: string;

  async function maybeSingle<T = Row>(builder: PromiseLike<{ data: T | null; error: { message: string } | null }>, label: string): Promise<T | null> {
    const result = await builder;
    if (result.error) {
      throw new Error(`${label}: ${result.error.message}`);
    }
    return result.data ?? null;
  }

  async function detectKeyColumn(
    table: string,
    candidates: string[],
    extraColumns: string[] = [],
  ): Promise<string> {
    for (const candidate of candidates) {
      const selectExpr = [candidate, 'tenant_id', 'status', ...extraColumns].join(', ');
      const result = await db.from(table).select(selectExpr).limit(1).maybeSingle();
      if (!result.error) {
        return candidate;
      }
    }

    throw new Error(
      `Could not detect key column for ${table}. Tried: ${candidates.join(', ')}`,
    );
  }

  async function countMutationOps(operationKey: string): Promise<number> {
    const { count, error } = await db
      .from('commercial_mutation_ops')
      .select('*', { count: 'exact', head: true })
      .eq('operation_key', operationKey);

    if (error) {
      throw new Error(`countMutationOps(${operationKey}): ${error.message}`);
    }

    return count ?? 0;
  }

  async function countAuditEvents(tenantId: string): Promise<number> {
    const { count, error } = await db
      .from('commercial_audit_events')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`countAuditEvents(${tenantId}): ${error.message}`);
    }

    return count ?? 0;
  }

  async function readMutationOp(operationKey: string): Promise<Row | null> {
    const { data, error } = await db
      .from('commercial_mutation_ops')
      .select('*')
      .eq('operation_key', operationKey)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`readMutationOp(${operationKey}): ${error.message}`);
    }

    return data;
  }

  async function readEntity(table: string, keyColumn: string, keyValue: string): Promise<Row | null> {
    const { data, error } = await db
      .from(table)
      .select('*')
      .eq(keyColumn, keyValue)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`readEntity(${table}, ${keyColumn}): ${error.message}`);
    }

    return data;
  }

  async function requireTenantId(): Promise<string> {
    const tenant = await maybeSingle<{ id: string }>(
      db.from('tenants').select('id').limit(1).maybeSingle(),
      'tenant lookup',
    );

    if (!tenant?.id) {
      throw new Error('No tenant row found in public.tenants');
    }

    return tenant.id;
  }

  async function ensurePendingApproval(): Promise<Row> {
    const approvalId = uniqueId('it-approval');

    const insertRow: Row = {
      tenant_id: tenantId,
      approval_type: 'commercial_review',
      status: 'pending',
      payload: {
        seededBy: 'integration-test',
        purpose: 'commercial workflow persistence',
      },
      resolution_payload: {},
    };
    insertRow[approvalKey] = approvalId;

    const { data, error } = await db
      .from('commercial_approval_requests')
      .insert(insertRow)
      .select(`${approvalKey}, tenant_id, status, approval_type`)
      .single();

    if (error) {
      throw new Error(`insert approval fixture: ${error.message}`);
    }

    return data;
  }

  async function ensureDraftContract(): Promise<Row> {
    const contractId = uniqueId('it-contract');

    const insertRow: Row = {
      tenant_id: tenantId,
      status: 'draft',
      payload: {
        seededBy: 'integration-test',
        purpose: 'commercial workflow persistence',
      },
    };
    insertRow[contractKey] = contractId;

    const { data, error } = await db
      .from('commercial_contracts')
      .insert(insertRow)
      .select(`${contractKey}, tenant_id, status`)
      .single();

    if (error) {
      throw new Error(`insert contract fixture: ${error.message}`);
    }

    return data;
  }

  async function ensureOpenInvoice(): Promise<Row> {
    const invoiceId = uniqueId('it-invoice');

    const insertRow: Row = {
      tenant_id: tenantId,
      status: 'issued',
      payload: {
        seededBy: 'integration-test',
        purpose: 'commercial workflow persistence',
      },
    };
    insertRow[invoiceKey] = invoiceId;

    const { data, error } = await db
      .from('commercial_invoices')
      .insert(insertRow)
      .select(`${invoiceKey}, tenant_id, status`)
      .single();

    if (error) {
      throw new Error(`insert invoice fixture: ${error.message}`);
    }

    return data;
  }

  async function ensureSubscription(): Promise<Row> {
    const subscriptionId = uniqueId('it-subscription');

    const insertRow: Row = {
      tenant_id: tenantId,
      status: 'active',
      payload: {
        seededBy: 'integration-test',
        purpose: 'commercial workflow persistence',
      },
    };
    insertRow[subscriptionKey] = subscriptionId;

    const { data, error } = await db
      .from('commercial_subscriptions')
      .insert(insertRow)
      .select(`${subscriptionKey}, tenant_id, status`)
      .single();

    if (error) {
      throw new Error(`insert subscription fixture: ${error.message}`);
    }

    return data;
  }

  async function expectIdempotentMutation(args: {
    name: string;
    operationKey: string;
    tenantId: string;
    entityTable: string;
    entityKey: string;
    entityId: string;
    invoke: () => Promise<any>;
    expectedOperationType: string;
    expectedStatus?: string;
  }) {
    const beforeOps = await countMutationOps(args.operationKey);
    const beforeAudit = await countAuditEvents(args.tenantId);

    const first = await args.invoke();
    const afterFirstOps = await countMutationOps(args.operationKey);
    const afterFirstAudit = await countAuditEvents(args.tenantId);

    const second = await args.invoke();
    const afterSecondOps = await countMutationOps(args.operationKey);
    const afterSecondAudit = await countAuditEvents(args.tenantId);

    const entity = await readEntity(args.entityTable, args.entityKey, args.entityId);
    const mutationOp = await readMutationOp(args.operationKey);

    expect(first, `${args.name}: first and second result should match`).toEqual(second);
    expect(afterFirstOps, `${args.name}: first call should persist one mutation op`).toBe(beforeOps + 1);
    expect(afterSecondOps, `${args.name}: replay should not add mutation ops`).toBe(afterFirstOps);
    expect(afterFirstAudit, `${args.name}: first call should add one audit event`).toBe(beforeAudit + 1);
    expect(afterSecondAudit, `${args.name}: replay should not add another audit event`).toBe(afterFirstAudit);

    expect(mutationOp).toBeTruthy();
    expect(mutationOp?.operation_key).toBe(args.operationKey);
    expect(mutationOp?.operation_type).toBe(args.expectedOperationType);
    expect(mutationOp?.status).toBe('applied');

    expect(entity).toBeTruthy();
    if (args.expectedStatus) {
      expect(entity?.status).toBe(args.expectedStatus);
    }
  }

  beforeAll(async () => {
    tenantId = await requireTenantId();
    approvalKey = await detectKeyColumn('commercial_approval_requests', ['approval_id', 'id'], ['approval_type']);
    contractKey = await detectKeyColumn('commercial_contracts', ['contract_id', 'id']);
    invoiceKey = await detectKeyColumn('commercial_invoices', ['invoice_id', 'id']);
    subscriptionKey = await detectKeyColumn('commercial_subscriptions', ['subscription_id', 'id']);
  });

  it('persists approval resolution with replay-safe operation key', async () => {
    const approval = await ensurePendingApproval();
    const approvalId = approval[approvalKey] as string;
    const operationKey = uniqueId(`it:approval:${approvalId}`);

    await expectIdempotentMutation({
      name: 'approval-resolve',
      operationKey,
      tenantId,
      entityTable: 'commercial_approval_requests',
      entityKey: approvalKey,
      entityId: approvalId,
      expectedOperationType: 'approval-resolve',
      expectedStatus: 'approved',
      invoke: () =>
        service.resolveApprovalRequest({
          approvalRequestId: approvalId,
          decision: 'approve' as any,
          operationKey,
          reference: 'vitest-integration',
        } as any),
    });
  }, 60000);

  it('persists contract activation with replay-safe operation key', async () => {
    const contract = await ensureDraftContract();
    const contractId = contract[contractKey] as string;
    const operationKey = uniqueId(`it:contract:${contractId}`);

    await expectIdempotentMutation({
      name: 'contract-activate',
      operationKey,
      tenantId,
      entityTable: 'commercial_contracts',
      entityKey: contractKey,
      entityId: contractId,
      expectedOperationType: 'contract-activate',
      expectedStatus: 'active',
      invoke: () =>
        service.activateContract({
          contractId,
          operationKey,
          reference: 'vitest-integration',
        } as any),
    });
  }, 60000);

  it('persists invoice payment with replay-safe operation key', async () => {
    const invoice = await ensureOpenInvoice();
    const invoiceId = invoice[invoiceKey] as string;
    const operationKey = uniqueId(`it:invoice:${invoiceId}`);

    await expectIdempotentMutation({
      name: 'invoice-mark-paid',
      operationKey,
      tenantId,
      entityTable: 'commercial_invoices',
      entityKey: invoiceKey,
      entityId: invoiceId,
      expectedOperationType: 'invoice-mark-paid',
      expectedStatus: 'paid',
      invoke: () =>
        service.markInvoicePaid({
          invoiceId,
          operationKey,
          reference: 'vitest-integration',
        } as any),
    });
  }, 60000);

  it('persists subscription renewal with replay-safe operation key', async () => {
    const subscription = await ensureSubscription();
    const subscriptionId = subscription[subscriptionKey] as string;
    const operationKey = uniqueId(`it:subscription:${subscriptionId}`);

    await expectIdempotentMutation({
      name: 'subscription-renew',
      operationKey,
      tenantId,
      entityTable: 'commercial_subscriptions',
      entityKey: subscriptionKey,
      entityId: subscriptionId,
      expectedOperationType: 'subscription-renew',
      expectedStatus: 'active',
      invoke: () =>
        service.renewSubscription({
          subscriptionId,
          operationKey,
          reference: 'vitest-integration',
        } as any),
    });
  }, 60000);
});