create table if not exists public.execution_landing_page_publications (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  locale text not null default 'en-IN',
  page_slug text not null,
  publication_status text not null,
  qa_passed boolean not null default false,
  approval_required boolean not null default true,
  approval_granted boolean not null default false,
  asset_bundle jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.execution_campaign_packages (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  channel text not null,
  objective text not null,
  asset_count integer not null default 0,
  copy_variants jsonb not null default '[]'::jsonb,
  targeting_summary jsonb not null default '{}'::jsonb,
  package_status text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.execution_channel_publish_readiness (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  channel text not null,
  qa_status text not null,
  blockers jsonb not null default '[]'::jsonb,
  next_action text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.execution_approval_bound_decisions (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  channel text not null,
  decision text not null,
  requires_approval boolean not null default true,
  approval_granted boolean not null default false,
  spend_guardrail_status text not null,
  blockers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.execution_proof_packages (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  channel text not null,
  package_status text not null,
  included_assets jsonb not null default '[]'::jsonb,
  included_checks jsonb not null default '[]'::jsonb,
  destination_urls jsonb not null default '[]'::jsonb,
  missing_elements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_execution_landing_page_publications_brand
  on public.execution_landing_page_publications (brand_name, created_at desc);

create index if not exists idx_execution_campaign_packages_brand
  on public.execution_campaign_packages (brand_name, channel, created_at desc);

create index if not exists idx_execution_channel_publish_readiness_brand
  on public.execution_channel_publish_readiness (brand_name, channel, created_at desc);

create index if not exists idx_execution_approval_bound_decisions_brand
  on public.execution_approval_bound_decisions (brand_name, channel, created_at desc);

create index if not exists idx_execution_proof_packages_brand
  on public.execution_proof_packages (brand_name, channel, created_at desc);