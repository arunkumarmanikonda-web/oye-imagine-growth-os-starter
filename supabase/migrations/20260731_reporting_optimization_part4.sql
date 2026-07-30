begin;

create table if not exists public.persona_dashboard_snapshots (
  persona_dashboard_snapshot_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  persona text not null
    check (persona in ('client','internal','exec','operator','super_admin')),
  title text not null,
  cards jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_publication_jobs (
  report_publication_job_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  report_name text not null,
  audience text not null
    check (audience in ('client','internal','exec')),
  format text not null
    check (format in ('web','pdf','pptx','xlsx')),
  decision text not null
    check (decision in ('ready','approval_required','blocked')),
  blocked_reasons jsonb not null default '[]'::jsonb,
  status text not null default 'planned'
    check (status in ('planned','approved','published','blocked','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.optimization_escalations (
  optimization_escalation_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  channel text not null,
  severity text not null
    check (severity in ('low','medium','high','critical')),
  owner_role text not null,
  escalation_reason text not null,
  due_hours integer not null default 24,
  status text not null default 'open'
    check (status in ('open','acknowledged','resolved','dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.super_admin_operational_snapshots (
  super_admin_operational_snapshot_id text primary key,
  environment text not null
    check (environment in ('local','staging','production')),
  overall_health text not null
    check (overall_health in ('healthy','degraded','critical')),
  alerts jsonb not null default '[]'::jsonb,
  action_items jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.managed_service_workspace_snapshots (
  managed_service_workspace_snapshot_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  queue_summary jsonb not null default '{}'::jsonb,
  next_best_action text not null,
  owner_role text not null,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_persona_dashboard_snapshots_tenant_brand_status
  on public.persona_dashboard_snapshots (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_report_publication_jobs_tenant_brand_status
  on public.report_publication_jobs (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_optimization_escalations_tenant_brand_status
  on public.optimization_escalations (tenant_id, brand_id, status, severity, created_at desc);

create index if not exists idx_super_admin_operational_snapshots_env_status
  on public.super_admin_operational_snapshots (environment, status, created_at desc);

create index if not exists idx_managed_service_workspace_snapshots_tenant_brand_status
  on public.managed_service_workspace_snapshots (tenant_id, brand_id, status, created_at desc);

create or replace function public.tg_batch5_closeout_set_updated_at()
returns trigger
language plpgsql
as $batch5closeout$
begin
  new.updated_at = now();
  return new;
end;
$batch5closeout$;

drop trigger if exists trg_persona_dashboard_snapshots_updated_at on public.persona_dashboard_snapshots;
create trigger trg_persona_dashboard_snapshots_updated_at
before update on public.persona_dashboard_snapshots
for each row execute function public.tg_batch5_closeout_set_updated_at();

drop trigger if exists trg_report_publication_jobs_updated_at on public.report_publication_jobs;
create trigger trg_report_publication_jobs_updated_at
before update on public.report_publication_jobs
for each row execute function public.tg_batch5_closeout_set_updated_at();

drop trigger if exists trg_optimization_escalations_updated_at on public.optimization_escalations;
create trigger trg_optimization_escalations_updated_at
before update on public.optimization_escalations
for each row execute function public.tg_batch5_closeout_set_updated_at();

drop trigger if exists trg_super_admin_operational_snapshots_updated_at on public.super_admin_operational_snapshots;
create trigger trg_super_admin_operational_snapshots_updated_at
before update on public.super_admin_operational_snapshots
for each row execute function public.tg_batch5_closeout_set_updated_at();

drop trigger if exists trg_managed_service_workspace_snapshots_updated_at on public.managed_service_workspace_snapshots;
create trigger trg_managed_service_workspace_snapshots_updated_at
before update on public.managed_service_workspace_snapshots
for each row execute function public.tg_batch5_closeout_set_updated_at();

commit;