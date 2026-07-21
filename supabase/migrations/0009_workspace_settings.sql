create extension if not exists pgcrypto;

create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  created_by_user_id uuid,
  created_by_email text,
  updated_by_user_id uuid,
  updated_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_settings_key_length check (char_length(key) between 1 and 120),
  constraint workspace_settings_workspace_key_unique unique (workspace_id, key)
);

create index if not exists idx_workspace_settings_workspace_updated
  on public.workspace_settings (workspace_id, updated_at desc);

create index if not exists idx_workspace_settings_tenant_workspace
  on public.workspace_settings (tenant_id, workspace_id);

create or replace function public.tg_workspace_settings_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;

$$;

drop trigger if exists trg_workspace_settings_set_updated_at on public.workspace_settings;

create trigger trg_workspace_settings_set_updated_at
before update on public.workspace_settings
for each row
execute function public.tg_workspace_settings_set_updated_at();

alter table public.workspace_settings enable row level security;