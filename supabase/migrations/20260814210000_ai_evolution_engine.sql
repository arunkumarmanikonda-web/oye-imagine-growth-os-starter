begin;

create table if not exists public.ai_evolution_events (
  event_id text primary key,
  tenant_id text not null,
  brand_id text,
  workspace_id text not null,
  activity_type text not null,
  source_entity_type text not null,
  source_entity_id text not null,
  product_category text,
  vertical text,
  channel text,
  language text not null default 'en' check (language in ('en','hi','hinglish','other')),
  intent text,
  prompt_template_key text,
  prompt_template_version text,
  prompt_hash text,
  provider text,
  model text,
  input_fingerprint text,
  output_fingerprint text,
  metadata jsonb not null default '{}'::jsonb,
  outcome_metrics jsonb not null default '[]'::jsonb,
  reuse_scope text not null default 'tenant_private' check (reuse_scope in ('tenant_private','workspace_private','platform_anonymized')),
  sensitivity text not null default 'internal' check (sensitivity in ('public','internal','confidential','personal','regulated')),
  contains_personal_data boolean not null default false,
  contains_client_secrets boolean not null default false,
  risk_class text not null default 'low' check (risk_class in ('low','medium','high','critical')),
  actor_user_id text,
  occurred_at timestamptz not null default now(),
  outcome_updated_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_feedback_signals (
  signal_id bigint generated always as identity primary key,
  tenant_id text not null,
  workspace_id text not null,
  event_id text not null references public.ai_evolution_events(event_id) on delete cascade,
  signal_type text not null,
  signal_value jsonb not null default '{}'::jsonb,
  source text not null default 'system',
  actor_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_prompt_runs (
  prompt_run_id text primary key,
  tenant_id text not null,
  workspace_id text not null,
  brand_id text,
  event_id text references public.ai_evolution_events(event_id) on delete set null,
  task_key text not null,
  template_key text,
  template_version text,
  provider text,
  model text,
  prompt_ciphertext text not null,
  prompt_sha256 text not null,
  response_sha256 text,
  input_context_fingerprint text,
  output_artifact_type text,
  output_artifact_id text,
  language text not null default 'en',
  reuse_scope text not null default 'tenant_private' check (reuse_scope in ('tenant_private','workspace_private','platform_anonymized')),
  contains_personal_data boolean not null default false,
  contains_client_secrets boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_learning_patterns (
  pattern_id text primary key,
  pattern_key text not null,
  tenant_id text,
  workspace_id text,
  title text not null,
  summary text not null,
  vertical text,
  product_category text,
  channel text,
  language text,
  pattern_payload jsonb not null default '{}'::jsonb,
  evidence_event_ids jsonb not null default '[]'::jsonb,
  distinct_tenant_count integer not null default 1 check (distinct_tenant_count >= 0),
  sample_count integer not null default 0 check (sample_count >= 0),
  confidence numeric(6,5) not null default 0 check (confidence >= 0 and confidence <= 1),
  outcome_lift numeric(12,6),
  reuse_scope text not null default 'tenant_private' check (reuse_scope in ('tenant_private','workspace_private','platform_anonymized')),
  sensitivity text not null default 'internal' check (sensitivity in ('public','internal','confidential','personal','regulated')),
  risk_class text not null default 'low' check (risk_class in ('low','medium','high','critical')),
  status text not null default 'observing' check (status in ('observing','candidate','active','rejected','retired')),
  promoted_at timestamptz,
  last_evaluated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pattern_key, tenant_id, workspace_id, reuse_scope)
);

create table if not exists public.ai_pattern_evaluations (
  evaluation_id bigint generated always as identity primary key,
  pattern_id text not null references public.ai_learning_patterns(pattern_id) on delete cascade,
  evaluation_type text not null check (evaluation_type in ('quality','outcome','privacy','security','brand_fit','adversarial','canary')),
  score numeric(6,5) check (score is null or (score >= 0 and score <= 1)),
  passed boolean not null default false,
  evidence jsonb not null default '{}'::jsonb,
  evaluator text not null default 'system',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_research_snapshots (
  research_id text primary key,
  tenant_id text not null,
  workspace_id text not null,
  brand_id text,
  query text not null,
  intent text,
  language text not null default 'en',
  evidence jsonb not null default '[]'::jsonb,
  contradictions jsonb not null default '[]'::jsonb,
  recommendation text,
  confidence numeric(6,5) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  freshness_policy jsonb not null default '{}'::jsonb,
  source_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.ai_global_search_documents (
  document_id text primary key,
  scope_type text not null check (scope_type in ('platform_public','tenant','workspace')),
  tenant_id text,
  workspace_id text,
  domain text not null check (domain in ('cms','configuration','brand_knowledge','integrations','strategy','creative','campaigns','social','seo','analytics','commercial','marketplace','support')),
  title text not null,
  summary text not null default '',
  body text not null default '',
  deep_link text,
  action_key text,
  keywords jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  search_text tsvector generated always as (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(body,''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scope_type = 'platform_public' and tenant_id is null and workspace_id is null) or
    (scope_type = 'tenant' and tenant_id is not null and workspace_id is null) or
    (scope_type = 'workspace' and tenant_id is not null and workspace_id is not null)
  )
);

create table if not exists public.ai_platform_improvement_candidates (
  candidate_id text primary key,
  candidate_type text not null check (candidate_type in ('prompt','routing','utility','workflow','cms','guardrail','code','schema')),
  source_pattern_id text references public.ai_learning_patterns(pattern_id) on delete set null,
  title text not null,
  rationale text not null,
  proposed_change jsonb not null default '{}'::jsonb,
  risk_class text not null check (risk_class in ('low','medium','high','critical')),
  evaluation_state text not null default 'queued' check (evaluation_state in ('queued','evaluating','canary','approved','rejected','rolled_back')),
  autonomous_promotion_allowed boolean not null default false,
  test_evidence jsonb not null default '[]'::jsonb,
  canary_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_evolution_events_tenant_workspace_time
  on public.ai_evolution_events (tenant_id, workspace_id, occurred_at desc);
create index if not exists idx_ai_evolution_events_activity_time
  on public.ai_evolution_events (activity_type, occurred_at desc);
create index if not exists idx_ai_evolution_events_platform_learning
  on public.ai_evolution_events (reuse_scope, vertical, product_category, channel, occurred_at desc)
  where reuse_scope = 'platform_anonymized' and contains_personal_data = false and contains_client_secrets = false;
create index if not exists idx_ai_feedback_event_time
  on public.ai_feedback_signals (event_id, created_at desc);
create index if not exists idx_ai_prompt_runs_workspace_time
  on public.ai_prompt_runs (tenant_id, workspace_id, created_at desc);
create index if not exists idx_ai_learning_patterns_reuse
  on public.ai_learning_patterns (reuse_scope, status, vertical, product_category, channel, confidence desc);
create index if not exists idx_ai_research_workspace_time
  on public.ai_research_snapshots (tenant_id, workspace_id, created_at desc);
create index if not exists idx_ai_global_search_scope
  on public.ai_global_search_documents (scope_type, tenant_id, workspace_id, domain, updated_at desc);
create index if not exists idx_ai_global_search_text
  on public.ai_global_search_documents using gin (search_text);
create index if not exists idx_ai_improvement_candidates_state
  on public.ai_platform_improvement_candidates (evaluation_state, risk_class, updated_at desc);

alter table public.ai_evolution_events enable row level security;
alter table public.ai_feedback_signals enable row level security;
alter table public.ai_prompt_runs enable row level security;
alter table public.ai_learning_patterns enable row level security;
alter table public.ai_pattern_evaluations enable row level security;
alter table public.ai_research_snapshots enable row level security;
alter table public.ai_global_search_documents enable row level security;
alter table public.ai_platform_improvement_candidates enable row level security;

revoke all on public.ai_evolution_events from anon, authenticated;
revoke all on public.ai_feedback_signals from anon, authenticated;
revoke all on public.ai_prompt_runs from anon, authenticated;
revoke all on public.ai_learning_patterns from anon, authenticated;
revoke all on public.ai_pattern_evaluations from anon, authenticated;
revoke all on public.ai_research_snapshots from anon, authenticated;
revoke all on public.ai_global_search_documents from anon, authenticated;
revoke all on public.ai_platform_improvement_candidates from anon, authenticated;

grant all on public.ai_evolution_events to service_role;
grant all on public.ai_feedback_signals to service_role;
grant all on public.ai_prompt_runs to service_role;
grant all on public.ai_learning_patterns to service_role;
grant all on public.ai_pattern_evaluations to service_role;
grant all on public.ai_research_snapshots to service_role;
grant all on public.ai_global_search_documents to service_role;
grant all on public.ai_platform_improvement_candidates to service_role;
grant usage, select on all sequences in schema public to service_role;

commit;
