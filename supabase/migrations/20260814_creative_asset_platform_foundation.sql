begin;

create schema if not exists private;

create or replace function private.has_active_tenant_membership(p_tenant_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.core_tenant_memberships membership
    where membership.tenant_id = p_tenant_id
      and membership.user_id = (select auth.uid())::text
      and membership.status = 'active'
  );
$$;

revoke all on function private.has_active_tenant_membership(text) from public;
revoke all on function private.has_active_tenant_membership(text) from anon;
grant execute on function private.has_active_tenant_membership(text) to authenticated, service_role;

create table if not exists public.creative_assets (
  asset_id text primary key,
  tenant_id text not null,
  brand_id text,
  workspace_id text,
  campaign_id text,
  parent_asset_id text references public.creative_assets(asset_id) on delete set null,
  source_generation_job_id text,
  storage_bucket text not null default 'creative-assets',
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
  storage_bucket text not null default 'creative-assets',
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

create index if not exists idx_creative_assets_tenant_workspace_status_created
  on public.creative_assets (tenant_id, workspace_id, status, created_at desc)
  where deleted_at is null;
create index if not exists idx_creative_assets_tenant_kind_channel_created
  on public.creative_assets (tenant_id, asset_kind, channel, created_at desc)
  where deleted_at is null;
create index if not exists idx_creative_asset_versions_tenant_asset_version
  on public.creative_asset_versions (tenant_id, asset_id, version_number desc);
create index if not exists idx_creative_generation_jobs_tenant_status_created
  on public.creative_generation_jobs (tenant_id, status, created_at desc);
create index if not exists idx_creative_generation_jobs_external
  on public.creative_generation_jobs (provider_key, external_job_id)
  where external_job_id is not null;
create index if not exists idx_creative_generation_limits_tenant_workspace
  on public.creative_generation_limits (tenant_id, workspace_id, enabled);

create or replace function private.set_creative_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_creative_updated_at() from public;
revoke all on function private.set_creative_updated_at() from anon;
grant execute on function private.set_creative_updated_at() to authenticated, service_role;

create or replace function private.enforce_creative_publish_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'publishing_ready' and (new.approved_at is null or new.approved_by is null) then
    raise exception 'creative asset must be approved before publishing_ready';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_creative_publish_approval() from public;
revoke all on function private.enforce_creative_publish_approval() from anon;
grant execute on function private.enforce_creative_publish_approval() to authenticated, service_role;

drop trigger if exists trg_creative_assets_updated_at on public.creative_assets;
create trigger trg_creative_assets_updated_at
before update on public.creative_assets
for each row execute function private.set_creative_updated_at();

drop trigger if exists trg_creative_assets_publish_approval on public.creative_assets;
create trigger trg_creative_assets_publish_approval
before insert or update on public.creative_assets
for each row execute function private.enforce_creative_publish_approval();

drop trigger if exists trg_creative_generation_jobs_updated_at on public.creative_generation_jobs;
create trigger trg_creative_generation_jobs_updated_at
before update on public.creative_generation_jobs
for each row execute function private.set_creative_updated_at();

drop trigger if exists trg_creative_generation_limits_updated_at on public.creative_generation_limits;
create trigger trg_creative_generation_limits_updated_at
before update on public.creative_generation_limits
for each row execute function private.set_creative_updated_at();

alter table public.creative_assets enable row level security;
alter table public.creative_asset_versions enable row level security;
alter table public.creative_generation_jobs enable row level security;
alter table public.creative_generation_limits enable row level security;

revoke all on public.creative_assets from anon;
revoke all on public.creative_asset_versions from anon;
revoke all on public.creative_generation_jobs from anon;
revoke all on public.creative_generation_limits from anon;

grant select, insert, update, delete on public.creative_assets to authenticated;
grant select, insert, update, delete on public.creative_asset_versions to authenticated;
grant select, insert, update on public.creative_generation_jobs to authenticated;
grant select on public.creative_generation_limits to authenticated;

create policy creative_assets_member_select
on public.creative_assets for select to authenticated
using ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_assets_member_insert
on public.creative_assets for insert to authenticated
with check ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_assets_member_update
on public.creative_assets for update to authenticated
using ((select private.has_active_tenant_membership(tenant_id)))
with check ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_assets_member_delete
on public.creative_assets for delete to authenticated
using ((select private.has_active_tenant_membership(tenant_id)));

create policy creative_asset_versions_member_select
on public.creative_asset_versions for select to authenticated
using ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_asset_versions_member_insert
on public.creative_asset_versions for insert to authenticated
with check ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_asset_versions_member_update
on public.creative_asset_versions for update to authenticated
using ((select private.has_active_tenant_membership(tenant_id)))
with check ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_asset_versions_member_delete
on public.creative_asset_versions for delete to authenticated
using ((select private.has_active_tenant_membership(tenant_id)));

create policy creative_generation_jobs_member_select
on public.creative_generation_jobs for select to authenticated
using ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_generation_jobs_member_insert
on public.creative_generation_jobs for insert to authenticated
with check ((select private.has_active_tenant_membership(tenant_id)));
create policy creative_generation_jobs_member_update
on public.creative_generation_jobs for update to authenticated
using ((select private.has_active_tenant_membership(tenant_id)))
with check ((select private.has_active_tenant_membership(tenant_id)));

create policy creative_generation_limits_member_select
on public.creative_generation_limits for select to authenticated
using ((select private.has_active_tenant_membership(tenant_id)));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creative-assets',
  'creative-assets',
  false,
  536870912,
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/avif','image/svg+xml',
    'video/mp4','video/webm','video/quicktime',
    'audio/mpeg','audio/wav','audio/ogg','audio/mp4',
    'application/pdf','application/json'
  ]::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists creative_assets_storage_select on storage.objects;
