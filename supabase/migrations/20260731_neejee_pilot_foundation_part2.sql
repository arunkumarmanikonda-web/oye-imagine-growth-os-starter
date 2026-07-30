begin;

create table if not exists public.website_audit_runs (
  audit_run_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_url text not null,
  crawl_status text not null default 'completed' check (crawl_status in ('queued','running','completed','failed')),
  pages_crawled integer not null default 0 check (pages_crawled >= 0),
  broken_links integer not null default 0 check (broken_links >= 0),
  duplicate_pages integer not null default 0 check (duplicate_pages >= 0),
  missing_meta_pages integer not null default 0 check (missing_meta_pages >= 0),
  cwv_status text not null default 'unknown' check (cwv_status in ('good','needs_improvement','poor','unknown')),
  tracking_coverage_percent integer not null default 0 check (tracking_coverage_percent between 0 and 100),
  conversion_path_count integer not null default 0 check (conversion_path_count >= 0),
  findings jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitor_snapshots (
  snapshot_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  competitor_name text not null,
  competitor_domain text,
  relationship_type text not null default 'direct' check (relationship_type in ('direct','indirect','aspirational')),
  channel_strength jsonb not null default '{}'::jsonb,
  pricing_signal text,
  positioning_summary text,
  observed_offers jsonb not null default '[]'::jsonb,
  whitespace_opportunities jsonb not null default '[]'::jsonb,
  threat_score integer not null default 0 check (threat_score between 0 and 100),
  source_notes jsonb not null default '[]'::jsonb,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_activation_checklists (
  checklist_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  intake_id text references public.onboarding_intakes(intake_id) on delete cascade,
  checklist_items jsonb not null default '[]'::jsonb,
  completed_items integer not null default 0 check (completed_items >= 0),
  total_items integer not null default 0 check (total_items >= 0),
  readiness_percent integer not null default 0 check (readiness_percent between 0 and 100),
  status text not null default 'draft' check (status in ('draft','in_progress','ready','blocked')),
  blockers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_website_audit_runs_tenant_brand_created_at
  on public.website_audit_runs (tenant_id, brand_id, created_at desc);

create index if not exists idx_competitor_snapshots_tenant_brand_threat_score
  on public.competitor_snapshots (tenant_id, brand_id, threat_score desc, created_at desc);

create index if not exists idx_onboarding_activation_checklists_tenant_brand_status
  on public.onboarding_activation_checklists (tenant_id, brand_id, status, updated_at desc);

create or replace function public.tg_batch3b_set_updated_at()
returns trigger
language plpgsql
as $batch3b$
begin
  new.updated_at = now();
  return new;
end;
$batch3b$;

drop trigger if exists trg_website_audit_runs_updated_at on public.website_audit_runs;
create trigger trg_website_audit_runs_updated_at
before update on public.website_audit_runs
for each row execute function public.tg_batch3b_set_updated_at();

drop trigger if exists trg_competitor_snapshots_updated_at on public.competitor_snapshots;
create trigger trg_competitor_snapshots_updated_at
before update on public.competitor_snapshots
for each row execute function public.tg_batch3b_set_updated_at();

drop trigger if exists trg_onboarding_activation_checklists_updated_at on public.onboarding_activation_checklists;
create trigger trg_onboarding_activation_checklists_updated_at
before update on public.onboarding_activation_checklists
for each row execute function public.tg_batch3b_set_updated_at();

commit;