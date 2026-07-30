create table if not exists public.external_provider_credentials (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  provider_key text not null,
  credentials_present boolean not null default false,
  app_review_approved boolean not null default false,
  business_verified boolean not null default false,
  live_account_connected boolean not null default false,
  webhook_configured boolean not null default false,
  callback_verified boolean not null default false,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tenant_activation_readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  brand_name text not null,
  overall_status text not null,
  blocker_count integer not null default 0,
  blockers jsonb not null default '[]'::jsonb,
  external_dependencies jsonb not null default '[]'::jsonb,
  next_action text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deployment_verification_runs (
  id uuid primary key default gen_random_uuid(),
  environment text not null,
  vercel_deployment_passed boolean not null default false,
  workspace_branding_smoke_passed boolean not null default false,
  validation_passed boolean not null default false,
  failed_systems jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.external_dependency_register (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  provider_key text not null,
  dependency_type text not null,
  status text not null,
  owner text not null,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_external_provider_credentials_tenant_provider
  on public.external_provider_credentials (tenant_key, provider_key);

create index if not exists idx_tenant_activation_readiness_snapshots_tenant
  on public.tenant_activation_readiness_snapshots (tenant_key, created_at desc);

create index if not exists idx_deployment_verification_runs_environment
  on public.deployment_verification_runs (environment, created_at desc);

create index if not exists idx_external_dependency_register_tenant_provider
  on public.external_dependency_register (tenant_key, provider_key, status);