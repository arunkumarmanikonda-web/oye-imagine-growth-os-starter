create extension if not exists pgcrypto;

create table if not exists public.workspace_setting_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workspace_setting_id uuid references public.workspace_settings(id) on delete set null,
  key text not null,
  action text not null,
  value jsonb not null default '{}'::jsonb,
  actor_user_id uuid,
  actor_email text,
  created_at timestamptz not null default now(),
  constraint workspace_setting_versions_action_check check (action in ('created','updated','deleted'))
);

create index if not exists idx_workspace_setting_versions_workspace_created
  on public.workspace_setting_versions (workspace_id, created_at desc);

create index if not exists idx_workspace_setting_versions_setting_created
  on public.workspace_setting_versions (workspace_setting_id, created_at desc);

create index if not exists idx_workspace_setting_versions_key_created
  on public.workspace_setting_versions (workspace_id, key, created_at desc);

alter table public.workspace_setting_versions enable row level security;