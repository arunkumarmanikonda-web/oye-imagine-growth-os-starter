begin;
create table if not exists public.integration_secret_material (
  secret_id uuid primary key default gen_random_uuid(),account_id uuid not null references public.integration_accounts(id) on delete cascade,
  secret_kind text not null check (secret_kind in ('oauth_refresh_token','webhook_secret','api_secret_reference')),
  encrypted_value text not null,key_version integer not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(account_id,secret_kind)
);
create table if not exists public.integration_sync_runs (
  sync_run_id uuid primary key default gen_random_uuid(),tenant_id uuid not null,workspace_id uuid,account_id uuid references public.integration_accounts(id) on delete set null,
  provider text not null,sync_type text not null,resource_id text,status text not null check(status in('queued','running','succeeded','failed','partial')),
  source_window_start timestamptz,source_window_end timestamptz,rows_read integer not null default 0,rows_written integer not null default 0,
  freshness_at timestamptz,safe_error_code text,metadata jsonb not null default '{}'::jsonb,started_at timestamptz,completed_at timestamptz,created_at timestamptz not null default now()
);
create table if not exists public.provider_resource_links (
  resource_link_id uuid primary key default gen_random_uuid(),tenant_id uuid not null,workspace_id uuid,account_id uuid references public.integration_accounts(id) on delete cascade,
  provider text not null,resource_type text not null,external_resource_id text not null,external_parent_id text,display_name text,status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,last_read_at timestamptz,last_write_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(tenant_id,provider,resource_type,external_resource_id)
);
create table if not exists public.raw_growth_events (
  raw_event_id uuid primary key default gen_random_uuid(),tenant_id uuid not null,workspace_id uuid,provider text not null,account_id uuid references public.integration_accounts(id) on delete set null,
  resource_type text not null,external_resource_id text,source_event_id text,source_timestamp timestamptz,report_date date,source_payload jsonb not null,
  source_hash text not null,ingested_at timestamptz not null default now(),sync_run_id uuid references public.integration_sync_runs(sync_run_id) on delete set null,
  unique(tenant_id,provider,source_hash)
);
create table if not exists public.growth_facts (
  fact_id uuid primary key default gen_random_uuid(),tenant_id uuid not null,workspace_id uuid,provider text not null,fact_type text not null,
  external_resource_id text,metric_date date not null,dimensions jsonb not null default '{}'::jsonb,metrics jsonb not null default '{}'::jsonb,
  currency text,source_raw_event_id uuid references public.raw_growth_events(raw_event_id) on delete set null,source_timestamp timestamptz,ingested_at timestamptz not null default now(),
  attribution_model text not null default 'source_reported',attribution_version text not null default 'v1',lineage jsonb not null default '{}'::jsonb
);
create table if not exists public.commerce_orders_ingested (
  order_row_id uuid primary key default gen_random_uuid(),tenant_id uuid not null,workspace_id uuid,source_system text not null,external_order_id text not null,
  order_timestamp timestamptz not null,currency text not null,gross_revenue numeric(18,2) not null default 0,discount_amount numeric(18,2) not null default 0,
  refund_amount numeric(18,2) not null default 0,net_revenue numeric(18,2) not null default 0,status text not null,customer_ref text,utm jsonb not null default '{}'::jsonb,
  source_payload jsonb not null default '{}'::jsonb,source_hash text not null,ingested_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(tenant_id,source_system,external_order_id)
);
create index if not exists idx_integration_sync_runs_tenant_created on public.integration_sync_runs(tenant_id,provider,created_at desc);
create index if not exists idx_growth_facts_tenant_date on public.growth_facts(tenant_id,workspace_id,metric_date desc,provider,fact_type);
create index if not exists idx_commerce_orders_tenant_timestamp on public.commerce_orders_ingested(tenant_id,workspace_id,order_timestamp desc);
create index if not exists idx_raw_growth_events_tenant_ingested on public.raw_growth_events(tenant_id,provider,ingested_at desc);

alter table public.integration_secret_material enable row level security;alter table public.integration_sync_runs enable row level security;alter table public.provider_resource_links enable row level security;alter table public.raw_growth_events enable row level security;alter table public.growth_facts enable row level security;alter table public.commerce_orders_ingested enable row level security;
revoke all on public.integration_secret_material,public.integration_sync_runs,public.provider_resource_links,public.raw_growth_events,public.growth_facts,public.commerce_orders_ingested from anon,authenticated;
grant all on public.integration_secret_material,public.integration_sync_runs,public.provider_resource_links,public.raw_growth_events,public.growth_facts,public.commerce_orders_ingested to service_role;
commit;
