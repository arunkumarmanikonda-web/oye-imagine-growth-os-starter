create table if not exists public.provider_config_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  brand_name text not null,
  provider_key text not null,
  status text not null default 'draft',
  configured_keys jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.provider_secret_material (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references public.provider_config_profiles(id) on delete cascade,
  secret_key text not null,
  encrypted_value text not null,
  masked_value text not null,
  rotation_version integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.config_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  provider_key text not null,
  target text not null,
  status text not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  last_error text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_provider_config_profiles_tenant_provider
  on public.provider_config_profiles (tenant_key, provider_key, created_at desc);

create unique index if not exists uq_provider_secret_material_profile_key
  on public.provider_secret_material (provider_profile_id, secret_key);

create index if not exists idx_config_sync_jobs_tenant_provider_target
  on public.config_sync_jobs (tenant_key, provider_key, target, status);