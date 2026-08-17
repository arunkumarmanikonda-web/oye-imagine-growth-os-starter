begin;

create table if not exists public.analytics_kpi_runs (
  kpi_run_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  report_period_start date not null,
  report_period_end date not null,
  source text not null check (source in ('ga4','google_ads','meta_ads','crm','blended')),
  metrics jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','finalized','archived')),
  generated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_snapshots (
  report_snapshot_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_kpi_run_id text references public.analytics_kpi_runs(kpi_run_id) on delete set null,
  report_name text not null,
  audience text not null check (audience in ('client','internal','exec')),
  summary_cards jsonb not null default '[]'::jsonb,
  narrative text not null default '',
  top_insights jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','published','archived')),
  generated_by text,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.optimization_recommendations (
  optimization_recommendation_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_kpi_run_id text references public.analytics_kpi_runs(kpi_run_id) on delete set null,
  channel text not null,
  priority text not null check (priority in ('low','medium','high')),
  recommendation_type text not null,
  rationale text not null,
  expected_impact text not null,
  owner text,
  status text not null default 'open' check (status in ('open','approved','in_progress','completed','dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_analytics_kpi_runs_tenant_brand_period
  on public.analytics_kpi_runs (tenant_id, brand_id, report_period_end desc, status);

create index if not exists idx_report_snapshots_tenant_brand_status
  on public.report_snapshots (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_optimization_recommendations_tenant_brand_status
  on public.optimization_recommendations (tenant_id, brand_id, status, priority, created_at desc);

create or replace function public.tg_batch5a_set_updated_at()
returns trigger
language plpgsql
as $batch5a$
begin
  new.updated_at = now();
  return new;
end;
$batch5a$;

drop trigger if exists trg_analytics_kpi_runs_updated_at on public.analytics_kpi_runs;
create trigger trg_analytics_kpi_runs_updated_at
before update on public.analytics_kpi_runs
for each row execute function public.tg_batch5a_set_updated_at();

drop trigger if exists trg_report_snapshots_updated_at on public.report_snapshots;
create trigger trg_report_snapshots_updated_at
before update on public.report_snapshots
for each row execute function public.tg_batch5a_set_updated_at();

drop trigger if exists trg_optimization_recommendations_updated_at on public.optimization_recommendations;
create trigger trg_optimization_recommendations_updated_at
before update on public.optimization_recommendations
for each row execute function public.tg_batch5a_set_updated_at();

commit;