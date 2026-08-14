begin;

create table if not exists public.core_user_permission_overrides (
  override_id text primary key,
  user_id text not null,
  tenant_id text,
  brand_id text,
  workspace_id text,
  permission_key text not null,
  effect text not null check (effect in ('allow','deny')),
  status text not null default 'active' check (status in ('active','revoked','expired')),
  reason text not null,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  issued_by text not null,
  revoked_by text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (tenant_id is not null or (brand_id is null and workspace_id is null)),
  check (brand_id is null or tenant_id is not null),
  check (workspace_id is null or tenant_id is not null)
);

create table if not exists public.core_access_control_events (
  event_id bigint generated always as identity primary key,
  actor_user_id text not null,
  target_user_id text,
  action text not null check (action in (
    'user_created','user_updated','user_deleted','membership_created','membership_updated','membership_revoked',
    'role_created','role_updated','role_deleted','permission_allowed','permission_denied','permission_revoked',
    'password_reset_required','password_changed','account_suspended','account_reactivated'
  )),
  role_key text,
  permission_key text,
  tenant_id text,
  brand_id text,
  workspace_id text,
  reason text,
  before_state jsonb not null default '{}'::jsonb,
  after_state jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_permission_overrides_user_scope
  on public.core_user_permission_overrides(user_id, tenant_id, workspace_id, status, permission_key);
create index if not exists idx_permission_overrides_active
  on public.core_user_permission_overrides(user_id, status, valid_from, valid_until);
create index if not exists idx_access_events_target_time
  on public.core_access_control_events(target_user_id, created_at desc);

alter table public.core_user_permission_overrides enable row level security;
alter table public.core_access_control_events enable row level security;

revoke all on public.core_user_permission_overrides from anon, authenticated;
revoke all on public.core_access_control_events from anon, authenticated;
grant select on public.core_user_permission_overrides to authenticated;
grant all on public.core_user_permission_overrides to service_role;
grant all on public.core_access_control_events to service_role;
grant usage, select on all sequences in schema public to service_role;

-- A signed-in user may inspect only their own effective overrides. Mutations stay service-role only.
drop policy if exists core_user_permission_overrides_self_read on public.core_user_permission_overrides;
create policy core_user_permission_overrides_self_read
on public.core_user_permission_overrides
for select
to authenticated
using (
  user_id = auth.uid()::text
  and status = 'active'
  and valid_from <= now()
  and (valid_until is null or valid_until > now())
);

-- Role permissions are non-secret authorization metadata and may be read by authenticated users
-- so server-rendered navigation can compute effective rights without service-role exposure.
grant select on public.core_role_definitions to authenticated;
drop policy if exists core_role_definitions_authenticated_read on public.core_role_definitions;
create policy core_role_definitions_authenticated_read
on public.core_role_definitions
for select
to authenticated
using (true);

commit;
