create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  actor_email text null,
  action text not null,
  target_type text not null,
  target_id text null,
  tenant_id uuid null references public.tenants(id) on delete set null,
  brand_id uuid null references public.brands(id) on delete set null,
  workspace_id uuid null references public.workspaces(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_events_actor_user_id on public.admin_audit_events(actor_user_id);
create index if not exists idx_admin_audit_events_tenant_id on public.admin_audit_events(tenant_id);
create index if not exists idx_admin_audit_events_workspace_id on public.admin_audit_events(workspace_id);
create index if not exists idx_admin_audit_events_created_at on public.admin_audit_events(created_at desc);

alter table public.admin_audit_events enable row level security;

drop policy if exists admin_audit_events_deny_all on public.admin_audit_events;
create policy admin_audit_events_deny_all
on public.admin_audit_events
for all
to public
using (false)
with check (false);