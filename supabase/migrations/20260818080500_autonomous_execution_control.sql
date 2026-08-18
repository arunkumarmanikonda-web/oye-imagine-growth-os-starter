create table if not exists public.autonomous_execution_runs (
  run_id uuid primary key default pg_catalog.gen_random_uuid(),
  tenant_id text not null,
  workspace_id text,
  agent_key text not null,
  idempotency_key text not null,
  action_key text not null,
  provider_key text not null,
  channel text not null,
  requested_amount numeric not null default 0 check (requested_amount >= 0),
  currency text not null default 'INR',
  status text not null default 'gated' check (status in ('gated','blocked','approved','executing','succeeded','failed')),
  reservation_state text not null default 'not_required' check (reservation_state in ('not_required','pending','reserved','settled','released')),
  approval_id text,
  external_resource_id text,
  request_payload jsonb not null default '{}'::jsonb,
  provider_result jsonb not null default '{}'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  error_code text,
  created_by text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create index if not exists autonomous_execution_runs_tenant_status_idx
  on public.autonomous_execution_runs (tenant_id, status, created_at desc);
create index if not exists autonomous_execution_runs_workspace_idx
  on public.autonomous_execution_runs (workspace_id, created_at desc);

alter table public.autonomous_execution_runs enable row level security;
revoke all on public.autonomous_execution_runs from public, anon, authenticated;
grant select, insert, update on public.autonomous_execution_runs to service_role;

create or replace function public.reserve_autonomous_media_spend(p_run_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_run public.autonomous_execution_runs%rowtype;
  v_account public.commercial_media_balance_accounts%rowtype;
begin
  select * into v_run from public.autonomous_execution_runs where run_id = p_run_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'execution_run_not_found');
  end if;
  if v_run.requested_amount <= 0 then
    update public.autonomous_execution_runs set reservation_state='not_required', updated_at=now() where run_id=p_run_id;
    return jsonb_build_object('ok', true, 'reserved', 0, 'currency', v_run.currency);
  end if;
  if v_run.reservation_state in ('reserved','settled') then
    return jsonb_build_object('ok', true, 'reserved', v_run.requested_amount, 'currency', v_run.currency, 'idempotent', true);
  end if;
  if v_run.reservation_state = 'released' then
    return jsonb_build_object('ok', false, 'code', 'reservation_already_released');
  end if;

  select * into v_account
  from public.commercial_media_balance_accounts
  where tenant_id = v_run.tenant_id and currency = v_run.currency
  for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'prepaid_media_balance_missing');
  end if;
  if v_account.available < v_run.requested_amount then
    return jsonb_build_object('ok', false, 'code', 'prepaid_media_balance_insufficient', 'available', v_account.available, 'requested', v_run.requested_amount);
  end if;

  update public.commercial_media_balance_accounts
     set available = available - v_run.requested_amount,
         reserved = reserved + v_run.requested_amount,
         updated_at = now()
   where tenant_id = v_run.tenant_id and currency = v_run.currency;
  update public.autonomous_execution_runs
     set reservation_state='reserved', updated_at=now()
   where run_id=p_run_id;

  return jsonb_build_object('ok', true, 'reserved', v_run.requested_amount, 'currency', v_run.currency);
end;
$$;

create or replace function public.settle_autonomous_media_spend(p_run_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_run public.autonomous_execution_runs%rowtype;
begin
  select * into v_run from public.autonomous_execution_runs where run_id = p_run_id for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'execution_run_not_found'); end if;
  if v_run.requested_amount <= 0 or v_run.reservation_state='not_required' then
    return jsonb_build_object('ok', true, 'settled', 0, 'currency', v_run.currency);
  end if;
  if v_run.reservation_state='settled' then
    return jsonb_build_object('ok', true, 'settled', v_run.requested_amount, 'currency', v_run.currency, 'idempotent', true);
  end if;
  if v_run.reservation_state <> 'reserved' then
    return jsonb_build_object('ok', false, 'code', 'reservation_not_settleable', 'state', v_run.reservation_state);
  end if;

  update public.commercial_media_balance_accounts
     set reserved = reserved - v_run.requested_amount,
         spent = spent + v_run.requested_amount,
         updated_at = now()
   where tenant_id = v_run.tenant_id and currency = v_run.currency and reserved >= v_run.requested_amount;
  if not found then return jsonb_build_object('ok', false, 'code', 'reserved_balance_inconsistent'); end if;
  update public.autonomous_execution_runs set reservation_state='settled', updated_at=now() where run_id=p_run_id;
  return jsonb_build_object('ok', true, 'settled', v_run.requested_amount, 'currency', v_run.currency);
