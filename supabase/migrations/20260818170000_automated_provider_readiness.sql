create table if not exists public.provider_qa_runs (
  qa_run_id uuid primary key default pg_catalog.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid references public.integration_accounts(id) on delete set null,
  provider text not null check (provider in ('google','meta','linkedin')),
  channel text not null check (channel in ('google_ads','facebook','instagram','linkedin','youtube')),
  external_resource_id text,
  status text not null default 'running' check (status in ('running','passed','blocked','failed')),
  checks jsonb not null default '[]'::jsonb check (jsonb_typeof(checks) = 'array'),
  blockers jsonb not null default '[]'::jsonb check (jsonb_typeof(blockers) = 'array'),
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  checked_at timestamptz not null default now(),
  valid_until timestamptz,
  completed_at timestamptz,
  created_by text not null default 'machine',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_qa_runs_workspace_channel_idx
  on public.provider_qa_runs (tenant_id, workspace_id, channel, checked_at desc);
create index if not exists provider_qa_runs_account_idx
  on public.provider_qa_runs (account_id, checked_at desc)
  where account_id is not null;

alter table public.provider_qa_runs enable row level security;
revoke all on public.provider_qa_runs from public, anon, authenticated;
revoke truncate, references, trigger on public.provider_qa_runs from service_role;
grant select, insert, update, delete on public.provider_qa_runs to service_role;

create table if not exists public.provider_channel_readiness (
  readiness_id uuid primary key default pg_catalog.gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid not null references public.integration_accounts(id) on delete cascade,
  provider text not null check (provider in ('google','meta','linkedin')),
  channel text not null check (channel in ('google_ads','facebook','instagram','linkedin','youtube')),
  external_resource_id text not null,
  state text not null check (state in ('connected','authority_verified','capabilities_verified','ready','degraded','expired','revoked')),
  qa_run_id uuid references public.provider_qa_runs(qa_run_id) on delete set null,
  blockers jsonb not null default '[]'::jsonb check (jsonb_typeof(blockers) = 'array'),
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  checked_at timestamptz not null,
  valid_until timestamptz not null,
  last_canary_at timestamptz,
  last_canary_resource_id text,
  source text not null default 'machine' check (source = 'machine'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, workspace_id, channel)
);

create index if not exists provider_channel_readiness_state_idx
  on public.provider_channel_readiness (tenant_id, workspace_id, state, valid_until);
create index if not exists provider_channel_readiness_account_idx
  on public.provider_channel_readiness (account_id, channel);

alter table public.provider_channel_readiness enable row level security;
revoke all on public.provider_channel_readiness from public, anon, authenticated;
revoke truncate, references, trigger on public.provider_channel_readiness from service_role;
grant select, insert, update, delete on public.provider_channel_readiness to service_role;
