begin;

create schema if not exists private;

create or replace function private.current_user_is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.core_tenant_memberships membership
    where membership.user_id = (select auth.uid())::text
      and membership.status = 'active'
      and membership.role_key = 'platform_owner'
  );
$$;

revoke all on function private.current_user_is_platform_owner() from public;
revoke all on function private.current_user_is_platform_owner() from anon;
grant execute on function private.current_user_is_platform_owner() to authenticated, service_role;

create or replace function private.current_user_can_access_tenant(p_tenant_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_is_platform_owner()
    or private.current_user_has_tenant_membership(p_tenant_id);
$$;

revoke all on function private.current_user_can_access_tenant(text) from public;
revoke all on function private.current_user_can_access_tenant(text) from anon;
grant execute on function private.current_user_can_access_tenant(text) to authenticated, service_role;

create table if not exists public.creative_asset_buckets (
  bucket_id text primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tenant_slug text not null,
  bucket_kind text not null check (bucket_kind in ('platform','client')),
  display_name text not null,
  public_access boolean not null default false,
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_at timestamptz not null default now(),
  unique (tenant_id)
);

alter table public.creative_asset_buckets enable row level security;
revoke all on public.creative_asset_buckets from anon;
revoke all on public.creative_asset_buckets from authenticated;

create or replace function private.provision_tenant_asset_bucket(p_tenant_id uuid)
returns text
language plpgsql
security definer
set search_path = 'pg_catalog'
as $$
declare
  v_slug text;
  v_display_name text;
  v_bucket_id text;
  v_kind text;
begin
  select tenant.slug, coalesce(nullif(tenant.display_name, ''), nullif(tenant.legal_name, ''), tenant.slug)
    into v_slug, v_display_name
  from public.tenants tenant
  where tenant.id = p_tenant_id;

  if v_slug is null then
    raise exception 'tenant not found for asset bucket provisioning';
  end if;

  v_slug := trim(both '-' from regexp_replace(lower(v_slug), '[^a-z0-9-]+', '-', 'g'));
  if v_slug = '' then
    raise exception 'tenant slug cannot produce a safe storage bucket id';
  end if;

  if v_slug = 'oye-imagine' then
    v_bucket_id := 'oyeimagine-assets';
    v_kind := 'platform';
  else
    v_bucket_id := 'client-' || v_slug || '-assets';
    v_kind := 'client';
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    v_bucket_id,
    v_bucket_id,
    false,
    536870912,
    array[
      'image/jpeg','image/png','image/webp','image/gif','image/avif','image/svg+xml',
      'video/mp4','video/webm','video/quicktime',
      'audio/mpeg','audio/wav','audio/ogg','audio/mp4',
      'application/pdf','application/json','text/plain'
    ]::text[]
  )
  on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

  insert into public.creative_asset_buckets (
    bucket_id, tenant_id, tenant_slug, bucket_kind, display_name, public_access, status
  )
  values (
    v_bucket_id, p_tenant_id, v_slug, v_kind, v_display_name, false, 'active'
  )
  on conflict (tenant_id) do update
  set tenant_slug = excluded.tenant_slug,
      display_name = excluded.display_name,
      public_access = false,
      status = 'active';

  return v_bucket_id;
end;
$$;

revoke all on function private.provision_tenant_asset_bucket(uuid) from public;
revoke all on function private.provision_tenant_asset_bucket(uuid) from anon;
revoke all on function private.provision_tenant_asset_bucket(uuid) from authenticated;
grant execute on function private.provision_tenant_asset_bucket(uuid) to service_role;

create or replace function private.provision_tenant_asset_bucket_trigger()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog'
as $$
begin
  perform private.provision_tenant_asset_bucket(new.id);
  return new;
end;
$$;

revoke all on function private.provision_tenant_asset_bucket_trigger() from public;
revoke all on function private.provision_tenant_asset_bucket_trigger() from anon;
revoke all on function private.provision_tenant_asset_bucket_trigger() from authenticated;

drop trigger if exists trg_tenants_provision_asset_bucket on public.tenants;
create trigger trg_tenants_provision_asset_bucket
after insert on public.tenants
for each row execute function private.provision_tenant_asset_bucket_trigger();

-- Provision every tenant that already exists. At the current production baseline
-- this creates the Oye corporate bucket and the Neejee client bucket.
select private.provision_tenant_asset_bucket(tenant.id)
from public.tenants tenant;

create table if not exists public.creative_assets (
  asset_id text primary key,
  tenant_id text not null,
  brand_id text,
  workspace_id text,
  campaign_id text,
  parent_asset_id text references public.creative_assets(asset_id) on delete set null,
  source_generation_job_id text,
  storage_bucket text not null references public.creative_asset_buckets(bucket_id),
  storage_path text not null,
  asset_kind text not null check (asset_kind in ('image','video','audio','document','carousel','other')),
  purpose text not null default 'content',
  channel text,
  mime_type text not null,
  sha256 text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  title text,
  alt_text text,
  caption text,
  status text not null default 'draft' check (status in ('draft','generated','review','approved','rejected','publishing_ready','archived')),
  approved_by uuid,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (storage_bucket, storage_path)
);

