begin;

create table if not exists public.config_provider_definitions (
  provider_key text primary key,
  display_name text not null,
  provider_category text not null,
  capabilities jsonb not null default '[]'::jsonb,
  documentation_url text,
  account_creation_url text,
  enabled boolean not null default true,
  client_visible boolean not null default false,
  adapter_key text not null,
  adapter_version text not null default 'v1',
  healthcheck_strategy text not null default 'credential_validation',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.config_provider_secret_fields (
  provider_key text not null references public.config_provider_definitions(provider_key) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null default 'secret' check (field_type in ('secret','text','url','number','boolean','json')),
  required boolean not null default true,
  sensitive boolean not null default true,
  help_text text,
  validation_pattern text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  primary key(provider_key, field_key)
);

create table if not exists public.config_provider_credentials (
  credential_id text primary key,
  provider_key text not null references public.config_provider_definitions(provider_key) on delete cascade,
  environment text not null default 'production' check (environment in ('development','preview','staging','production')),
  field_key text not null,
  encrypted_value text not null,
  value_fingerprint text not null,
  status text not null default 'configured' check (status in ('configured','verified','invalid','expired','revoked')),
  last_verified_at timestamptz,
  verification_message text,
  rotated_at timestamptz,
  expires_at timestamptz,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_key, environment, field_key)
);

create table if not exists public.config_capability_routes (
  route_id text primary key,
  capability_key text not null,
  purpose text not null,
  primary_provider_key text not null references public.config_provider_definitions(provider_key),
  fallback_provider_keys jsonb not null default '[]'::jsonb,
  routing_policy jsonb not null default '{}'::jsonb,
  client_label text not null default 'Oye !magine',
  client_provider_disclosure boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(capability_key, purpose)
);

