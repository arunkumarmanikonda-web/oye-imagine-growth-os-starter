create table if not exists public.integration_oauth_selection_sessions (
  session_id uuid primary key default pg_catalog.gen_random_uuid(),
  tenant_id uuid not null,
  workspace_id uuid,
  provider text not null check (provider in ('meta','linkedin')),
  subject text not null,
  encrypted_secret text not null,
  candidate_resources jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','consumed','expired')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists integration_oauth_selection_sessions_lookup_idx
  on public.integration_oauth_selection_sessions (subject, provider, status, expires_at desc);

alter table public.integration_oauth_selection_sessions enable row level security;
revoke all on public.integration_oauth_selection_sessions from public, anon, authenticated;
revoke truncate, references, trigger on public.integration_oauth_selection_sessions from service_role;
grant select, insert, update, delete on public.integration_oauth_selection_sessions to service_role;

insert into public.config_provider_secret_fields (
  provider_key, field_key, label, field_type, required, sensitive, help_text, sort_order
) values
  ('meta_marketing','META_LOGIN_CONFIG_ID','Facebook Login for Business configuration ID','text',false,false,'Optional Meta Login for Business configuration identifier. When present, Oye uses it instead of manually requesting scopes in the authorization URL.',50),
  ('meta_marketing','META_OAUTH_SCOPES','Meta OAuth scopes','text',false,false,'Optional comma-separated Meta scopes. Used only when no Login for Business configuration ID is configured.',60),
  ('linkedin_marketing','LINKEDIN_OAUTH_SCOPES','LinkedIn OAuth scopes','text',false,false,'Optional space- or comma-separated LinkedIn scopes approved for the application.',50)
on conflict (provider_key,field_key) do update set
  label=excluded.label,
  field_type=excluded.field_type,
  required=excluded.required,
  sensitive=excluded.sensitive,
  help_text=excluded.help_text,
  sort_order=excluded.sort_order;