create table if not exists public.creative_asset_versions (
  version_id text primary key,
  asset_id text not null references public.creative_assets(asset_id) on delete cascade,
  tenant_id text not null,
  version_number integer not null check (version_number > 0),
  storage_bucket text not null references public.creative_asset_buckets(bucket_id),
  storage_path text not null,
  mime_type text not null,
  sha256 text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  transformation jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (asset_id, version_number),
  unique (storage_bucket, storage_path)
);

create table if not exists public.creative_asset_rights (
  rights_id text primary key,
  asset_id text not null references public.creative_assets(asset_id) on delete cascade,
  tenant_id text not null,
  asset_owner text,
  source text,
  usage_rights text,
  territory text,
  channel_permissions jsonb not null default '[]'::jsonb,
  valid_from timestamptz,
  valid_until timestamptz,
  talent_release_ref text,
  music_licence_ref text,
  restrictions jsonb not null default '[]'::jsonb,
  ai_generation_status text not null default 'unknown' check (ai_generation_status in ('unknown','human','ai_generated','ai_assisted')),
  rights_status text not null default 'unknown' check (rights_status in ('unknown','cleared','restricted','expired')),
  licence_document_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creative_generation_jobs (
  generation_job_id text primary key,
  tenant_id text not null,
  brand_id text,
  workspace_id text,
  campaign_id text,
  output_asset_id text references public.creative_assets(asset_id) on delete set null,
  task_key text not null check (task_key in ('creative.brief.generate','creative.copy.generate','creative.image.generate','creative.video.generate','creative.asset.qa','creative.derive')),
  provider_key text not null,
  model_key text not null,
  external_job_id text,
  idempotency_key text not null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  prompt_template_key text,
  prompt_template_version text,
  prompt_hash text,
  input_refs jsonb not null default '[]'::jsonb,
  request_settings jsonb not null default '{}'::jsonb,
  moderation_result jsonb not null default '{}'::jsonb,
  output_refs jsonb not null default '[]'::jsonb,
  estimated_cost_usd numeric(14,6) check (estimated_cost_usd is null or estimated_cost_usd >= 0),
  actual_cost_usd numeric(14,6) check (actual_cost_usd is null or actual_cost_usd >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  safe_error_code text,
  safe_error_message text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

alter table public.creative_assets
  drop constraint if exists creative_assets_source_generation_job_id_fkey;
alter table public.creative_assets
  add constraint creative_assets_source_generation_job_id_fkey
  foreign key (source_generation_job_id)
  references public.creative_generation_jobs(generation_job_id)
  on delete set null
  deferrable initially deferred;

create table if not exists public.creative_generation_limits (
  limit_id text primary key,
  tenant_id text not null,
  workspace_id text,
  period text not null default 'monthly' check (period in ('daily','monthly')),
  max_jobs integer check (max_jobs is null or max_jobs >= 0),
  max_cost_usd numeric(14,4) check (max_cost_usd is null or max_cost_usd >= 0),
  max_video_seconds integer check (max_video_seconds is null or max_video_seconds >= 0),
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creative_buckets_tenant on public.creative_asset_buckets (tenant_id, status);
create index if not exists idx_creative_assets_tenant_workspace_status_created on public.creative_assets (tenant_id, workspace_id, status, created_at desc) where deleted_at is null;
create index if not exists idx_creative_assets_tenant_kind_channel_created on public.creative_assets (tenant_id, asset_kind, channel, created_at desc) where deleted_at is null;
create index if not exists idx_creative_asset_versions_tenant_asset_version on public.creative_asset_versions (tenant_id, asset_id, version_number desc);
create index if not exists idx_creative_asset_rights_tenant_asset on public.creative_asset_rights (tenant_id, asset_id, valid_until);
create index if not exists idx_creative_generation_jobs_tenant_status_created on public.creative_generation_jobs (tenant_id, status, created_at desc);
create index if not exists idx_creative_generation_jobs_external on public.creative_generation_jobs (provider_key, external_job_id) where external_job_id is not null;
create index if not exists idx_creative_generation_limits_tenant_workspace on public.creative_generation_limits (tenant_id, workspace_id, enabled);

create or replace function private.set_creative_updated_at()
returns trigger language plpgsql security definer set search_path = 'pg_catalog' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function private.set_creative_updated_at() from public;
revoke all on function private.set_creative_updated_at() from anon;
grant execute on function private.set_creative_updated_at() to authenticated, service_role;

create or replace function private.enforce_creative_bucket_alignment()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog'
as $$
begin
  if not exists (
    select 1 from public.creative_asset_buckets bucket_registry
    where bucket_registry.bucket_id = new.storage_bucket
      and bucket_registry.tenant_id::text = new.tenant_id
      and bucket_registry.status = 'active'
  ) then
    raise exception 'creative asset bucket does not belong to tenant';
  end if;

  if split_part(new.storage_path, '/', 1) not in ('brand-assets','generated','campaigns','exports','rights','imports') then
    raise exception 'creative asset path root is not allowed';
  end if;

  return new;
end;
$$;
revoke all on function private.enforce_creative_bucket_alignment() from public;
revoke all on function private.enforce_creative_bucket_alignment() from anon;
grant execute on function private.enforce_creative_bucket_alignment() to authenticated, service_role;

create or replace function private.enforce_creative_publish_approval()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog'
as $$
begin
  if new.status = 'publishing_ready' and (new.approved_at is null or new.approved_by is null) then
    raise exception 'creative asset must be approved before publishing_ready';
  end if;

  if new.status = 'publishing_ready' and exists (
    select 1 from public.creative_asset_rights rights
    where rights.asset_id = new.asset_id
      and (rights.rights_status = 'expired' or (rights.valid_until is not null and rights.valid_until <= now()))
  ) then
    raise exception 'creative asset rights have expired';
  end if;

  return new;
end;
$$;
revoke all on function private.enforce_creative_publish_approval() from public;
revoke all on function private.enforce_creative_publish_approval() from anon;
grant execute on function private.enforce_creative_publish_approval() to authenticated, service_role;

drop trigger if exists trg_creative_assets_updated_at on public.creative_assets;
create trigger trg_creative_assets_updated_at before update on public.creative_assets for each row execute function private.set_creative_updated_at();
drop trigger if exists trg_creative_assets_bucket_alignment on public.creative_assets;
create trigger trg_creative_assets_bucket_alignment before insert or update on public.creative_assets for each row execute function private.enforce_creative_bucket_alignment();
drop trigger if exists trg_creative_assets_publish_approval on public.creative_assets;
create trigger trg_creative_assets_publish_approval before insert or update on public.creative_assets for each row execute function private.enforce_creative_publish_approval();
drop trigger if exists trg_creative_asset_rights_updated_at on public.creative_asset_rights;
create trigger trg_creative_asset_rights_updated_at before update on public.creative_asset_rights for each row execute function private.set_creative_updated_at();
drop trigger if exists trg_creative_generation_jobs_updated_at on public.creative_generation_jobs;
create trigger trg_creative_generation_jobs_updated_at before update on public.creative_generation_jobs for each row execute function private.set_creative_updated_at();
drop trigger if exists trg_creative_generation_limits_updated_at on public.creative_generation_limits;
create trigger trg_creative_generation_limits_updated_at before update on public.creative_generation_limits for each row execute function private.set_creative_updated_at();

alter table public.creative_assets enable row level security;
alter table public.creative_asset_versions enable row level security;
alter table public.creative_asset_rights enable row level security;
alter table public.creative_generation_jobs enable row level security;
alter table public.creative_generation_limits enable row level security;

revoke all on public.creative_assets from anon, authenticated;
revoke all on public.creative_asset_versions from anon, authenticated;
revoke all on public.creative_asset_rights from anon, authenticated;
revoke all on public.creative_generation_jobs from anon, authenticated;
revoke all on public.creative_generation_limits from anon, authenticated;

insert into public.core_ai_providers (provider_key, provider_type, display_name, enabled, config)
values
  ('openai_image','image','OpenAI Image',true,'{"credentialEnv":"OPENAI_API_KEY","supportsAsync":false}'::jsonb),
  ('openai_video','video','OpenAI Video',true,'{"credentialEnv":"OPENAI_API_KEY","supportsAsync":true}'::jsonb),
  ('fal_video','video','fal.ai Video',true,'{"credentialEnv":"FAL_KEY","supportsAsync":true}'::jsonb)
on conflict (provider_key) do update
set provider_type=excluded.provider_type,display_name=excluded.display_name,enabled=excluded.enabled,config=excluded.config,updated_at=now();

insert into public.core_ai_task_routes (route_id, task_key, primary_provider_key, fallback_provider_key, max_cost_usd, latency_slo_ms, policy, enabled)
values
  ('route_creative_brief','creative.brief.generate','anthropic','openai',1.5000,20000,'{"brandLocked":true,"requiresGrounding":true}'::jsonb,true),
  ('route_creative_asset_qa','creative.asset.qa','anthropic','openai',0.7500,15000,'{"brandLocked":true,"requiresGrounding":true}'::jsonb,true),
  ('route_creative_image','creative.image.generate','fal','openai_image',2.5000,120000,'{"brandLocked":true,"requiresApproval":true}'::jsonb,true),
  ('route_creative_video','creative.video.generate','fal_video','openai_video',15.0000,900000,'{"brandLocked":true,"requiresApproval":true,"asynchronous":true}'::jsonb,true)
on conflict (task_key) do update
set primary_provider_key=excluded.primary_provider_key,fallback_provider_key=excluded.fallback_provider_key,max_cost_usd=excluded.max_cost_usd,latency_slo_ms=excluded.latency_slo_ms,policy=excluded.policy,enabled=excluded.enabled,updated_at=now();

commit;
