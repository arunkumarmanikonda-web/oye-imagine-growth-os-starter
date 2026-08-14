begin;

update public.core_role_definitions
set permissions = case role_key
  when 'tenant_admin' then '["tenant.*","brand.*","workspace.*","content.*","creative.*","campaign.*","approval.*","reporting.*"]'::jsonb
  when 'brand_manager' then '["brand.view","brand.update","workspace.view","content.*","creative.*","campaign.*","reporting.view"]'::jsonb
  when 'content_approver' then '["content.view","content.approve","creative.view","creative.update","creative.approve"]'::jsonb
  when 'analyst' then '["analytics.view","reporting.view","campaign.view","content.view","creative.view"]'::jsonb
  when 'viewer' then '["brand.view","workspace.view","reporting.view","creative.view"]'::jsonb
  else permissions
end,
updated_at = now()
where role_key in ('tenant_admin','brand_manager','content_approver','analyst','viewer');

create or replace function private.has_tenant_permission(p_tenant_id text, p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.core_tenant_memberships membership
    join public.core_role_definitions role_definition
      on role_definition.role_key = membership.role_key
    where membership.user_id = (select auth.uid())::text
      and membership.status = 'active'
      and (
        membership.role_key = 'platform_owner'
        or membership.tenant_id = p_tenant_id
        or membership.metadata ->> 'operationalTenantId' = p_tenant_id
      )
      and (
        role_definition.permissions ? '*'
        or role_definition.permissions ? p_permission
        or role_definition.permissions ? (split_part(p_permission, '.', 1) || '.*')
      )
  );
$$;

revoke all on function private.has_tenant_permission(text, text) from public;
revoke all on function private.has_tenant_permission(text, text) from anon;
grant execute on function private.has_tenant_permission(text, text) to authenticated, service_role;

create or replace function private.enforce_creative_asset_authority()
returns trigger
language plpgsql
security definer
set search_path = 'pg_catalog'
as $$
declare
  caller_role text := coalesce((select auth.role()), '');
  caller_uid uuid := (select auth.uid());
  can_approve boolean := false;
begin
  if caller_role = 'service_role' then
    return new;
  end if;

  can_approve := private.has_tenant_permission(new.tenant_id, 'creative.approve');

  if tg_op = 'INSERT' then
    if not private.has_tenant_permission(new.tenant_id, 'creative.create') then
      raise exception 'creative.create permission required';
    end if;

    if new.status in ('approved','rejected','publishing_ready') and not can_approve then
      raise exception 'creative.approve permission required for approval state';
    end if;
  else
    if not private.has_tenant_permission(new.tenant_id, 'creative.update') then
      raise exception 'creative.update permission required';
    end if;

    if old.status in ('approved','publishing_ready') and not can_approve then
      raise exception 'approved creative assets require creative.approve permission to modify';
    end if;

    if new.status is distinct from old.status
      and new.status in ('approved','rejected','publishing_ready')
      and not can_approve then
      raise exception 'creative.approve permission required for approval transition';
    end if;
  end if;

  if new.status = 'approved' then
    if new.approved_by is null then new.approved_by := caller_uid; end if;
    if new.approved_at is null then new.approved_at := now(); end if;
  end if;

  if new.status = 'publishing_ready' and (new.approved_by is null or new.approved_at is null) then
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

revoke all on function private.enforce_creative_asset_authority() from public;
revoke all on function private.enforce_creative_asset_authority() from anon;
grant execute on function private.enforce_creative_asset_authority() to authenticated, service_role;

drop trigger if exists trg_creative_assets_publish_approval on public.creative_assets;
drop trigger if exists trg_creative_assets_authority on public.creative_assets;
create trigger trg_creative_assets_authority
before insert or update on public.creative_assets
for each row execute function private.enforce_creative_asset_authority();

-- Registry is readable only for buckets the caller is entitled to use.
grant select on public.creative_asset_buckets to authenticated;
drop policy if exists creative_asset_buckets_permission_select on public.creative_asset_buckets;
create policy creative_asset_buckets_permission_select
on public.creative_asset_buckets for select to authenticated
using ((select private.has_tenant_permission(tenant_id::text, 'creative.view')));

-- Assets can be created/updated by entitled users, but cannot be directly deleted.
grant select, insert, update on public.creative_assets to authenticated;
grant select on public.creative_asset_versions to authenticated;
grant select, insert, update on public.creative_asset_rights to authenticated;
grant select on public.creative_generation_jobs to authenticated;
grant select on public.creative_generation_limits to authenticated;

