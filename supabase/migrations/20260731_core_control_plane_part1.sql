begin;

create table if not exists public.core_role_definitions (
  role_key text primary key,
  role_name text not null,
  role_scope text not null check (role_scope in ('platform','tenant','brand','workspace','campaign')),
  permissions jsonb not null default '[]'::jsonb,
  system_role boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_tenant_memberships (
  membership_id text primary key,
  tenant_id text not null,
  user_id text not null,
  role_key text not null references public.core_role_definitions(role_key),
  brand_id text,
  workspace_id text,
  status text not null default 'active' check (status in ('invited','active','suspended','revoked')),
  authority_limits jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_feature_flags (
  flag_key text primary key,
  scope_type text not null check (scope_type in ('platform','tenant','brand','workspace')),
  description text not null,
  default_state text not null default 'disabled' check (default_state in ('enabled','disabled','trial','gated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_tenant_feature_entitlements (
  entitlement_id text primary key,
  tenant_id text not null,
  flag_key text not null references public.core_feature_flags(flag_key),
  brand_id text,
  workspace_id text,
  state text not null check (state in ('enabled','disabled','trial','gated')),
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_approval_policies (
  policy_id text primary key,
  tenant_id text not null,
  scope_type text not null check (scope_type in ('tenant','brand','workspace','campaign')),
  scope_ref text,
  action_key text not null,
  maker_checker_required boolean not null default true,
  min_approvers integer not null default 1 check (min_approvers >= 0),
  approval_mode text not null default 'any' check (approval_mode in ('any','all','sequential')),
  max_amount numeric(18,2),
  max_delta_percent numeric(9,2),
  policy jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_ai_providers (
  provider_key text primary key,
  provider_type text not null check (provider_type in ('llm','embedding','image','video','audio','reranker','workflow')),
  display_name text not null,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_ai_task_routes (
  route_id text primary key,
  task_key text not null unique,
  primary_provider_key text not null references public.core_ai_providers(provider_key),
  fallback_provider_key text references public.core_ai_providers(provider_key),
  max_cost_usd numeric(12,4),
  latency_slo_ms integer,
  policy jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_core_memberships_tenant_user_status
  on public.core_tenant_memberships (tenant_id, user_id, status);

create index if not exists idx_core_entitlements_tenant_flag_active
  on public.core_tenant_feature_entitlements (tenant_id, flag_key, is_active, updated_at desc);

create index if not exists idx_core_policies_tenant_action_active
  on public.core_approval_policies (tenant_id, action_key, is_active, updated_at desc);

create index if not exists idx_core_ai_routes_enabled
  on public.core_ai_task_routes (enabled, task_key);

create or replace function public.tg_core_set_updated_at()
returns trigger
language plpgsql
as $cp$
begin
  new.updated_at = now();
  return new;
end;
$cp$;

drop trigger if exists trg_core_role_definitions_updated_at on public.core_role_definitions;
create trigger trg_core_role_definitions_updated_at
before update on public.core_role_definitions
for each row execute function public.tg_core_set_updated_at();

drop trigger if exists trg_core_tenant_memberships_updated_at on public.core_tenant_memberships;
create trigger trg_core_tenant_memberships_updated_at
before update on public.core_tenant_memberships
for each row execute function public.tg_core_set_updated_at();

drop trigger if exists trg_core_feature_flags_updated_at on public.core_feature_flags;
create trigger trg_core_feature_flags_updated_at
before update on public.core_feature_flags
for each row execute function public.tg_core_set_updated_at();

drop trigger if exists trg_core_tenant_feature_entitlements_updated_at on public.core_tenant_feature_entitlements;
create trigger trg_core_tenant_feature_entitlements_updated_at
before update on public.core_tenant_feature_entitlements
for each row execute function public.tg_core_set_updated_at();

drop trigger if exists trg_core_approval_policies_updated_at on public.core_approval_policies;
create trigger trg_core_approval_policies_updated_at
before update on public.core_approval_policies
for each row execute function public.tg_core_set_updated_at();

drop trigger if exists trg_core_ai_providers_updated_at on public.core_ai_providers;
create trigger trg_core_ai_providers_updated_at
before update on public.core_ai_providers
for each row execute function public.tg_core_set_updated_at();

drop trigger if exists trg_core_ai_task_routes_updated_at on public.core_ai_task_routes;
create trigger trg_core_ai_task_routes_updated_at
before update on public.core_ai_task_routes
for each row execute function public.tg_core_set_updated_at();

insert into public.core_role_definitions (role_key, role_name, role_scope, permissions, system_role)
values
  ('platform_owner','Platform Owner','platform','["*"]'::jsonb,true),
  ('tenant_admin','Tenant Administrator','tenant','["tenant.*","brand.*","workspace.*","approval.*","reporting.*"]'::jsonb,true),
  ('brand_manager','Brand Manager','brand','["brand.view","brand.update","workspace.view","content.*","campaign.*","reporting.view"]'::jsonb,true),
  ('content_approver','Content Approver','brand','["content.view","content.approve","creative.view","creative.approve"]'::jsonb,true),
  ('finance_approver','Finance Approver','tenant','["finance.view","finance.approve","invoice.view","subscription.view"]'::jsonb,true),
  ('analyst','Analyst','workspace','["analytics.view","reporting.view","campaign.view","content.view"]'::jsonb,true),
  ('viewer','Viewer','workspace','["brand.view","workspace.view","reporting.view"]'::jsonb,true)
on conflict (role_key) do update
set role_name = excluded.role_name,
    role_scope = excluded.role_scope,
    permissions = excluded.permissions,
    system_role = excluded.system_role,
    updated_at = now();

insert into public.core_feature_flags (flag_key, scope_type, description, default_state)
values
  ('onboarding.brand_intelligence','tenant','Enable automated brand discovery and memory building.','enabled'),
  ('channels.google_ads','tenant','Enable Google Ads connector and draft campaign workflows.','enabled'),
  ('channels.meta_ads','tenant','Enable Meta ads connector and draft campaign workflows.','enabled'),
  ('channels.whatsapp','tenant','Enable WhatsApp workflows after compliance activation.','gated'),
  ('channels.sms','tenant','Enable SMS workflows after DLT/compliance activation.','gated'),
  ('marketplace.enabled','tenant','Enable specialist marketplace flows.','trial'),
  ('white_label.enabled','tenant','Enable white-label operating surfaces.','gated'),
  ('ai.autonomy.level3','workspace','Enable guarded autonomous execution above approval-only mode.','disabled'),
  ('reporting.executive_exports','tenant','Enable PDF/PPTX/XLSX executive reporting exports.','enabled')
on conflict (flag_key) do update
set scope_type = excluded.scope_type,
    description = excluded.description,
    default_state = excluded.default_state,
    updated_at = now();

insert into public.core_ai_providers (provider_key, provider_type, display_name, enabled, config)
values
  ('openai','llm','OpenAI',true,'{"tier":"primary"}'::jsonb),
  ('google','llm','Google',true,'{"tier":"primary"}'::jsonb),
  ('anthropic','llm','Anthropic',true,'{"tier":"fallback"}'::jsonb),
  ('fal','image','Fal',true,'{"tier":"media"}'::jsonb)
on conflict (provider_key) do update
set provider_type = excluded.provider_type,
    display_name = excluded.display_name,
    enabled = excluded.enabled,
    config = excluded.config,
    updated_at = now();

insert into public.core_ai_task_routes (route_id, task_key, primary_provider_key, fallback_provider_key, max_cost_usd, latency_slo_ms, policy, enabled)
values
  ('route_brand_strategy','brand.strategy.generate','google','openai',3.5000,45000,'{"requiresGrounding":true}'::jsonb,true),
  ('route_copy_generation','content.copy.generate','openai','anthropic',0.7500,12000,'{"brandLocked":true}'::jsonb,true),
  ('route_image_generation','creative.image.generate','fal',null,1.2500,30000,'{"brandLocked":true}'::jsonb,true)
on conflict (task_key) do update
set primary_provider_key = excluded.primary_provider_key,
    fallback_provider_key = excluded.fallback_provider_key,
    max_cost_usd = excluded.max_cost_usd,
    latency_slo_ms = excluded.latency_slo_ms,
    policy = excluded.policy,
    enabled = excluded.enabled,
    updated_at = now();

commit;