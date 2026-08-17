create table if not exists public.pilot_tenant_configurations (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null unique,
  brand_name text not null,
  workspace_slug text not null,
  region text not null default 'IN',
  default_currency text not null default 'INR',
  approvals_enabled boolean not null default true,
  subscription_enabled boolean not null default false,
  invoice_enabled boolean not null default false,
  audit_enabled boolean not null default true,
  competitor_tracking_enabled boolean not null default true,
  activation_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pilot_website_audit_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  brand_name text not null,
  pages_scanned integer not null default 0,
  healthy_pages integer not null default 0,
  blocked_pages integer not null default 0,
  analytics_coverage numeric(5,2) not null default 0,
  conversion_ready_pages integer not null default 0,
  priority_fixes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pilot_competitor_landscapes (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  brand_name text not null,
  strongest_competitors jsonb not null default '[]'::jsonb,
  parity_gaps jsonb not null default '[]'::jsonb,
  white_space jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pilot_commercial_activation_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  brand_name text not null,
  status text not null,
  blockers jsonb not null default '[]'::jsonb,
  next_action text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pilot_state_transitions (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null,
  current_stage text not null,
  next_stage text not null,
  can_advance boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_pilot_tenant_configurations_tenant_key
  on public.pilot_tenant_configurations (tenant_key);

create index if not exists idx_pilot_website_audit_runs_tenant_key
  on public.pilot_website_audit_runs (tenant_key, created_at desc);

create index if not exists idx_pilot_competitor_landscapes_tenant_key
  on public.pilot_competitor_landscapes (tenant_key, created_at desc);

create index if not exists idx_pilot_commercial_activation_checks_tenant_key
  on public.pilot_commercial_activation_checks (tenant_key, created_at desc);

create index if not exists idx_pilot_state_transitions_tenant_key
  on public.pilot_state_transitions (tenant_key, created_at desc);