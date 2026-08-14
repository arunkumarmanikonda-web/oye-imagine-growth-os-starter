begin;

create table if not exists public.commercial_client_activation_journeys (
  journey_id text primary key,
  tenant_id text not null,
  workspace_id text not null,
  state text not null default 'signup_completed' check (state in (
    'signup_completed','brand_learning','brand_plan_ready_locked','kyc_pending','kyc_verified',
    'agreement_generated','esign_sent','agreement_signed','payment_pending','payment_processing',
    'payment_successful','invoice_issued','active','suspended','cancelled'
  )),
  selected_modules jsonb not null default '[]'::jsonb,
  billing_cadence text check (billing_cadence is null or billing_cadence in ('monthly','annual')),
  brand_plan_artifact_id text,
  kyc_case_id text,
  agreement_id text,
  esign_envelope_id text,
  payment_link_id text,
  recurring_mandate_id text,
  payment_id text,
  invoice_id text,
  activation_metadata jsonb not null default '{}'::jsonb,
  activated_at timestamptz,
  suspended_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, workspace_id)
);

create table if not exists public.commercial_client_activation_events (
  activation_event_id bigint generated always as identity primary key,
  journey_id text not null references public.commercial_client_activation_journeys(journey_id) on delete cascade,
  tenant_id text not null,
  workspace_id text not null,
  from_state text,
  to_state text not null,
  event_type text not null,
  provider text,
  provider_event_id text,
  idempotency_key text,
  actor_user_id text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id),
  unique(idempotency_key)
);

create index if not exists idx_client_activation_state
  on public.commercial_client_activation_journeys (state, updated_at desc);
create index if not exists idx_client_activation_tenant_workspace
  on public.commercial_client_activation_journeys (tenant_id, workspace_id);
create index if not exists idx_client_activation_events_journey
  on public.commercial_client_activation_events (journey_id, created_at desc);

alter table public.commercial_client_activation_journeys enable row level security;
alter table public.commercial_client_activation_events enable row level security;

revoke all on public.commercial_client_activation_journeys from anon, authenticated;
revoke all on public.commercial_client_activation_events from anon, authenticated;

grant all on public.commercial_client_activation_journeys to service_role;
grant all on public.commercial_client_activation_events to service_role;
grant usage, select on all sequences in schema public to service_role;

commit;
