begin;

create table if not exists public.seo_briefs (
  seo_brief_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_strategy_artifact_id text references public.strategy_artifacts(artifact_id) on delete set null,
  source_content_plan_run_id text references public.content_plan_runs(plan_run_id) on delete set null,
  brief_name text not null,
  primary_keyword text not null,
  supporting_keywords jsonb not null default '[]'::jsonb,
  title_options jsonb not null default '[]'::jsonb,
  meta_description text not null default '',
  heading_outline jsonb not null default '[]'::jsonb,
  internal_links jsonb not null default '[]'::jsonb,
  schema_recommendations jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','implemented','archived')),
  generated_by text,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_calendar_entries (
  social_calendar_entry_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_content_plan_run_id text references public.content_plan_runs(plan_run_id) on delete set null,
  channel text not null check (channel in ('instagram','facebook','linkedin','youtube','email')),
  format text not null check (format in ('static','carousel','reel','story','email')),
  pillar text not null,
  publish_on date not null,
  caption_hook text not null,
  primary_cta text not null,
  asset_brief jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','scheduled','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creative_asset_drafts (
  creative_asset_draft_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_campaign_draft_id text references public.campaign_drafts(campaign_draft_id) on delete set null,
  platform text not null,
  objective text not null,
  assets jsonb not null default '[]'::jsonb,
  compliance_flags jsonb not null default '[]'::jsonb,
  disclaimer text,
  status text not null default 'draft' check (status in ('draft','approval_required','approved','exported','archived')),
  generated_by text,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_seo_briefs_tenant_brand_status
  on public.seo_briefs (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_social_calendar_entries_tenant_brand_publish_on
  on public.social_calendar_entries (tenant_id, brand_id, publish_on, status);

create index if not exists idx_creative_asset_drafts_tenant_brand_status
  on public.creative_asset_drafts (tenant_id, brand_id, status, created_at desc);

create or replace function public.tg_batch4b_set_updated_at()
returns trigger
language plpgsql
as $batch4b$
begin
  new.updated_at = now();
  return new;
end;
$batch4b$;

drop trigger if exists trg_seo_briefs_updated_at on public.seo_briefs;
create trigger trg_seo_briefs_updated_at
before update on public.seo_briefs
for each row execute function public.tg_batch4b_set_updated_at();

drop trigger if exists trg_social_calendar_entries_updated_at on public.social_calendar_entries;
create trigger trg_social_calendar_entries_updated_at
before update on public.social_calendar_entries
for each row execute function public.tg_batch4b_set_updated_at();

drop trigger if exists trg_creative_asset_drafts_updated_at on public.creative_asset_drafts;
create trigger trg_creative_asset_drafts_updated_at
before update on public.creative_asset_drafts
for each row execute function public.tg_batch4b_set_updated_at();

commit;