create extension if not exists pgcrypto;

create table if not exists public.organization_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  legal_name text not null,
  trade_name text not null,
  cin text,
  pan text,
  tan text,
  gstin text,
  incorporation_date date,
  gst_effective_date date,
  registration_type text,
  business_address jsonb not null default '{}'::jsonb,
  contact_emails jsonb not null default '[]'::jsonb,
  contact_phones jsonb not null default '[]'::jsonb,
  support_mailbox text,
  resend_from_email text,
  legal_documents jsonb not null default '[]'::jsonb,
  tax_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_channels (
  id uuid primary key default gen_random_uuid(),
  organization_slug text not null,
  channel_key text not null,
  channel_type text not null,
  label text not null,
  destination text not null,
  provider text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_slug, channel_key)
);

create table if not exists public.support_mail_logs (
  id uuid primary key default gen_random_uuid(),
  organization_slug text not null,
  channel_key text,
  direction text not null default 'outbound',
  provider text,
  provider_message_id text,
  status text not null default 'queued',
  from_email text,
  to_email text,
  subject text,
  payload jsonb not null default '{}'::jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_brand_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null,
  workspace_slug text not null,
  brand_slug text not null unique,
  brand_name text not null,
  display_name text not null,
  website text,
  industry text,
  geo text,
  target_audience text,
  offer_summary text,
  monthly_budget text,
  status text not null default 'draft',
  positioning jsonb not null default '{}'::jsonb,
  channels jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  success_metrics jsonb not null default '[]'::jsonb,
  competitors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  audience text not null,
  page_type text not null,
  status text not null default 'draft',
  layout_key text not null,
  seo jsonb not null default '{}'::jsonb,
  visibility_rules jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  section_key text not null,
  title text not null,
  section_type text not null,
  status text not null default 'draft',
  sort_order integer not null default 0,
  slot_key text not null,
  content jsonb not null default '{}'::jsonb,
  visibility_rules jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_slug, section_key)
);

create table if not exists public.cms_promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  audience text not null,
  placement text not null,
  title text not null,
  subtitle text,
  status text not null default 'draft',
  cta_label text,
  cta_href text,
  offer_terms text,
  priority integer not null default 100,
  content jsonb not null default '{}'::jsonb,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_people_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  audience text not null,
  profile_type text not null,
  display_name text not null,
  title text not null,
  team text not null,
  status text not null default 'draft',
  bio text,
  expertise jsonb not null default '[]'::jsonb,
  cta jsonb not null default '{}'::jsonb,
  media jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_faqs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  audience text not null,
  category text not null,
  question text not null,
  answer text not null,
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_publish_versions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_slug text not null,
  version_label text not null,
  payload jsonb not null default '{}'::jsonb,
  published_by text,
  published_at timestamptz not null default now()
);

create table if not exists public.cms_audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_slug text not null,
  action text not null,
  actor text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_mail_logs_org_created_at
  on public.support_mail_logs (organization_slug, created_at desc);

create index if not exists idx_tenant_brand_profiles_workspace_slug
  on public.tenant_brand_profiles (workspace_slug);

create index if not exists idx_cms_pages_audience_status
  on public.cms_pages (audience, status);

create index if not exists idx_cms_sections_page_slug_sort_order
  on public.cms_sections (page_slug, sort_order);

create index if not exists idx_cms_promotions_audience_placement
  on public.cms_promotions (audience, placement);

create index if not exists idx_cms_people_profiles_audience_team
  on public.cms_people_profiles (audience, team);

create index if not exists idx_cms_faqs_audience_category
  on public.cms_faqs (audience, category);

create index if not exists idx_cms_publish_versions_entity
  on public.cms_publish_versions (entity_type, entity_slug, published_at desc);

create index if not exists idx_cms_audit_events_entity
  on public.cms_audit_events (entity_type, entity_slug, created_at desc);