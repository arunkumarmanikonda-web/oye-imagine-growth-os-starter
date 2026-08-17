begin;

create table if not exists public.search_optimization_briefs (
  search_optimization_brief_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  target_surface text not null
    check (target_surface in ('seo','aeo','geo','ai_search')),
  brief_name text not null,
  primary_query text not null,
  supporting_queries jsonb not null default '[]'::jsonb,
  answer_entities jsonb not null default '[]'::jsonb,
  schema_recommendations jsonb not null default '[]'::jsonb,
  brief jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','approved','implemented','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.channel_qa_reports (
  channel_qa_report_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  channel text not null,
  target_asset_type text not null,
  checks jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  passed boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft','approved','resolved','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publish_guardrail_decisions (
  publish_guardrail_decision_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  channel text not null,
  requested_action text not null
    check (requested_action in ('draft','export','publish')),
  decision text not null
    check (decision in ('draft_only','export_only','approval_required','publish_allowed','blocked')),
  reasons jsonb not null default '[]'::jsonb,
  requires_approval boolean not null default true,
  estimated_spend numeric(18,2) not null default 0,
  status text not null default 'draft'
    check (status in ('draft','approved','executed','blocked','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proof_execution_assets (
  proof_execution_asset_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  asset_type text not null
    check (asset_type in ('landing_page','seo_cluster','social_calendar','creative_set','campaign_draft')),
  title text not null,
  manifest jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','approved','delivered','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_search_optimization_briefs_tenant_brand_created_at
  on public.search_optimization_briefs (tenant_id, brand_id, created_at desc);

create index if not exists idx_channel_qa_reports_tenant_brand_status
  on public.channel_qa_reports (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_publish_guardrail_decisions_tenant_brand_status
  on public.publish_guardrail_decisions (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_proof_execution_assets_tenant_brand_status
  on public.proof_execution_assets (tenant_id, brand_id, status, created_at desc);

create or replace function public.tg_batch4_governance_set_updated_at()
returns trigger
language plpgsql
as $batch4$
begin
  new.updated_at = now();
  return new;
end;
$batch4$;

drop trigger if exists trg_search_optimization_briefs_updated_at on public.search_optimization_briefs;
create trigger trg_search_optimization_briefs_updated_at
before update on public.search_optimization_briefs
for each row execute function public.tg_batch4_governance_set_updated_at();

drop trigger if exists trg_channel_qa_reports_updated_at on public.channel_qa_reports;
create trigger trg_channel_qa_reports_updated_at
before update on public.channel_qa_reports
for each row execute function public.tg_batch4_governance_set_updated_at();

drop trigger if exists trg_publish_guardrail_decisions_updated_at on public.publish_guardrail_decisions;
create trigger trg_publish_guardrail_decisions_updated_at
before update on public.publish_guardrail_decisions
for each row execute function public.tg_batch4_governance_set_updated_at();

drop trigger if exists trg_proof_execution_assets_updated_at on public.proof_execution_assets;
create trigger trg_proof_execution_assets_updated_at
before update on public.proof_execution_assets
for each row execute function public.tg_batch4_governance_set_updated_at();

commit;