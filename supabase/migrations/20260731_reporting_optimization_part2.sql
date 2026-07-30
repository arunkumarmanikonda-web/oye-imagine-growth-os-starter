begin;

create table if not exists public.admin_health_checks (
  admin_health_check_id text primary key,
  component text not null,
  environment text not null default 'production' check (environment in ('local','staging','production')),
  status text not null check (status in ('healthy','degraded','down')),
  severity text not null check (severity in ('info','warning','critical')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.tenant_usage_snapshots (
  tenant_usage_snapshot_id text primary key,
  tenant_id text not null,
  brand_id text references public.core_brands(brand_id) on delete set null,
  workspace_id text references public.core_workspaces(workspace_id) on delete set null,
  snapshot_period text not null,
  ai_tokens_used bigint not null default 0,
  ai_cost_amount numeric(18,4) not null default 0,
  content_items_generated integer not null default 0,
  campaigns_exported integer not null default 0,
  reports_generated integer not null default 0,
  quota_limit jsonb not null default '{}'::jsonb,
  overage_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.launch_readiness_reviews (
  launch_readiness_review_id text primary key,
  review_scope text not null check (review_scope in ('platform','tenant','feature_release')),
  target_id text not null,
  category text not null,
  check_name text not null,
  status text not null check (status in ('pending','pass','fail','waived')),
  owner text,
  notes text,
  evidence_ref text,
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_health_checks_component_detected_at
  on public.admin_health_checks (component, detected_at desc);

create index if not exists idx_tenant_usage_snapshots_tenant_period
  on public.tenant_usage_snapshots (tenant_id, snapshot_period desc);

create index if not exists idx_launch_readiness_reviews_target_status
  on public.launch_readiness_reviews (review_scope, target_id, status, category);

create or replace function public.tg_batch5b_set_updated_at()
returns trigger
language plpgsql
as $batch5b$
begin
  new.updated_at = now();
  return new;
end;
$batch5b$;

drop trigger if exists trg_tenant_usage_snapshots_updated_at on public.tenant_usage_snapshots;
create trigger trg_tenant_usage_snapshots_updated_at
before update on public.tenant_usage_snapshots
for each row execute function public.tg_batch5b_set_updated_at();

drop trigger if exists trg_launch_readiness_reviews_updated_at on public.launch_readiness_reviews;
create trigger trg_launch_readiness_reviews_updated_at
before update on public.launch_readiness_reviews
for each row execute function public.tg_batch5b_set_updated_at();

commit;