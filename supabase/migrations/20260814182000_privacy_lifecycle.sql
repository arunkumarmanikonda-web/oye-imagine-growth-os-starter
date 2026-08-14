begin;

create table if not exists public.privacy_consent_events (
  consent_event_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  subject_key text not null,
  channel text not null check (channel in ('email','whatsapp','sms','push','web')),
  purpose text not null,
  decision text not null check (decision in ('granted','withdrawn')),
  notice_version text not null,
  source text not null,
  lawful_basis text,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_privacy_consent_lookup on public.privacy_consent_events(tenant_id, subject_key, channel, purpose, occurred_at desc);

create table if not exists public.privacy_suppressions (
  suppression_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  subject_key text not null,
  channel text check (channel in ('email','whatsapp','sms','push','web')),
  scope text not null default 'channel' check (scope in ('channel','global')),
  reason text not null,
  source text not null,
  reversible boolean not null default true,
  active boolean not null default true,
  suppressed_at timestamptz not null default now(),
  released_at timestamptz,
  released_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_privacy_suppression_lookup on public.privacy_suppressions(tenant_id, subject_key, active, channel, scope);

create table if not exists public.lifecycle_delivery_jobs (
  delivery_job_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  subject_key text not null,
  channel text not null check (channel in ('email','whatsapp','sms')),
  purpose text not null,
  provider text not null,
  payload jsonb not null default '{}'::jsonb,
  consent_event_id uuid references public.privacy_consent_events(consent_event_id) on delete set null,
  status text not null default 'queued' check (status in ('queued','blocked','sending','sent','delivered','failed','cancelled')),
  decision_reason text,
  provider_message_id text,
  provider_status text,
  callback_metadata jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  requested_by text,
  requested_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_lifecycle_delivery_jobs_tenant_created on public.lifecycle_delivery_jobs(tenant_id, requested_at desc);

create table if not exists public.privacy_dsar_requests (
  dsar_request_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  subject_key text not null,
  request_type text not null check (request_type in ('access','export','correction','deletion','restriction','objection')),
  identity_status text not null default 'pending' check (identity_status in ('pending','verified','failed','waived')),
  status text not null default 'received' check (status in ('received','identity_check','in_progress','needs_review','completed','rejected','cancelled')),
  request_payload jsonb not null default '{}'::jsonb,
  result_metadata jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  due_at timestamptz,
  verified_at timestamptz,
  completed_at timestamptz,
  created_by text,
  updated_by text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_privacy_dsar_tenant_status on public.privacy_dsar_requests(tenant_id, status, requested_at desc);

create table if not exists public.privacy_retention_policies (
  retention_policy_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  data_class text not null,
  target_table text not null,
  retention_days integer not null check (retention_days between 1 and 36500),
  action text not null default 'review' check (action in ('review','anonymize','delete')),
  protected_record_class boolean not null default false,
  enabled boolean not null default true,
  legal_basis text,
  metadata jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, workspace_id, target_table, data_class)
);

create table if not exists public.privacy_retention_runs (
  retention_run_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  retention_policy_id uuid references public.privacy_retention_policies(retention_policy_id) on delete set null,
  mode text not null check (mode in ('dry_run','execute')),
  status text not null default 'queued' check (status in ('queued','running','needs_approval','completed','failed','blocked')),
  approval_id text,
  candidate_count bigint not null default 0,
  affected_count bigint not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  safe_error_code text,
  requested_by text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.privacy_consent_events enable row level security;
alter table public.privacy_suppressions enable row level security;
alter table public.lifecycle_delivery_jobs enable row level security;
alter table public.privacy_dsar_requests enable row level security;
alter table public.privacy_retention_policies enable row level security;
alter table public.privacy_retention_runs enable row level security;

revoke all on public.privacy_consent_events, public.privacy_suppressions, public.lifecycle_delivery_jobs, public.privacy_dsar_requests, public.privacy_retention_policies, public.privacy_retention_runs from anon, authenticated;
grant all on public.privacy_consent_events, public.privacy_suppressions, public.lifecycle_delivery_jobs, public.privacy_dsar_requests, public.privacy_retention_policies, public.privacy_retention_runs to service_role;

commit;
