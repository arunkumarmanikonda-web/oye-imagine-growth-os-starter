alter table if exists public.admin_audit_events
  add column if not exists actor_user_id uuid,
  add column if not exists actor_email text,
  add column if not exists tenant_id uuid,
  add column if not exists brand_id uuid,
  add column if not exists workspace_id uuid,
  add column if not exists payload jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admin_audit_events_tenant_id_fkey'
  ) then
    alter table public.admin_audit_events
      add constraint admin_audit_events_tenant_id_fkey
      foreign key (tenant_id) references public.tenants(id) on delete set null;
  end if;
exception when others then null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admin_audit_events_brand_id_fkey'
  ) then
    alter table public.admin_audit_events
      add constraint admin_audit_events_brand_id_fkey
      foreign key (brand_id) references public.brands(id) on delete set null;
  end if;
exception when others then null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admin_audit_events_workspace_id_fkey'
  ) then
    alter table public.admin_audit_events
      add constraint admin_audit_events_workspace_id_fkey
      foreign key (workspace_id) references public.workspaces(id) on delete set null;
  end if;
exception when others then null;
end $$;

create index if not exists idx_admin_audit_events_created_at
  on public.admin_audit_events(created_at desc);

create index if not exists idx_admin_audit_events_actor_user_id
  on public.admin_audit_events(actor_user_id);

create index if not exists idx_admin_audit_events_workspace_id
  on public.admin_audit_events(workspace_id);

create index if not exists idx_admin_audit_events_payload_gin
  on public.admin_audit_events using gin(payload);

create or replace function public.log_admin_audit_event(
  p_event text,
  p_actor_user_id uuid,
  p_actor_email text,
  p_tenant_id uuid default null,
  p_brand_id uuid default null,
  p_workspace_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := gen_random_uuid();
begin
  insert into public.admin_audit_events (
    id,
    event,
    actor_user_id,
    actor_email,
    tenant_id,
    brand_id,
    workspace_id,
    payload,
    created_at
  )
  values (
    v_id,
    p_event,
    p_actor_user_id,
    p_actor_email,
    p_tenant_id,
    p_brand_id,
    p_workspace_id,
    coalesce(p_payload, '{}'::jsonb),
    now()
  );

  return v_id;
end;

$$;

grant execute on function public.log_admin_audit_event(text, uuid, text, uuid, uuid, uuid, jsonb) to anon, authenticated, service_role;