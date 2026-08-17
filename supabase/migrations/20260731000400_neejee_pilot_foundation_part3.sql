begin;

create table if not exists public.strategy_presentation_manifests (
  presentation_manifest_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_strategy_artifact_id text references public.strategy_artifacts(artifact_id) on delete set null,
  deck_title text not null,
  objective text not null,
  sections jsonb not null default '[]'::jsonb,
  approval_status text not null default 'review_required'
    check (approval_status in ('draft','review_required','approved','presented','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_portal_snapshots (
  client_portal_snapshot_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  source_presentation_manifest_id text references public.strategy_presentation_manifests(presentation_manifest_id) on delete set null,
  source_strategy_artifact_id text references public.strategy_artifacts(artifact_id) on delete set null,
  phase text not null,
  summary jsonb not null default '{}'::jsonb,
  workflow_status jsonb not null default '{}'::jsonb,
  financial_overview jsonb not null default '{}'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operator_work_items (
  operator_work_item_id text primary key,
  tenant_id text not null,
  brand_id text not null references public.core_brands(brand_id) on delete cascade,
  workspace_id text references public.core_workspaces(workspace_id) on delete cascade,
  queue_type text not null
    check (queue_type in ('onboarding','strategy','legal','billing','approval','activation','support')),
  priority text not null
    check (priority in ('low','medium','high','critical')),
  title text not null,
  owner_role text not null,
  status text not null default 'open'
    check (status in ('open','in_progress','blocked','completed')),
  payload jsonb not null default '{}'::jsonb,
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_strategy_presentation_manifests_tenant_brand_created_at
  on public.strategy_presentation_manifests (tenant_id, brand_id, created_at desc);

create index if not exists idx_client_portal_snapshots_tenant_brand_status
  on public.client_portal_snapshots (tenant_id, brand_id, status, created_at desc);

create index if not exists idx_operator_work_items_tenant_brand_status
  on public.operator_work_items (tenant_id, brand_id, status, priority, created_at desc);

create or replace function public.tg_batch3_operating_set_updated_at()
returns trigger
language plpgsql
as $batch3$
begin
  new.updated_at = now();
  return new;
end;
$batch3$;

drop trigger if exists trg_strategy_presentation_manifests_updated_at on public.strategy_presentation_manifests;
create trigger trg_strategy_presentation_manifests_updated_at
before update on public.strategy_presentation_manifests
for each row execute function public.tg_batch3_operating_set_updated_at();

drop trigger if exists trg_client_portal_snapshots_updated_at on public.client_portal_snapshots;
create trigger trg_client_portal_snapshots_updated_at
before update on public.client_portal_snapshots
for each row execute function public.tg_batch3_operating_set_updated_at();

drop trigger if exists trg_operator_work_items_updated_at on public.operator_work_items;
create trigger trg_operator_work_items_updated_at
before update on public.operator_work_items
for each row execute function public.tg_batch3_operating_set_updated_at();

commit;