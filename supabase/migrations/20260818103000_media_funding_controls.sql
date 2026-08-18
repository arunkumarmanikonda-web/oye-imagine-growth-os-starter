create table if not exists public.commercial_media_funding_requests (
  request_id uuid primary key default pg_catalog.gen_random_uuid(),
  tenant_id text not null,
  workspace_id uuid,
  amount numeric not null check (amount > 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  funding_source text not null default 'bank_remittance' check (funding_source in ('bank_remittance','payment_gateway','manual_adjustment')),
  remittance_reference text not null,
  paid_at timestamptz,
  evidence jsonb not null default '{}'::jsonb,
  note text,
  status text not null default 'submitted' check (status in ('submitted','credited','rejected')),
  submitted_by text not null,
  submitted_at timestamptz not null default now(),
  verified_by text,
  verified_at timestamptz,
  verification_note text,
  credited_at timestamptz,
  rejected_by text,
  rejected_at timestamptz,
  rejection_reason text,
  updated_at timestamptz not null default now(),
  unique (tenant_id, remittance_reference)
);

create index if not exists commercial_media_funding_requests_target_status_idx
  on public.commercial_media_funding_requests (tenant_id, workspace_id, status, submitted_at desc);

alter table public.commercial_media_funding_requests enable row level security;
revoke all on public.commercial_media_funding_requests from public, anon, authenticated;
revoke truncate, references, trigger on public.commercial_media_funding_requests from service_role;
grant select, insert, update, delete on public.commercial_media_funding_requests to service_role;

create or replace function public.verify_and_credit_media_funding(
  p_request_id uuid,
  p_actor text,
  p_verification_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_request public.commercial_media_funding_requests%rowtype;
  v_account public.commercial_media_balance_accounts%rowtype;
  v_operation_key text;
  v_result jsonb;
begin
  if coalesce(btrim(p_actor), '') = '' then
    return jsonb_build_object('ok', false, 'code', 'verification_actor_required');
  end if;

  select * into v_request
  from public.commercial_media_funding_requests
  where request_id = p_request_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'media_funding_request_not_found');
  end if;

  if v_request.status = 'credited' then
    return jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'requestId', v_request.request_id,
      'tenantId', v_request.tenant_id,
      'amount', v_request.amount,
      'currency', v_request.currency,
      'creditedAt', v_request.credited_at
    );
  end if;

  if v_request.status <> 'submitted' then
    return jsonb_build_object('ok', false, 'code', 'media_funding_request_not_verifiable', 'status', v_request.status);
  end if;

  if v_request.submitted_by = p_actor then
    return jsonb_build_object('ok', false, 'code', 'media_funding_maker_checker_required');
  end if;

  v_operation_key := 'media_funding:' || v_request.request_id::text;

  select * into v_account
  from public.commercial_media_balance_accounts
  where tenant_id = v_request.tenant_id
  for update;

  if found and v_account.currency <> v_request.currency then
    return jsonb_build_object(
      'ok', false,
      'code', 'media_funding_currency_mismatch',
      'accountCurrency', v_account.currency,
      'requestCurrency', v_request.currency
    );
  end if;

  if not found then
    insert into public.commercial_media_balance_accounts (
      tenant_id, currency, available, reserved, spent, updated_at
    ) values (
      v_request.tenant_id, v_request.currency, v_request.amount, 0, 0, now()
    );
  else
    update public.commercial_media_balance_accounts
       set available = available + v_request.amount,
           updated_at = now()
     where tenant_id = v_request.tenant_id;
  end if;

  insert into public.commercial_ledger_entries (
    tenant_id, entry_type, direction, amount, currency, operation_key, reference, payload
  ) values (
    v_request.tenant_id,
    'media_wallet_funding',
    'credit',
    v_request.amount,
    v_request.currency,
    v_operation_key,
    v_request.remittance_reference,
    jsonb_build_object(
      'mediaFundingRequestId', v_request.request_id,
      'workspaceId', v_request.workspace_id,
      'fundingSource', v_request.funding_source,
      'paidAt', v_request.paid_at,
      'verifiedBy', p_actor
    )
  ) on conflict (operation_key, entry_type, direction) do nothing;

  update public.commercial_media_funding_requests
     set status = 'credited',
         verified_by = p_actor,
         verified_at = now(),
         verification_note = nullif(btrim(coalesce(p_verification_note, '')), ''),
         credited_at = now(),
         updated_at = now()
   where request_id = p_request_id
   returning * into v_request;

  v_result := jsonb_build_object(
    'requestId', v_request.request_id,
    'tenantId', v_request.tenant_id,
    'workspaceId', v_request.workspace_id,
    'amount', v_request.amount,
    'currency', v_request.currency,
    'reference', v_request.remittance_reference,
    'creditedAt', v_request.credited_at
  );

  insert into public.commercial_mutation_ops (
    operation_key, tenant_id, operation_type, status, result
  ) values (
    v_operation_key, v_request.tenant_id, 'media_wallet_funding', 'applied', v_result
  ) on conflict (operation_key) do nothing;

  insert into public.commercial_audit_events (
    tenant_id, event_type, actor_id, payload
  ) values (
    v_request.tenant_id,
    'media_wallet_funding_credited',
    p_actor,
    v_result
  );

  return jsonb_build_object('ok', true, 'idempotent', false) || v_result;
end;
$$;

revoke all on function public.verify_and_credit_media_funding(uuid,text,text) from public, anon, authenticated;
grant execute on function public.verify_and_credit_media_funding(uuid,text,text) to service_role;
