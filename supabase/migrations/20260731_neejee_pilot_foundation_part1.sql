begin;

create table if not exists public.core_brands (
  brand_id text primary key,
  tenant_id text not null,
  display_name text not null,
  legal_entity_name text,
  website_url text,
  default_locale text not null default 'en-IN',
  default_currency text not null default 'INR',
  status text not null default 'active' check (status in ('draft','active','suspended','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, display_name)
);

create table if not exists public.core_workspaces (
  workspace_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  business_group text,
  geography_code text,
  language_code text not null default 'en',
  currency_code text not null default 'INR',
  autonomy_level smallint not null default 1 check (autonomy_level between 0 and 4),
  status text not null default 'active' check (status in ('draft','active','paused','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_intakes (
  intake_id text primary key,
  tenant_id text not null,
  brand_id text references public.core_brands(brand_id) on delete set null,
  workspace_id text references public.core_workspaces(workspace_id) on delete set null,
  company_name text not null,
  legal_name text,
  website_url text,
  industry text,
  countries_served jsonb not null default '[]'::jsonb,
  services_requested jsonb not null default '[]'::jsonb,
  autonomy_level smallint not null default 1 check (autonomy_level between 0 and 4),
  billing_currency text not null default 'INR',
  status text not null default 'draft' check (status in ('draft','submitted','reviewing','approved','rejected','activated')),
  intake_payload jsonb not null default '{}'::jsonb,
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_profiles (
  profile_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  brand_purpose text,
  brand_story text,
  value_proposition text,
  tone_of_voice text,
  approved_terms jsonb not null default '[]'::jsonb,
  prohibited_terms jsonb not null default '[]'::jsonb,
  audience_personas jsonb not null default '[]'::jsonb,
  product_categories jsonb not null default '[]'::jsonb,
  geography_notes jsonb not null default '[]'::jsonb,
  compliance_notes jsonb not null default '[]'::jsonb,
  visual_guidelines jsonb not null default '{}'::jsonb,
  profile_status text not null default 'draft' check (profile_status in ('draft','review','approved','archived')),
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, brand_id)
);

create table if not exists public.strategy_artifacts (
  artifact_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  intake_id text references public.onboarding_intakes(intake_id) on delete set null,
  artifact_type text not null check (artifact_type in ('strategy_deck','audit_report','content_plan','media_plan','executive_summary')),
  title text not null,
  status text not null default 'draft' check (status in ('draft','review','approved','published','archived')),
  version integer not null default 1 check (version >= 1),
  summary jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  generated_by text,
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_core_brands_tenant_status_updated_at
  on public.core_brands (tenant_id, status, updated_at desc);

create index if not exists idx_core_workspaces_tenant_brand_status_updated_at
  on public.core_workspaces (tenant_id, brand_id, status, updated_at desc);

create index if not exists idx_onboarding_intakes_tenant_status_updated_at
  on public.onboarding_intakes (tenant_id, status, updated_at desc);

create index if not exists idx_brand_profiles_tenant_brand_status_updated_at
  on public.brand_profiles (tenant_id, brand_id, profile_status, updated_at desc);

create index if not exists idx_strategy_artifacts_tenant_brand_status_updated_at
  on public.strategy_artifacts (tenant_id, brand_id, status, updated_at desc);

create or replace function public.tg_batch3_set_updated_at()
returns trigger
language plpgsql
as $batch3$
begin
  new.updated_at = now();
  return new;
end;
$batch3$;

drop trigger if exists trg_core_brands_updated_at on public.core_brands;
create trigger trg_core_brands_updated_at
before update on public.core_brands
for each row execute function public.tg_batch3_set_updated_at();

drop trigger if exists trg_core_workspaces_updated_at on public.core_workspaces;
create trigger trg_core_workspaces_updated_at
before update on public.core_workspaces
for each row execute function public.tg_batch3_set_updated_at();

drop trigger if exists trg_onboarding_intakes_updated_at on public.onboarding_intakes;
create trigger trg_onboarding_intakes_updated_at
before update on public.onboarding_intakes
for each row execute function public.tg_batch3_set_updated_at();

drop trigger if exists trg_brand_profiles_updated_at on public.brand_profiles;
create trigger trg_brand_profiles_updated_at
before update on public.brand_profiles
for each row execute function public.tg_batch3_set_updated_at();

drop trigger if exists trg_strategy_artifacts_updated_at on public.strategy_artifacts;
create trigger trg_strategy_artifacts_updated_at
before update on public.strategy_artifacts
for each row execute function public.tg_batch3_set_updated_at();

commit;