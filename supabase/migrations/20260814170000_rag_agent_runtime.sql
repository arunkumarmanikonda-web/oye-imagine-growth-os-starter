begin;

create extension if not exists vector with schema extensions;

create table if not exists public.brand_knowledge_sources (
  source_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  brand_id text,
  workspace_id text,
  source_type text not null check (source_type in ('website','document','catalogue','campaign','guideline','manual','api','note')),
  source_uri text,
  title text not null,
  version_label text not null default 'v1',
  content_sha256 text not null,
  freshness_status text not null default 'current' check (freshness_status in ('current','stale','refresh_required','archived')),
  source_metadata jsonb not null default '{}'::jsonb,
  ingested_by text,
  ingested_at timestamptz not null default now(),
  refreshed_at timestamptz,
  deleted_at timestamptz,
  unique (tenant_id, content_sha256)
);

create table if not exists public.brand_knowledge_chunks (
  chunk_id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.brand_knowledge_sources(source_id) on delete cascade,
  tenant_id text not null,
  brand_id text,
  workspace_id text,
  ordinal integer not null check (ordinal >= 0),
  content text not null,
  content_sha256 text not null,
  token_estimate integer not null default 0 check (token_estimate >= 0),
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  embedding_model text,
  embedded_at timestamptz,
  search_vector tsvector generated always as (to_tsvector('simple'::regconfig, coalesce(content,''))) stored,
  created_at timestamptz not null default now(),
  unique (source_id, ordinal)
);

create index if not exists idx_brand_knowledge_sources_tenant_workspace on public.brand_knowledge_sources(tenant_id, workspace_id, ingested_at desc) where deleted_at is null;
create index if not exists idx_brand_knowledge_chunks_tenant_workspace on public.brand_knowledge_chunks(tenant_id, workspace_id, created_at desc);
create index if not exists idx_brand_knowledge_chunks_search on public.brand_knowledge_chunks using gin(search_vector);
create index if not exists idx_brand_knowledge_chunks_embedding on public.brand_knowledge_chunks using hnsw (embedding vector_cosine_ops) where embedding is not null;

create table if not exists public.agent_autonomy_policies (
  policy_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text,
  agent_key text not null,
  autonomy_level smallint not null default 0 check (autonomy_level between 0 and 4),
  enabled boolean not null default true,
  kill_switch boolean not null default false,
  allowed_tool_classes jsonb not null default '["read"]'::jsonb,
  max_run_cost_usd numeric(18,8) not null default 0.25 check (max_run_cost_usd >= 0),
  max_tool_calls integer not null default 5 check (max_tool_calls between 0 and 100),
  requires_human_approval_for jsonb not null default '["publish","external_mutation","spend","payment","message"]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, workspace_id, agent_key)
);

create table if not exists public.agent_runs (
  run_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  brand_id text,
  workspace_id text,
  agent_key text not null,
  autonomy_level smallint not null default 0 check (autonomy_level between 0 and 4),
  objective text not null,
  status text not null default 'queued' check (status in ('queued','running','needs_review','succeeded','failed','blocked','cancelled')),
  model_provider text,
  model_key text,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  citation_refs jsonb not null default '[]'::jsonb,
  tool_call_count integer not null default 0,
  estimated_cost_usd numeric(18,8) not null default 0,
  approval_required boolean not null default true,
  approval_status text not null default 'not_requested' check (approval_status in ('not_requested','pending','approved','rejected')),
  safe_error_code text,
  created_by text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_tool_calls (
  tool_call_id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.agent_runs(run_id) on delete cascade,
  tenant_id text not null,
  workspace_id text,
  tool_key text not null,
  tool_class text not null check (tool_class in ('read','draft_write','internal_mutation','external_mutation','publish','spend','payment','message')),
  input_summary jsonb not null default '{}'::jsonb,
  output_summary jsonb not null default '{}'::jsonb,
  status text not null check (status in ('started','succeeded','failed','blocked')),
  approval_id text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_evaluation_runs (
  evaluation_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text,
  run_id uuid references public.agent_runs(run_id) on delete set null,
  evaluation_type text not null check (evaluation_type in ('groundedness','citation_coverage','brand_adherence','prohibited_claims','tool_safety','combined')),
  score numeric(6,4) check (score between 0 and 1),
  passed boolean not null default false,
  findings jsonb not null default '[]'::jsonb,
  evaluator text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_runs_tenant_workspace_created on public.agent_runs(tenant_id, workspace_id, created_at desc);
create index if not exists idx_agent_tool_calls_run on public.agent_tool_calls(run_id, started_at);
create index if not exists idx_ai_evaluation_runs_run on public.ai_evaluation_runs(run_id, created_at desc);

create or replace function public.match_brand_knowledge(
  p_tenant_id text,
  p_workspace_id text,
  p_query_embedding extensions.vector(1536),
  p_match_count integer default 8,
  p_min_similarity double precision default 0.35
)
returns table(chunk_id uuid, source_id uuid, content text, metadata jsonb, similarity double precision)
language sql
stable
security invoker
set search_path = pg_catalog, public, extensions
as $$
  select c.chunk_id, c.source_id, c.content, c.metadata,
         1 - (c.embedding <=> p_query_embedding) as similarity
  from public.brand_knowledge_chunks c
  join public.brand_knowledge_sources s on s.source_id = c.source_id
  where c.tenant_id = p_tenant_id
    and (p_workspace_id is null or c.workspace_id = p_workspace_id)
    and s.deleted_at is null
    and c.embedding is not null
    and 1 - (c.embedding <=> p_query_embedding) >= p_min_similarity
  order by c.embedding <=> p_query_embedding
  limit greatest(1, least(p_match_count, 50));
$$;

alter table public.brand_knowledge_sources enable row level security;
alter table public.brand_knowledge_chunks enable row level security;
alter table public.agent_autonomy_policies enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_tool_calls enable row level security;
alter table public.ai_evaluation_runs enable row level security;

revoke all on public.brand_knowledge_sources, public.brand_knowledge_chunks, public.agent_autonomy_policies, public.agent_runs, public.agent_tool_calls, public.ai_evaluation_runs from anon, authenticated;
grant all on public.brand_knowledge_sources, public.brand_knowledge_chunks, public.agent_autonomy_policies, public.agent_runs, public.agent_tool_calls, public.ai_evaluation_runs to service_role;
revoke all on function public.match_brand_knowledge(text,text,extensions.vector,integer,double precision) from public, anon, authenticated;
grant execute on function public.match_brand_knowledge(text,text,extensions.vector,integer,double precision) to service_role;

commit;
