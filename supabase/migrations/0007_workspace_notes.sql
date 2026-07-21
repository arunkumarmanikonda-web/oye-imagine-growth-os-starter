create extension if not exists pgcrypto;

create table if not exists public.workspace_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  body text not null default '',
  created_by_user_id uuid,
  created_by_email text,
  updated_by_user_id uuid,
  updated_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_notes_workspace_id
  on public.workspace_notes(workspace_id, updated_at desc);

create index if not exists idx_workspace_notes_tenant_id
  on public.workspace_notes(tenant_id);

create or replace function public.set_workspace_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;

$$;

drop trigger if exists trg_workspace_notes_updated_at on public.workspace_notes;

create trigger trg_workspace_notes_updated_at
before update on public.workspace_notes
for each row
execute function public.set_workspace_notes_updated_at();

alter table public.workspace_notes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspace_notes'
      and policyname = 'workspace_notes_service_role_all'
  ) then
    create policy workspace_notes_service_role_all
      on public.workspace_notes
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;