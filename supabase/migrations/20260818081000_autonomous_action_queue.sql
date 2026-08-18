create table if not exists public.autonomous_action_queue (
  queue_id uuid primary key default pg_catalog.gen_random_uuid(),
  tenant_id text not null,
  workspace_id text,
  action_key text not null,
  channel text not null,
  provider_key text,
  idempotency_key text not null,
  requested_amount numeric not null default 0 check (requested_amount >= 0),
  currency text not null default 'INR',
  payload jsonb not null default '{}'::jsonb,
  priority integer not null default 50 check (priority between 0 and 100),
  status text not null default 'pending' check (status in ('pending','claimed','completed','blocked','failed')),
  scheduled_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  run_id uuid references public.autonomous_execution_runs(run_id) on delete set null,
  last_error_code text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create index if not exists autonomous_action_queue_due_idx
  on public.autonomous_action_queue (status, scheduled_at, priority desc);
create index if not exists autonomous_action_queue_tenant_idx
  on public.autonomous_action_queue (tenant_id, created_at desc);

alter table public.autonomous_action_queue enable row level security;
revoke all on public.autonomous_action_queue from public, anon, authenticated;
grant select, insert, update on public.autonomous_action_queue to service_role;

create or replace function public.claim_autonomous_actions(p_limit integer default 10)
returns setof public.autonomous_action_queue
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  return query
  with due as (
    select q.queue_id
    from public.autonomous_action_queue q
    where q.status = 'pending'
      and q.scheduled_at <= now()
    order by q.priority desc, q.scheduled_at asc, q.created_at asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 10), 50))
  )
  update public.autonomous_action_queue q
     set status = 'claimed', claimed_at = now(), updated_at = now()
    from due
   where q.queue_id = due.queue_id
  returning q.*;
end;
$$;

create or replace function public.requeue_stale_autonomous_claims(p_stale_minutes integer default 15)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  update public.autonomous_action_queue
     set status='pending', claimed_at=null, last_error_code='stale_claim_requeued', updated_at=now()
   where status='claimed'
     and run_id is null
     and claimed_at < now() - make_interval(mins => greatest(5, least(coalesce(p_stale_minutes, 15), 120)));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.claim_autonomous_actions(integer) from public, anon, authenticated;
revoke all on function public.requeue_stale_autonomous_claims(integer) from public, anon, authenticated;
grant execute on function public.claim_autonomous_actions(integer) to service_role;
grant execute on function public.requeue_stale_autonomous_claims(integer) to service_role;
