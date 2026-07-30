create table if not exists public.reporting_delivery_centers (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  delivery_status text not null,
  recipient_count integer not null default 0,
  blockers jsonb not null default '[]'::jsonb,
  artifact_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.launch_readiness_dashboards (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  overall_status text not null,
  blocker_count integer not null default 0,
  risk_level text not null,
  next_action text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_support_handoffs (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  handoff_status text not null,
  missing_elements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_dependency_signoffs (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  clear_to_launch boolean not null default false,
  unresolved_dependencies jsonb not null default '[]'::jsonb,
  blocking_dependencies jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_hardening_evidence (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  evidence_status text not null,
  missing_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_reporting_delivery_centers_brand
  on public.reporting_delivery_centers (brand_name, created_at desc);

create index if not exists idx_launch_readiness_dashboards_brand
  on public.launch_readiness_dashboards (brand_name, created_at desc);

create index if not exists idx_ops_support_handoffs_brand
  on public.ops_support_handoffs (brand_name, created_at desc);

create index if not exists idx_ops_dependency_signoffs_brand
  on public.ops_dependency_signoffs (brand_name, created_at desc);

create index if not exists idx_ops_hardening_evidence_brand
  on public.ops_hardening_evidence (brand_name, created_at desc);