end;
$$;

create or replace function public.release_autonomous_media_spend(p_run_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_run public.autonomous_execution_runs%rowtype;
begin
  select * into v_run from public.autonomous_execution_runs where run_id = p_run_id for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'execution_run_not_found'); end if;
  if v_run.requested_amount <= 0 or v_run.reservation_state in ('not_required','released') then
    return jsonb_build_object('ok', true, 'released', 0, 'currency', v_run.currency);
  end if;
  if v_run.reservation_state='settled' then
    return jsonb_build_object('ok', false, 'code', 'settled_reservation_cannot_release');
  end if;
  if v_run.reservation_state <> 'reserved' then
    return jsonb_build_object('ok', false, 'code', 'reservation_not_releasable', 'state', v_run.reservation_state);
  end if;

  update public.commercial_media_balance_accounts
     set reserved = reserved - v_run.requested_amount,
         available = available + v_run.requested_amount,
         updated_at = now()
   where tenant_id = v_run.tenant_id and currency = v_run.currency and reserved >= v_run.requested_amount;
  if not found then return jsonb_build_object('ok', false, 'code', 'reserved_balance_inconsistent'); end if;
  update public.autonomous_execution_runs set reservation_state='released', updated_at=now() where run_id=p_run_id;
  return jsonb_build_object('ok', true, 'released', v_run.requested_amount, 'currency', v_run.currency);
end;
$$;

revoke all on function public.reserve_autonomous_media_spend(uuid) from public, anon, authenticated;
revoke all on function public.settle_autonomous_media_spend(uuid) from public, anon, authenticated;
revoke all on function public.release_autonomous_media_spend(uuid) from public, anon, authenticated;
grant execute on function public.reserve_autonomous_media_spend(uuid) to service_role;
grant execute on function public.settle_autonomous_media_spend(uuid) to service_role;
grant execute on function public.release_autonomous_media_spend(uuid) to service_role;

insert into public.agent_autonomy_policies (
  tenant_id, workspace_id, agent_key, autonomy_level, enabled, kill_switch,
  allowed_tool_classes, max_run_cost_usd, max_tool_calls, requires_human_approval_for, metadata
) values (
  'tenant_neejee', 'workspace_neejee', 'growth-executor', 4, true, false,
  '["read","draft_write","publish","external_mutation","spend","message"]'::jsonb,
  0.25, 20, '["payment","provider_config","legal"]'::jsonb,
  '{"mode":"prepaid_envelope","spend_source":"commercial_media_balance_accounts","provider_verification_required":true,"channel_readiness_required":true}'::jsonb
)
on conflict (tenant_id, workspace_id, agent_key) do update set
  autonomy_level=excluded.autonomy_level,
  enabled=excluded.enabled,
  allowed_tool_classes=excluded.allowed_tool_classes,
  max_tool_calls=excluded.max_tool_calls,
  requires_human_approval_for=excluded.requires_human_approval_for,
  metadata=excluded.metadata,
  updated_at=now();

insert into public.core_approval_policies (
  policy_id, tenant_id, scope_type, scope_ref, action_key,
  maker_checker_required, min_approvers, approval_mode, max_amount, max_delta_percent, policy, is_active
) values
  ('policy_neejee_auto_campaign_launch','tenant_neejee','workspace','workspace_neejee','campaign.launch',false,0,'any',null,null,'{"autonomous":true,"spend_source":"prepaid_media_balance","provider_verification_required":true}'::jsonb,true),
  ('policy_neejee_auto_social_publish','tenant_neejee','workspace','workspace_neejee','social.publish',false,0,'any',null,null,'{"autonomous":true,"provider_verification_required":true,"channel_readiness_required":true}'::jsonb,true),
  ('policy_neejee_auto_lifecycle_send','tenant_neejee','workspace','workspace_neejee','lifecycle.send',false,0,'any',null,null,'{"autonomous":true,"consent_required":true,"provider_verification_required":true}'::jsonb,true),
  ('policy_neejee_auto_report_publish','tenant_neejee','workspace','workspace_neejee','report.publish',false,0,'any',null,null,'{"autonomous":true,"verified_data_required":true}'::jsonb,true)
on conflict (policy_id) do update set
  maker_checker_required=excluded.maker_checker_required,
  min_approvers=excluded.min_approvers,
  approval_mode=excluded.approval_mode,
  policy=excluded.policy,
  is_active=excluded.is_active,
  updated_at=now();