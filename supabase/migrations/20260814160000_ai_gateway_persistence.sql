begin;

create table if not exists public.ai_usage_ledger (
  usage_id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  workspace_id text,
  pilot_id text,
  task_type text not null,
  request_id text not null,
  provider text not null,
  model text not null,
  prompt_tokens bigint not null default 0 check (prompt_tokens >= 0),
  completion_tokens bigint not null default 0 check (completion_tokens >= 0),
  estimated_cost_usd numeric(18,8) not null default 0 check (estimated_cost_usd >= 0),
  cache_hit boolean not null default false,
  status text not null check (status in ('succeeded','failed','blocked')),
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_response_cache (
  cache_key text primary key,
  tenant_id text not null,
  workspace_id text,
  task_type text not null,
  provider text not null,
  model text not null,
  response_payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_ledger_tenant_created_at on public.ai_usage_ledger (tenant_id, created_at desc);
create index if not exists idx_ai_usage_ledger_tenant_task_created_at on public.ai_usage_ledger (tenant_id, task_type, created_at desc);
create index if not exists idx_ai_response_cache_tenant_expires on public.ai_response_cache (tenant_id, expires_at);

alter table public.ai_usage_ledger enable row level security;
alter table public.ai_response_cache enable row level security;
revoke all on public.ai_usage_ledger from anon, authenticated;
revoke all on public.ai_response_cache from anon, authenticated;
grant all on public.ai_usage_ledger to service_role;
grant all on public.ai_response_cache to service_role;

commit;