revoke insert, update, delete on public.creative_generation_jobs from authenticated;
revoke insert, update, delete on public.creative_asset_versions from authenticated;
revoke delete on public.creative_asset_rights from authenticated;
revoke delete on public.creative_assets from authenticated;

create policy creative_assets_permission_select
on public.creative_assets for select to authenticated
using ((select private.has_tenant_permission(tenant_id, 'creative.view')));
create policy creative_assets_permission_insert
on public.creative_assets for insert to authenticated
with check ((select private.has_tenant_permission(tenant_id, 'creative.create')));
create policy creative_assets_permission_update
on public.creative_assets for update to authenticated
using ((select private.has_tenant_permission(tenant_id, 'creative.update')))
with check ((select private.has_tenant_permission(tenant_id, 'creative.update')));

create policy creative_asset_versions_permission_select
on public.creative_asset_versions for select to authenticated
using ((select private.has_tenant_permission(tenant_id, 'creative.view')));

create policy creative_asset_rights_permission_select
on public.creative_asset_rights for select to authenticated
using ((select private.has_tenant_permission(tenant_id, 'creative.view')));
create policy creative_asset_rights_permission_insert
on public.creative_asset_rights for insert to authenticated
with check ((select private.has_tenant_permission(tenant_id, 'creative.update')));
create policy creative_asset_rights_permission_update
on public.creative_asset_rights for update to authenticated
using ((select private.has_tenant_permission(tenant_id, 'creative.update')))
with check ((select private.has_tenant_permission(tenant_id, 'creative.update')));

create policy creative_generation_jobs_permission_select
on public.creative_generation_jobs for select to authenticated
using ((select private.has_tenant_permission(tenant_id, 'creative.view')));

create policy creative_generation_limits_permission_select
on public.creative_generation_limits for select to authenticated
using ((select private.has_tenant_permission(tenant_id, 'creative.generate')));

-- Supabase Storage is private. Access follows the registry rather than trusting
-- a caller-supplied path prefix. The first path segment must be a governed root.
drop policy if exists creative_assets_storage_select on storage.objects;
drop policy if exists creative_assets_storage_insert on storage.objects;
drop policy if exists creative_assets_storage_update on storage.objects;
drop policy if exists creative_assets_storage_delete on storage.objects;

create policy creative_assets_storage_select
on storage.objects for select to authenticated
using (
  exists (
    select 1 from public.creative_asset_buckets bucket_registry
    where bucket_registry.bucket_id = storage.objects.bucket_id
      and bucket_registry.status = 'active'
      and private.has_tenant_permission(bucket_registry.tenant_id::text, 'creative.view')
  )
);

create policy creative_assets_storage_insert
on storage.objects for insert to authenticated
with check (
  (storage.foldername(name))[1] in ('brand-assets','generated','campaigns','exports','rights','imports')
  and exists (
    select 1 from public.creative_asset_buckets bucket_registry
    where bucket_registry.bucket_id = storage.objects.bucket_id
      and bucket_registry.status = 'active'
      and private.has_tenant_permission(bucket_registry.tenant_id::text, 'creative.create')
  )
);

create policy creative_assets_storage_update
on storage.objects for update to authenticated
using (
  exists (
    select 1 from public.creative_asset_buckets bucket_registry
    where bucket_registry.bucket_id = storage.objects.bucket_id
      and bucket_registry.status = 'active'
      and private.has_tenant_permission(bucket_registry.tenant_id::text, 'creative.update')
  )
)
with check (
  (storage.foldername(name))[1] in ('brand-assets','generated','campaigns','exports','rights','imports')
  and exists (
    select 1 from public.creative_asset_buckets bucket_registry
    where bucket_registry.bucket_id = storage.objects.bucket_id
      and bucket_registry.status = 'active'
      and private.has_tenant_permission(bucket_registry.tenant_id::text, 'creative.update')
  )
);

create policy creative_assets_storage_delete
on storage.objects for delete to authenticated
using (
  exists (
    select 1 from public.creative_asset_buckets bucket_registry
    where bucket_registry.bucket_id = storage.objects.bucket_id
      and bucket_registry.status = 'active'
      and private.has_tenant_permission(bucket_registry.tenant_id::text, 'creative.delete')
  )
);

commit;
