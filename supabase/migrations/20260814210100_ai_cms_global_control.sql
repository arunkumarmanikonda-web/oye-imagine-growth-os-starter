begin;

create table if not exists public.cms_content_nodes (
  node_id text primary key,
  scope_type text not null check (scope_type in ('platform','tenant','workspace')),
  tenant_id text,
  workspace_id text,
  route_key text not null,
  surface_key text not null,
  slot_key text not null,
  content_type text not null check (content_type in ('text','rich_text','image','video','link','cta','json')),
  locale text not null default 'en-IN' check (locale in ('en-IN','hi-IN')),
  content_value jsonb not null default '{}'::jsonb,
  asset_ref text,
  alt_text text,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  ai_editable boolean not null default true,
  requires_approval boolean not null default true,
  version integer not null default 1 check (version >= 1),
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(scope_type, tenant_id, workspace_id, route_key, surface_key, slot_key, locale),
  check (
    (scope_type = 'platform' and tenant_id is null and workspace_id is null) or
    (scope_type = 'tenant' and tenant_id is not null and workspace_id is null) or
    (scope_type = 'workspace' and tenant_id is not null and workspace_id is not null)
  )
);

create table if not exists public.cms_content_versions (
  version_id bigint generated always as identity primary key,
  node_id text not null references public.cms_content_nodes(node_id) on delete cascade,
  version integer not null,
  content_value jsonb not null,
  asset_ref text,
  alt_text text,
  change_source text not null check (change_source in ('human','ai','import','rollback','system')),
  change_reason text,
  actor_user_id text,
  ai_prompt_run_id text references public.ai_prompt_runs(prompt_run_id) on delete set null,
  created_at timestamptz not null default now(),
  unique(node_id, version)
);

create table if not exists public.cms_localization_jobs (
  localization_job_id text primary key,
  source_node_id text not null references public.cms_content_nodes(node_id) on delete cascade,
  source_locale text not null,
  target_locale text not null,
  status text not null default 'queued' check (status in ('queued','generated','review','published','failed')),
  translation_policy jsonb not null default '{}'::jsonb,
  prompt_run_id text references public.ai_prompt_runs(prompt_run_id) on delete set null,
  generated_value jsonb,
  quality_score numeric(6,5) check (quality_score is null or (quality_score >= 0 and quality_score <= 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cms_nodes_scope_route
  on public.cms_content_nodes (scope_type, tenant_id, workspace_id, route_key, locale, status);
create index if not exists idx_cms_nodes_slot
  on public.cms_content_nodes (route_key, surface_key, slot_key, locale);
create index if not exists idx_cms_versions_node
  on public.cms_content_versions (node_id, version desc);
create index if not exists idx_cms_localization_status
  on public.cms_localization_jobs (status, updated_at desc);

alter table public.cms_content_nodes enable row level security;
alter table public.cms_content_versions enable row level security;
alter table public.cms_localization_jobs enable row level security;

revoke all on public.cms_content_nodes from anon, authenticated;
revoke all on public.cms_content_versions from anon, authenticated;
revoke all on public.cms_localization_jobs from anon, authenticated;

grant all on public.cms_content_nodes to service_role;
grant all on public.cms_content_versions to service_role;
grant all on public.cms_localization_jobs to service_role;
grant usage, select on all sequences in schema public to service_role;

commit;
