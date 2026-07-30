begin;

create table if not exists public.commercial_contracts (
  contract_id text primary key,
  tenant_id text not null,
  status text not null default 'draft',
  effective_at timestamptz null,
  activated_by text null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists commercial_contracts_tenant_status_idx
on public.commercial_contracts (tenant_id, status, updated_at desc);

create table if not exists public.commercial_invoices (
  invoice_id text primary key,
  tenant_id text not null,
  status text not null default 'issued',
  paid_at timestamptz null,
  paid_by text null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists commercial_invoices_tenant_status_idx
on public.commercial_invoices (tenant_id, status, updated_at desc);

create table if not exists public.commercial_subscriptions (
  subscription_id text primary key,
  tenant_id text not null,
  status text not null default 'active',
  renewed_at timestamptz null,
  renewed_by text null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists commercial_subscriptions_tenant_status_idx
on public.commercial_subscriptions (tenant_id, status, updated_at desc);

create or replace function public.tg_commercial_workflow_set_updated_at()
returns trigger
language plpgsql
as .\supabase\migrations\20260730_commercial_workflow_persistence.sql
begin
  new.updated_at := timezone('utc', now());
  return new;
end;

.\supabase\migrations\20260730_commercial_workflow_persistence.sql;

drop trigger if exists trg_commercial_contracts_set_updated_at on public.commercial_contracts;
create trigger trg_commercial_contracts_set_updated_at
before update on public.commercial_contracts
for each row
execute function public.tg_commercial_workflow_set_updated_at();

drop trigger if exists trg_commercial_invoices_set_updated_at on public.commercial_invoices;
create trigger trg_commercial_invoices_set_updated_at
before update on public.commercial_invoices
for each row
execute function public.tg_commercial_workflow_set_updated_at();

drop trigger if exists trg_commercial_subscriptions_set_updated_at on public.commercial_subscriptions;
create trigger trg_commercial_subscriptions_set_updated_at
before update on public.commercial_subscriptions
for each row
execute function public.tg_commercial_workflow_set_updated_at();

create or replace function public.commercial_resolve_approval_request(
  p_approval_request_id text,
  p_decision text,
  p_actor_id text default null,
  p_note text default null,
  p_operation_key text default null,
  p_reference text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as .\supabase\migrations\20260730_commercial_workflow_persistence.sql
declare
  v_existing jsonb;
  v_request public.commercial_approval_requests%rowtype;
  v_now timestamptz := timezone('utc', now());
  v_result jsonb;
begin
  if p_operation_key is null or trim(p_operation_key) = '' then
    raise exception 'operation_key is required';
  end if;

  if p_decision not in ('approve', 'reject') then
    raise exception 'decision must be approve or reject';
  end if;

  select result
    into v_existing
  from public.commercial_mutation_ops
  where operation_key = p_operation_key;

  if v_existing is not null then
    return v_existing;
  end if;

  select *
    into v_request
  from public.commercial_approval_requests
  where approval_id = p_approval_request_id
  for update;

  if not found then
    raise exception 'Approval request not found for id %', p_approval_request_id;
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Approval request % is already resolved', v_request.approval_id;
  end if;

  update public.commercial_approval_requests
     set status = case when p_decision = 'approve' then 'approved' else 'rejected' end,
         actor_id = p_actor_id,
         resolution_payload = coalesce(v_request.resolution_payload, '{}'::jsonb) || jsonb_build_object(
           'decision', p_decision,
           'note', p_note,
           'operationKey', p_operation_key,
           'reference', p_reference,
           'actorId', p_actor_id
         ),
         resolved_at = v_now
   where approval_id = p_approval_request_id
   returning * into v_request;

  insert into public.commercial_audit_events (
    tenant_id,
    event_type,
    actor_id,
    before_state,
    after_state,
    payload
  )
  values (
    v_request.tenant_id,
    'approval_request_resolved',
    p_actor_id,
    jsonb_build_object(
      'approvalId', v_request.approval_id,
      'status', 'pending'
    ),
    jsonb_build_object(
      'approvalId', v_request.approval_id,
      'status', v_request.status
    ),
    jsonb_build_object(
      'approvalId', v_request.approval_id,
      'decision', p_decision,
      'note', p_note,
      'operationKey', p_operation_key,
      'reference', p_reference
    )
  );

  v_result := jsonb_build_object(
    'status', v_request.status,
    'approvalRequest', jsonb_build_object(
      'id', v_request.approval_id,
      'tenantId', v_request.tenant_id,
      'approvalType', v_request.approval_type,
      'status', v_request.status,
      'payload', coalesce(v_request.payload, '{}'::jsonb),
      'resolutionPayload', coalesce(v_request.resolution_payload, '{}'::jsonb),
      'approverUserId', v_request.actor_id,
      'decidedAt', v_request.resolved_at,
      'createdAt', v_request.created_at
    )
  );

  insert into public.commercial_mutation_ops (
    operation_key,
    tenant_id,
    operation_type,
    result
  )
  values (
    p_operation_key,
    v_request.tenant_id,
    'approval-resolve',
    v_result
  );

  return v_result;
end;

.\supabase\migrations\20260730_commercial_workflow_persistence.sql;

create or replace function public.commercial_activate_contract(
  p_contract_id text,
  p_actor_id text default null,
  p_effective_at timestamptz default null,
  p_operation_key text default null,
  p_reference text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as .\supabase\migrations\20260730_commercial_workflow_persistence.sql
declare
  v_existing jsonb;
  v_contract public.commercial_contracts%rowtype;
  v_now timestamptz := timezone('utc', now());
  v_effective_at timestamptz := coalesce(p_effective_at, v_now);
  v_result jsonb;
begin
  if p_operation_key is null or trim(p_operation_key) = '' then
    raise exception 'operation_key is required';
  end if;

  select result
    into v_existing
  from public.commercial_mutation_ops
  where operation_key = p_operation_key;

  if v_existing is not null then
    return v_existing;
  end if;

  select *
    into v_contract
  from public.commercial_contracts
  where contract_id = p_contract_id
  for update;

  if not found then
    raise exception 'Contract not found for id %', p_contract_id;
  end if;

  update public.commercial_contracts
     set status = 'active',
         effective_at = v_effective_at,
         activated_by = p_actor_id
   where contract_id = p_contract_id
   returning * into v_contract;

  insert into public.commercial_audit_events (
    tenant_id,
    event_type,
    actor_id,
    before_state,
    after_state,
    payload
  )
  values (
    v_contract.tenant_id,
    'contract_activated',
    p_actor_id,
    jsonb_build_object(
      'contractId', v_contract.contract_id
    ),
    jsonb_build_object(
      'contractId', v_contract.contract_id,
      'status', v_contract.status,
      'effectiveAt', v_contract.effective_at
    ),
    jsonb_build_object(
      'contractId', v_contract.contract_id,
      'operationKey', p_operation_key,
      'reference', p_reference
    )
  );

  v_result := jsonb_build_object(
    'id', v_contract.contract_id,
    'tenantId', v_contract.tenant_id,
    'status', v_contract.status,
    'effectiveAt', v_contract.effective_at,
    'activatedByUserId', v_contract.activated_by,
    'payload', coalesce(v_contract.payload, '{}'::jsonb),
    'createdAt', v_contract.created_at,
    'updatedAt', v_contract.updated_at
  );

  insert into public.commercial_mutation_ops (
    operation_key,
    tenant_id,
    operation_type,
    result
  )
  values (
    p_operation_key,
    v_contract.tenant_id,
    'contract-activate',
    v_result
  );

  return v_result;
end;

.\supabase\migrations\20260730_commercial_workflow_persistence.sql;

create or replace function public.commercial_mark_invoice_paid(
  p_invoice_id text,
  p_actor_id text default null,
  p_paid_at timestamptz default null,
  p_operation_key text default null,
  p_reference text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as .\supabase\migrations\20260730_commercial_workflow_persistence.sql
declare
  v_existing jsonb;
  v_invoice public.commercial_invoices%rowtype;
  v_now timestamptz := timezone('utc', now());
  v_effective_paid_at timestamptz := coalesce(p_paid_at, v_now);
  v_result jsonb;
begin
  if p_operation_key is null or trim(p_operation_key) = '' then
    raise exception 'operation_key is required';
  end if;

  select result
    into v_existing
  from public.commercial_mutation_ops
  where operation_key = p_operation_key;

  if v_existing is not null then
    return v_existing;
  end if;

  select *
    into v_invoice
  from public.commercial_invoices
  where invoice_id = p_invoice_id
  for update;

  if not found then
    raise exception 'Invoice not found for id %', p_invoice_id;
  end if;

  update public.commercial_invoices
     set status = 'paid',
         paid_at = v_effective_paid_at,
         paid_by = p_actor_id
   where invoice_id = p_invoice_id
   returning * into v_invoice;

  insert into public.commercial_audit_events (
    tenant_id,
    event_type,
    actor_id,
    before_state,
    after_state,
    payload
  )
  values (
    v_invoice.tenant_id,
    'invoice_marked_paid',
    p_actor_id,
    jsonb_build_object(
      'invoiceId', v_invoice.invoice_id
    ),
    jsonb_build_object(
      'invoiceId', v_invoice.invoice_id,
      'status', v_invoice.status,
      'paidAt', v_invoice.paid_at
    ),
    jsonb_build_object(
      'invoiceId', v_invoice.invoice_id,
      'operationKey', p_operation_key,
      'reference', p_reference
    )
  );

  v_result := jsonb_build_object(
    'id', v_invoice.invoice_id,
    'tenantId', v_invoice.tenant_id,
    'status', v_invoice.status,
    'paidAt', v_invoice.paid_at,
    'paidByUserId', v_invoice.paid_by,
    'payload', coalesce(v_invoice.payload, '{}'::jsonb),
    'createdAt', v_invoice.created_at,
    'updatedAt', v_invoice.updated_at
  );

  insert into public.commercial_mutation_ops (
    operation_key,
    tenant_id,
    operation_type,
    result
  )
  values (
    p_operation_key,
    v_invoice.tenant_id,
    'invoice-mark-paid',
    v_result
  );

  return v_result;
end;

.\supabase\migrations\20260730_commercial_workflow_persistence.sql;

create or replace function public.commercial_renew_subscription(
  p_subscription_id text,
  p_actor_id text default null,
  p_renewed_at timestamptz default null,
  p_operation_key text default null,
  p_reference text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as .\supabase\migrations\20260730_commercial_workflow_persistence.sql
declare
  v_existing jsonb;
  v_subscription public.commercial_subscriptions%rowtype;
  v_now timestamptz := timezone('utc', now());
  v_effective_renewed_at timestamptz := coalesce(p_renewed_at, v_now);
  v_result jsonb;
begin
  if p_operation_key is null or trim(p_operation_key) = '' then
    raise exception 'operation_key is required';
  end if;

  select result
    into v_existing
  from public.commercial_mutation_ops
  where operation_key = p_operation_key;

  if v_existing is not null then
    return v_existing;
  end if;

  select *
    into v_subscription
  from public.commercial_subscriptions
  where subscription_id = p_subscription_id
  for update;

  if not found then
    raise exception 'Subscription not found for id %', p_subscription_id;
  end if;

  update public.commercial_subscriptions
     set status = 'active',
         renewed_at = v_effective_renewed_at,
         renewed_by = p_actor_id
   where subscription_id = p_subscription_id
   returning * into v_subscription;

  insert into public.commercial_audit_events (
    tenant_id,
    event_type,
    actor_id,
    before_state,
    after_state,
    payload
  )
  values (
    v_subscription.tenant_id,
    'subscription_renewed',
    p_actor_id,
    jsonb_build_object(
      'subscriptionId', v_subscription.subscription_id
    ),
    jsonb_build_object(
      'subscriptionId', v_subscription.subscription_id,
      'status', v_subscription.status,
      'renewedAt', v_subscription.renewed_at
    ),
    jsonb_build_object(
      'subscriptionId', v_subscription.subscription_id,
      'operationKey', p_operation_key,
      'reference', p_reference
    )
  );

  v_result := jsonb_build_object(
    'id', v_subscription.subscription_id,
    'tenantId', v_subscription.tenant_id,
    'status', v_subscription.status,
    'renewedAt', v_subscription.renewed_at,
    'renewedByUserId', v_subscription.renewed_by,
    'payload', coalesce(v_subscription.payload, '{}'::jsonb),
    'createdAt', v_subscription.created_at,
    'updatedAt', v_subscription.updated_at
  );

  insert into public.commercial_mutation_ops (
    operation_key,
    tenant_id,
    operation_type,
    result
  )
  values (
    p_operation_key,
    v_subscription.tenant_id,
    'subscription-renew',
    v_result
  );

  return v_result;
end;

.\supabase\migrations\20260730_commercial_workflow_persistence.sql;

commit;