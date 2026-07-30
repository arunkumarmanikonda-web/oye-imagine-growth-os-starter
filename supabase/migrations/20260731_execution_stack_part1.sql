begin;

create table if not exists public.content_plan_runs (
  plan_run_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_strategy_artifact_id text references public.strategy_artifacts(artifact_id) on delete set null,
  planning_window text not null default 'monthly' check (planning_window in ('weekly','monthly','quarterly')),
  funnel_goal text not null default 'awareness' check (funnel_goal in ('awareness','consideration','conversion','retention')),
  channel_mix jsonb not null default '[]'::jsonb,
  audience_segments jsonb not null default '[]'::jsonb,
  core_themes jsonb not null default '[]'::jsonb,
  content_items jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','scheduled','archived')),
  generated_by text,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.landing_page_drafts (
  landing_page_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_strategy_artifact_id text references public.strategy_artifacts(artifact_id) on delete set null,
  page_name text not null,
  target_url_slug text not null,
  funnel_stage text not null default 'conversion' check (funnel_stage in ('awareness','consideration','conversion','retention')),
  primary_offer text not null,
  hero jsonb not null default '{}'::jsonb,
  proof_points jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  cta jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','published','archived')),
  generated_by text,
  approved_by text,
  published_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_drafts (
  campaign_draft_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_strategy_artifact_id text references public.strategy_artifacts(artifact_id) on delete set null,
  platform text not null check (platform in ('google_ads','meta_ads','linkedin_ads')),
  objective text not null check (objective in ('traffic','lead_generation','sales','engagement','awareness')),
  budget_amount numeric(18,2) not null default 0 check (budget_amount >= 0),
  budget_currency text not null default 'INR',
  geo_targets jsonb not null default '[]'::jsonb,
  audience_definition jsonb not null default '{}'::jsonb,
  creative_brief jsonb not null default '{}'::jsonb,
  ad_sets jsonb not null default '[]'::jsonb,
  compliance_flags jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','approval_required','approved','exported','archived')),
  generated_by text,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_plan_runs_tenant_brand_created_at
  on public.content_plan_runs (tenant_id, brand_id, created_at desc);

create index if not exists idx_landing_page_drafts_tenant_brand_status
  on public.landing_page_drafts (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_campaign_drafts_tenant_brand_platform_status
  on public.campaign_drafts (tenant_id, brand_id, platform, status, created_at desc);

create or replace function public.tg_batch4a_set_updated_at()
returns trigger
language plpgsql
as $batch4a$
begin
  new.updated_at = now();
  return new;
end;
$batch4a$;

drop trigger if exists trg_content_plan_runs_updated_at on public.content_plan_runs;
create trigger trg_content_plan_runs_updated_at
before update on public.content_plan_runs
for each row execute function public.tg_batch4a_set_updated_at();

drop trigger if exists trg_landing_page_drafts_updated_at on public.landing_page_drafts;
create trigger trg_landing_page_drafts_updated_at
before update on public.landing_page_drafts
for each row execute function public.tg_batch4a_set_updated_at();

drop trigger if exists trg_campaign_drafts_updated_at on public.campaign_drafts;
create trigger trg_campaign_drafts_updated_at
before update on public.campaign_drafts
for each row execute function public.tg_batch4a_set_updated_at();

commit;