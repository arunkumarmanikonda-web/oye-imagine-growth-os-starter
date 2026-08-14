begin;

create table if not exists public.core_privileged_override_events (
  override_id text primary key,
  tenant_id text,
  workspace_id text,
  action_key text not null,
  target_type text not null,
  target_id text not null,
  reason_code text not null,
  reason_detail text not null,
  actor_user_id text not null,
  actor_role_key text not null,
  assurance_level text not null check (assurance_level in ('aal2')),
  previous_state jsonb not null default '{}'::jsonb,
  resulting_state jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_privileged_override_scope
  on public.core_privileged_override_events(tenant_id, workspace_id, created_at desc);
create index if not exists idx_privileged_override_action
  on public.core_privileged_override_events(action_key, created_at desc);

alter table public.core_privileged_override_events enable row level security;
revoke all on public.core_privileged_override_events from anon, authenticated;
grant all on public.core_privileged_override_events to service_role;

commit;
