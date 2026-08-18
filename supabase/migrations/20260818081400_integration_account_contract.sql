alter table public.integration_accounts
  add column if not exists workspace_id uuid,
  add column if not exists account_name text,
  add column if not exists scopes jsonb not null default '[]'::jsonb,
  add column if not exists last_verified_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $do$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.integration_accounts'::regclass
      and conname = 'integration_accounts_workspace_id_fkey'
  ) then
    alter table public.integration_accounts
      add constraint integration_accounts_workspace_id_fkey
      foreign key (workspace_id) references public.workspaces(id) on delete set null;
  end if;
end
$do$;

create index if not exists integration_accounts_target_provider_idx
  on public.integration_accounts (tenant_id, workspace_id, provider, status, created_at desc);

alter table public.integration_secret_material
  drop constraint if exists integration_secret_material_secret_kind_check;

alter table public.integration_secret_material
  add constraint integration_secret_material_secret_kind_check
  check (secret_kind = any (array[
    'oauth_refresh_token'::text,
    'oauth_access_token'::text,
    'webhook_secret'::text,
    'api_secret_reference'::text
  ]));

alter table public.integration_accounts enable row level security;
alter table public.integration_secret_material enable row level security;

revoke all on public.integration_accounts from public, anon, authenticated;
revoke all on public.integration_secret_material from public, anon, authenticated;
revoke truncate, references, trigger on public.integration_accounts from service_role;
revoke truncate, references, trigger on public.integration_secret_material from service_role;
grant select, insert, update, delete on public.integration_accounts to service_role;
grant select, insert, update, delete on public.integration_secret_material to service_role;