create table if not exists public.config_integration_requests (
  request_id text primary key,
  requested_capability text not null,
  proposed_provider_name text,
  proposed_provider_category text,
  reason text not null,
  expected_value text,
  required_account_steps jsonb not null default '[]'::jsonb,
  required_secret_fields jsonb not null default '[]'::jsonb,
  official_docs_url text,
  official_account_url text,
  status text not null default 'proposed' check (status in ('proposed','admin_action_required','credentials_pending','adapter_building','validation','ready','rejected','retired')),
  discovered_by text not null default 'system',
  improvement_candidate_id text references public.ai_platform_improvement_candidates(candidate_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.config_provider_health_events (
  health_event_id bigint generated always as identity primary key,
  provider_key text not null references public.config_provider_definitions(provider_key) on delete cascade,
  environment text not null,
  status text not null check (status in ('healthy','degraded','unavailable','credentials_missing','credentials_invalid','quota_warning','policy_attention')),
  latency_ms integer,
  message text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.core_action_approval_routes (
  action_key text primary key,
  action_family text not null,
  maker_role_keys jsonb not null default '[]'::jsonb,
  approver_role_keys jsonb not null default '[]'::jsonb,
  client_approval_required boolean not null default false,
  assigned_partner_required boolean not null default false,
  min_approvers integer not null default 1 check (min_approvers >= 0),
  auto_execute_after_approval boolean not null default false,
  autonomy_envelope_required boolean not null default true,
  notes text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.core_workspace_role_assignments (
  assignment_id text primary key,
  tenant_id text not null,
  workspace_id text not null,
  user_id text not null,
  role_key text not null,
  responsibility_key text not null,
  is_primary boolean not null default true,
  status text not null default 'active' check (status in ('active','inactive','revoked')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, workspace_id, user_id, role_key, responsibility_key)
);

create index if not exists idx_provider_credentials_provider_env on public.config_provider_credentials(provider_key, environment, status);
create index if not exists idx_capability_routes_capability on public.config_capability_routes(capability_key, enabled);
create index if not exists idx_integration_requests_status on public.config_integration_requests(status, updated_at desc);
create index if not exists idx_provider_health_latest on public.config_provider_health_events(provider_key, environment, created_at desc);
create index if not exists idx_action_approval_family on public.core_action_approval_routes(action_family, enabled);
create index if not exists idx_workspace_role_assignments_scope on public.core_workspace_role_assignments(tenant_id, workspace_id, responsibility_key, status);

alter table public.config_provider_definitions enable row level security;
alter table public.config_provider_secret_fields enable row level security;
alter table public.config_provider_credentials enable row level security;
alter table public.config_capability_routes enable row level security;
alter table public.config_integration_requests enable row level security;
alter table public.config_provider_health_events enable row level security;
alter table public.core_action_approval_routes enable row level security;
alter table public.core_workspace_role_assignments enable row level security;

revoke all on public.config_provider_definitions from anon, authenticated;
revoke all on public.config_provider_secret_fields from anon, authenticated;
revoke all on public.config_provider_credentials from anon, authenticated;
revoke all on public.config_capability_routes from anon, authenticated;
revoke all on public.config_integration_requests from anon, authenticated;
revoke all on public.config_provider_health_events from anon, authenticated;
revoke all on public.core_action_approval_routes from anon, authenticated;
revoke all on public.core_workspace_role_assignments from anon, authenticated;

grant all on public.config_provider_definitions to service_role;
grant all on public.config_provider_secret_fields to service_role;
grant all on public.config_provider_credentials to service_role;
grant all on public.config_capability_routes to service_role;
grant all on public.config_integration_requests to service_role;
grant all on public.config_provider_health_events to service_role;
grant all on public.core_action_approval_routes to service_role;
grant all on public.core_workspace_role_assignments to service_role;
grant usage, select on all sequences in schema public to service_role;

insert into public.config_provider_definitions(provider_key,display_name,provider_category,capabilities,adapter_key,client_visible,metadata)
values
  ('openai','OpenAI','ai','["llm","embedding","image","speech_to_text","text_to_speech"]'::jsonb,'openai',false,'{"managedBy":"super_admin"}'::jsonb),
  ('anthropic','Anthropic','ai','["llm"]'::jsonb,'anthropic',false,'{"managedBy":"super_admin"}'::jsonb),
  ('google_oauth','Google OAuth','identity_connection','["oauth","google_ads","ga4","search_console","youtube"]'::jsonb,'google_oauth',false,'{"managedBy":"super_admin"}'::jsonb),
  ('resend','Resend','email','["transactional_email","lifecycle_email"]'::jsonb,'resend',false,'{"managedBy":"super_admin"}'::jsonb),
  ('fast2sms','Fast2SMS','sms','["sms"]'::jsonb,'fast2sms',false,'{"managedBy":"super_admin"}'::jsonb),
  ('aisensy','AiSensy','whatsapp','["whatsapp"]'::jsonb,'aisensy',false,'{"managedBy":"super_admin"}'::jsonb)
on conflict (provider_key) do update set
  display_name=excluded.display_name,
  provider_category=excluded.provider_category,
  capabilities=excluded.capabilities,
  adapter_key=excluded.adapter_key,
  client_visible=false,
  metadata=excluded.metadata,
  updated_at=now();

insert into public.config_provider_secret_fields(provider_key,field_key,label,field_type,required,sensitive,sort_order)
values
  ('openai','OPENAI_API_KEY','API key','secret',true,true,10),
  ('anthropic','ANTHROPIC_API_KEY','API key','secret',true,true,10),
  ('google_oauth','GOOGLE_CLIENT_ID','Client ID','text',true,false,10),
  ('google_oauth','GOOGLE_CLIENT_SECRET','Client secret','secret',true,true,20),
  ('google_oauth','GOOGLE_OAUTH_REDIRECT_URI','Redirect URI','url',true,false,30),
  ('resend','RESEND_API_KEY','API key','secret',true,true,10),
  ('resend','RESEND_FROM_EMAIL','Default from email','text',true,false,20),
  ('fast2sms','FAST2SMS_API_KEY','API key','secret',true,true,10),
  ('aisensy','AISENSY_API_KEY','API key','secret',true,true,10),
  ('aisensy','AISENSY_CAMPAIGN_ENDPOINT','Campaign endpoint','url',false,false,20)
on conflict (provider_key,field_key) do update set
  label=excluded.label,
  field_type=excluded.field_type,
  required=excluded.required,
  sensitive=excluded.sensitive,
  sort_order=excluded.sort_order;

insert into public.core_action_approval_routes(action_key,action_family,maker_role_keys,approver_role_keys,client_approval_required,assigned_partner_required,min_approvers,auto_execute_after_approval,autonomy_envelope_required,notes)
values
  ('creative.publish','creative','["designer","brand_manager","digital_marketer"]'::jsonb,'["designer"]'::jsonb,false,false,1,true,true,'AI may generate and revise. A designer signs off before client-facing publication.'),
  ('campaign.launch','campaign','["digital_marketer","brand_manager"]'::jsonb,'["digital_marketer"]'::jsonb,false,true,1,true,true,'The primary digital marketer assigned to the workspace signs off campaign launch.'),
  ('campaign.budget_change','finance','["digital_marketer"]'::jsonb,'["finance_approver"]'::jsonb,false,true,1,false,true,'Spend changes remain within finance and client commercial authority.'),
  ('social.publish','social','["designer","brand_manager","digital_marketer"]'::jsonb,'["brand_manager","digital_marketer"]'::jsonb,false,false,1,true,true,'Publishing requires an authorized content/growth approver.'),
  ('lifecycle.send','lifecycle','["digital_marketer"]'::jsonb,'["digital_marketer"]'::jsonb,false,true,1,true,true,'Messaging remains consent-gated and assigned-partner approved.'),
  ('agreement.issue','commercial','["tenant_admin"]'::jsonb,'["platform_owner","finance_approver"]'::jsonb,false,false,1,true,false,'Only approved legal template versions may be issued.'),
  ('report.publish','reporting','["analyst","digital_marketer"]'::jsonb,'[]'::jsonb,false,false,0,true,false,'Recurring reports may be generated and published automatically from verified data.'),
  ('platform.provider_config','platform_config','["platform_owner"]'::jsonb,'["platform_owner"]'::jsonb,false,false,1,false,false,'Provider credentials and routes are Super Admin only.')
on conflict (action_key) do update set
  action_family=excluded.action_family,
  maker_role_keys=excluded.maker_role_keys,
  approver_role_keys=excluded.approver_role_keys,
  client_approval_required=excluded.client_approval_required,
  assigned_partner_required=excluded.assigned_partner_required,
  min_approvers=excluded.min_approvers,
  auto_execute_after_approval=excluded.auto_execute_after_approval,
  autonomy_envelope_required=excluded.autonomy_envelope_required,
  notes=excluded.notes,
  enabled=true,
  updated_at=now();

commit;