create policy creative_assets_storage_select
on storage.objects for select to authenticated
using (
  bucket_id = 'creative-assets'
  and (select private.has_active_tenant_membership((storage.foldername(name))[1]))
);

drop policy if exists creative_assets_storage_insert on storage.objects;
create policy creative_assets_storage_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'creative-assets'
  and (select private.has_active_tenant_membership((storage.foldername(name))[1]))
);

drop policy if exists creative_assets_storage_update on storage.objects;
create policy creative_assets_storage_update
on storage.objects for update to authenticated
using (
  bucket_id = 'creative-assets'
  and (select private.has_active_tenant_membership((storage.foldername(name))[1]))
)
with check (
  bucket_id = 'creative-assets'
  and (select private.has_active_tenant_membership((storage.foldername(name))[1]))
);

drop policy if exists creative_assets_storage_delete on storage.objects;
create policy creative_assets_storage_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'creative-assets'
  and (select private.has_active_tenant_membership((storage.foldername(name))[1]))
);

insert into public.core_ai_providers (provider_key, provider_type, display_name, enabled, config)
values
  ('openai_image','image','OpenAI Image',true,'{"credentialEnv":"OPENAI_API_KEY","supportsAsync":false}'::jsonb),
  ('openai_video','video','OpenAI Video',true,'{"credentialEnv":"OPENAI_API_KEY","supportsAsync":true}'::jsonb),
  ('fal_video','video','fal.ai Video',true,'{"credentialEnv":"FAL_KEY","supportsAsync":true}'::jsonb)
on conflict (provider_key) do update
set provider_type = excluded.provider_type,
    display_name = excluded.display_name,
    enabled = excluded.enabled,
    config = excluded.config,
    updated_at = now();

insert into public.core_ai_task_routes (route_id, task_key, primary_provider_key, fallback_provider_key, max_cost_usd, latency_slo_ms, policy, enabled)
values
  ('route_creative_brief','creative.brief.generate','anthropic','openai',1.5000,20000,'{"brandLocked":true,"requiresGrounding":true}'::jsonb,true),
  ('route_creative_asset_qa','creative.asset.qa','anthropic','openai',0.7500,15000,'{"brandLocked":true,"requiresGrounding":true}'::jsonb,true),
  ('route_creative_image','creative.image.generate','fal','openai_image',2.5000,120000,'{"brandLocked":true,"requiresApproval":true}'::jsonb,true),
  ('route_creative_video','creative.video.generate','fal_video','openai_video',15.0000,900000,'{"brandLocked":true,"requiresApproval":true,"asynchronous":true}'::jsonb,true)
on conflict (task_key) do update
set primary_provider_key = excluded.primary_provider_key,
    fallback_provider_key = excluded.fallback_provider_key,
    max_cost_usd = excluded.max_cost_usd,
    latency_slo_ms = excluded.latency_slo_ms,
    policy = excluded.policy,
    enabled = excluded.enabled,
    updated_at = now();

commit;
