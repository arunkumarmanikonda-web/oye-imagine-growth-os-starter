create extension if not exists pgcrypto;

create table if not exists public.commercial_tenant_snapshots (
  tenant_id text primary key,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.commercial_media_balance_accounts (
  tenant_id text primary key,
  currency text not null default 'INR',
  available numeric(18,2) not null default 0,
  reserved numeric(18,2) not null default 0,
  spent numeric(18,2) not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint commercial_media_balance_accounts_available_nonnegative check (available >= 0),
  constraint commercial_media_balance_accounts_reserved_nonnegative check (reserved >= 0),
  constraint commercial_media_balance_accounts_spent_nonnegative check (spent >= 0)
);

create table if not exists public.commercial_ledger_entries (
  entry_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  entry_type text not null,
  direction text not null check (direction in ('debit', 'credit')),
  amount numeric(18,2) not null check (amount > 0),
  currency text not null default 'INR',
  operation_key text not null,
  reference text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (operation_key, entry_type, direction)
);

create index if not exists commercial_ledger_entries_tenant_created_idx
  on public.commercial_ledger_entries (tenant_id, created_at desc);

create table if not exists public.commercial_audit_events (
  event_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  event_type text not null,
  actor_id text,
  before_state jsonb,
  after_state jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists commercial_audit_events_tenant_created_idx
  on public.commercial_audit_events (tenant_id, created_at desc);

create table if not exists public.commercial_approval_requests (
  approval_id text primary key,
  tenant_id text not null,
  approval_type text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  payload jsonb not null default '{}'::jsonb,
  resolution_payload jsonb not null default '{}'::jsonb,
  actor_id text,
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create index if not exists commercial_approval_requests_tenant_status_idx
  on public.commercial_approval_requests (tenant_id, status, created_at desc);

create table if not exists public.commercial_mutation_ops (
  operation_key text primary key,
  tenant_id text not null,
  operation_type text not null,
  status text not null default 'applied' check (status in ('applied')),
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.ensure_commercial_media_balance_account(
  p_tenant_id text,
  p_currency text default 'INR'
)
returns public.commercial_media_balance_accounts
language plpgsql
security definer
as $$
declare
  v_account public.commercial_media_balance_accounts;
begin
  insert into public.commercial_media_balance_accounts (tenant_id, currency)
  values (p_tenant_id, coalesce(nullif(trim(p_currency), ''), 'INR'))
  on conflict (tenant_id) do nothing;

  select *
    into v_account
  from public.commercial_media_balance_accounts
  where tenant_id = p_tenant_id;

  return v_account;
end;

$$;

create or replace function public.commercial_reserve_media_balance(
  p_tenant_id text,
  p_amount numeric,
  p_currency text,
  p_operation_key text,
  p_actor_id text default null,
  p_reference text default null,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing jsonb;
  v_account public.commercial_media_balance_accounts;
  v_before jsonb;
  v_after jsonb;
  v_entry_id uuid;
  v_event_id uuid;
  v_result jsonb;
begin
  if p_tenant_id is null or trim(p_tenant_id) = '' then
    raise exception 'tenant_id is required';
  end if;

  if p_operation_key is null or trim(p_operation_key) = '' then
    raise exception 'operation_key is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  select result into v_existing
  from public.commercial_mutation_ops
  where operation_key = p_operation_key;

  if v_existing is not null then
    return v_existing;
  end if;

  perform public.ensure_commercial_media_balance_account(p_tenant_id, p_currency);

  select *
    into v_account
  from public.commercial_media_balance_accounts
  where tenant_id = p_tenant_id
  for update;

  v_before := jsonb_build_object(
    'tenantId', v_account.tenant_id,
    'currency', v_account.currency,
    'available', v_account.available,
    'reserved', v_account.reserved,
    'spent', v_account.spent,
    'updatedAt', v_account.updated_at
  );

  if v_account.available < p_amount then
    raise exception 'insufficient available balance';
  end if;

  update public.commercial_media_balance_accounts
     set available = available - p_amount,
         reserved = reserved + p_amount,
         updated_at = timezone('utc', now())
   where tenant_id = p_tenant_id
  returning * into v_account;

  v_after := jsonb_build_object(
    'tenantId', v_account.tenant_id,
    'currency', v_account.currency,
    'available', v_account.available,
    'reserved', v_account.reserved,
    'spent', v_account.spent,
    'updatedAt', v_account.updated_at
  );

  insert into public.commercial_ledger_entries (
    tenant_id, entry_type, direction, amount, currency, operation_key, reference, payload
  ) values (
    p_tenant_id, 'media_balance_reserve', 'debit', p_amount, v_account.currency, p_operation_key, p_reference, coalesce(p_payload, '{}'::jsonb)
  ) returning entry_id into v_entry_id;

  insert into public.commercial_audit_events (
    tenant_id, event_type, actor_id, before_state, after_state, payload
  ) values (
    p_tenant_id, 'media_balance_reserved', p_actor_id, v_before, v_after,
    jsonb_build_object(
      'amount', p_amount,
      'currency', v_account.currency,
      'operationKey', p_operation_key,
      'reference', p_reference
    ) || coalesce(p_payload, '{}'::jsonb)
  ) returning event_id into v_event_id;

  v_result := jsonb_build_object(
    'account', v_after,
    'ledgerEntry', jsonb_build_object(
      'entryId', v_entry_id,
      'tenantId', p_tenant_id,
      'entryType', 'media_balance_reserve',
      'direction', 'debit',
      'amount', p_amount,
      'currency', v_account.currency,
      'operationKey', p_operation_key,
      'reference', p_reference
    ),
    'auditEvent', jsonb_build_object(
      'eventId', v_event_id,
      'tenantId', p_tenant_id,
      'eventType', 'media_balance_reserved',
      'actorId', p_actor_id
    )
  );

  insert into public.commercial_mutation_ops (operation_key, tenant_id, operation_type, result)
  values (p_operation_key, p_tenant_id, 'reserve', v_result);

  return v_result;
end;

$$;

create or replace function public.commercial_release_media_balance(
  p_tenant_id text,
  p_amount numeric,
  p_currency text,
  p_operation_key text,
  p_actor_id text default null,
  p_reference text default null,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing jsonb;
  v_account public.commercial_media_balance_accounts;
  v_before jsonb;
  v_after jsonb;
  v_entry_id uuid;
  v_event_id uuid;
  v_result jsonb;
begin
  if p_tenant_id is null or trim(p_tenant_id) = '' then
    raise exception 'tenant_id is required';
  end if;

  if p_operation_key is null or trim(p_operation_key) = '' then
    raise exception 'operation_key is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  select result into v_existing
  from public.commercial_mutation_ops
  where operation_key = p_operation_key;

  if v_existing is not null then
    return v_existing;
  end if;

  perform public.ensure_commercial_media_balance_account(p_tenant_id, p_currency);

  select *
    into v_account
  from public.commercial_media_balance_accounts
  where tenant_id = p_tenant_id
  for update;

  v_before := jsonb_build_object(
    'tenantId', v_account.tenant_id,
    'currency', v_account.currency,
    'available', v_account.available,
    'reserved', v_account.reserved,
    'spent', v_account.spent,
    'updatedAt', v_account.updated_at
  );

  if v_account.reserved < p_amount then
    raise exception 'insufficient reserved balance';
  end if;

  update public.commercial_media_balance_accounts
     set available = available + p_amount,
         reserved = reserved - p_amount,
         updated_at = timezone('utc', now())
   where tenant_id = p_tenant_id
  returning * into v_account;

  v_after := jsonb_build_object(
    'tenantId', v_account.tenant_id,
    'currency', v_account.currency,
    'available', v_account.available,
    'reserved', v_account.reserved,
    'spent', v_account.spent,
    'updatedAt', v_account.updated_at
  );

  insert into public.commercial_ledger_entries (
    tenant_id, entry_type, direction, amount, currency, operation_key, reference, payload
  ) values (
    p_tenant_id, 'media_balance_release', 'credit', p_amount, v_account.currency, p_operation_key, p_reference, coalesce(p_payload, '{}'::jsonb)
  ) returning entry_id into v_entry_id;

  insert into public.commercial_audit_events (
    tenant_id, event_type, actor_id, before_state, after_state, payload
  ) values (
    p_tenant_id, 'media_balance_released', p_actor_id, v_before, v_after,
    jsonb_build_object(
      'amount', p_amount,
      'currency', v_account.currency,
      'operationKey', p_operation_key,
      'reference', p_reference
    ) || coalesce(p_payload, '{}'::jsonb)
  ) returning event_id into v_event_id;

  v_result := jsonb_build_object(
    'account', v_after,
    'ledgerEntry', jsonb_build_object(
      'entryId', v_entry_id,
      'tenantId', p_tenant_id,
      'entryType', 'media_balance_release',
      'direction', 'credit',
      'amount', p_amount,
      'currency', v_account.currency,
      'operationKey', p_operation_key,
      'reference', p_reference
    ),
    'auditEvent', jsonb_build_object(
      'eventId', v_event_id,
      'tenantId', p_tenant_id,
      'eventType', 'media_balance_released',
      'actorId', p_actor_id
    )
  );

  insert into public.commercial_mutation_ops (operation_key, tenant_id, operation_type, result)
  values (p_operation_key, p_tenant_id, 'release', v_result);

  return v_result;
end;

$$;

create or replace function public.commercial_spend_media_balance(
  p_tenant_id text,
  p_amount numeric,
  p_currency text,
  p_operation_key text,
  p_actor_id text default null,
  p_reference text default null,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing jsonb;
  v_account public.commercial_media_balance_accounts;
  v_before jsonb;
  v_after jsonb;
  v_entry_id uuid;
  v_event_id uuid;
  v_result jsonb;
begin
  if p_tenant_id is null or trim(p_tenant_id) = '' then
    raise exception 'tenant_id is required';
  end if;

  if p_operation_key is null or trim(p_operation_key) = '' then
    raise exception 'operation_key is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  select result into v_existing
  from public.commercial_mutation_ops
  where operation_key = p_operation_key;

  if v_existing is not null then
    return v_existing;
  end if;

  perform public.ensure_commercial_media_balance_account(p_tenant_id, p_currency);

  select *
    into v_account
  from public.commercial_media_balance_accounts
  where tenant_id = p_tenant_id
  for update;

  v_before := jsonb_build_object(
    'tenantId', v_account.tenant_id,
    'currency', v_account.currency,
    'available', v_account.available,
    'reserved', v_account.reserved,
    'spent', v_account.spent,
    'updatedAt', v_account.updated_at
  );

  if v_account.reserved < p_amount then
    raise exception 'insufficient reserved balance';
  end if;

  update public.commercial_media_balance_accounts
     set reserved = reserved - p_amount,
         spent = spent + p_amount,
         updated_at = timezone('utc', now())
   where tenant_id = p_tenant_id
  returning * into v_account;

  v_after := jsonb_build_object(
    'tenantId', v_account.tenant_id,
    'currency', v_account.currency,
    'available', v_account.available,
    'reserved', v_account.reserved,
    'spent', v_account.spent,
    'updatedAt', v_account.updated_at
  );

  insert into public.commercial_ledger_entries (
    tenant_id, entry_type, direction, amount, currency, operation_key, reference, payload
  ) values (
    p_tenant_id, 'media_balance_spend', 'debit', p_amount, v_account.currency, p_operation_key, p_reference, coalesce(p_payload, '{}'::jsonb)
  ) returning entry_id into v_entry_id;

  insert into public.commercial_audit_events (
    tenant_id, event_type, actor_id, before_state, after_state, payload
  ) values (
    p_tenant_id, 'media_balance_spent', p_actor_id, v_before, v_after,
    jsonb_build_object(
      'amount', p_amount,
      'currency', v_account.currency,
      'operationKey', p_operation_key,
      'reference', p_reference
    ) || coalesce(p_payload, '{}'::jsonb)
  ) returning event_id into v_event_id;

  v_result := jsonb_build_object(
    'account', v_after,
    'ledgerEntry', jsonb_build_object(
      'entryId', v_entry_id,
      'tenantId', p_tenant_id,
      'entryType', 'media_balance_spend',
      'direction', 'debit',
      'amount', p_amount,
      'currency', v_account.currency,
      'operationKey', p_operation_key,
      'reference', p_reference
    ),
    'auditEvent', jsonb_build_object(
      'eventId', v_event_id,
      'tenantId', p_tenant_id,
      'eventType', 'media_balance_spent',
      'actorId', p_actor_id
    )
  );

  insert into public.commercial_mutation_ops (operation_key, tenant_id, operation_type, result)
  values (p_operation_key, p_tenant_id, 'spend', v_result);

  return v_result;
end;

$$;