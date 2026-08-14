begin;

alter table public.core_role_definitions enable row level security;
alter table public.core_tenant_memberships enable row level security;
alter table public.core_feature_flags enable row level security;
alter table public.core_tenant_feature_entitlements enable row level security;
alter table public.core_approval_policies enable row level security;
alter table public.core_ai_providers enable row level security;
alter table public.core_ai_task_routes enable row level security;

revoke all on public.core_role_definitions from anon;
revoke all on public.core_tenant_memberships from anon;
revoke all on public.core_feature_flags from anon;
revoke all on public.core_tenant_feature_entitlements from anon;
revoke all on public.core_approval_policies from anon;
revoke all on public.core_ai_providers from anon;
revoke all on public.core_ai_task_routes from anon;

revoke insert, update, delete on public.core_role_definitions from authenticated;
revoke insert, update, delete on public.core_tenant_memberships from authenticated;
revoke insert, update, delete on public.core_feature_flags from authenticated;
revoke insert, update, delete on public.core_tenant_feature_entitlements from authenticated;
revoke insert, update, delete on public.core_approval_policies from authenticated;
revoke insert, update, delete on public.core_ai_providers from authenticated;
revoke insert, update, delete on public.core_ai_task_routes from authenticated;

grant select on public.core_role_definitions to authenticated;
grant select on public.core_tenant_memberships to authenticated;
grant select on public.core_feature_flags to authenticated;
grant select on public.core_tenant_feature_entitlements to authenticated;
grant select on public.core_approval_policies to authenticated;

-- Memberships keep stable control-plane identifiers while metadata maps them to
-- the operational UUID identifiers already used by existing production tables.
-- Authorization helpers accept either form so legacy/commercial rows can be
-- protected without forcing a risky whole-database identifier rewrite.
create or replace function private.current_user_has_tenant_membership(p_tenant_id text)
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
      and (
        membership.tenant_id = p_tenant_id
        or membership.metadata ->> 'operationalTenantId' = p_tenant_id
      )
  );
$$;

revoke all on function private.current_user_has_tenant_membership(text) from public;
revoke all on function private.current_user_has_tenant_membership(text) from anon;
grant execute on function private.current_user_has_tenant_membership(text) to authenticated, service_role;

drop policy if exists core_roles_authenticated_read on public.core_role_definitions;
create policy core_roles_authenticated_read
on public.core_role_definitions for select to authenticated
using (true);

drop policy if exists core_memberships_self_read on public.core_tenant_memberships;
create policy core_memberships_self_read
on public.core_tenant_memberships for select to authenticated
using (user_id = (select auth.uid())::text and status = 'active');

drop policy if exists core_feature_flags_authenticated_read on public.core_feature_flags;
create policy core_feature_flags_authenticated_read
on public.core_feature_flags for select to authenticated
using (true);

drop policy if exists core_entitlements_member_read on public.core_tenant_feature_entitlements;
create policy core_entitlements_member_read
on public.core_tenant_feature_entitlements for select to authenticated
using ((select private.current_user_has_tenant_membership(tenant_id)));

drop policy if exists core_approval_policies_member_read on public.core_approval_policies;
create policy core_approval_policies_member_read
on public.core_approval_policies for select to authenticated
using ((select private.current_user_has_tenant_membership(tenant_id)));

-- Bootstrap the existing verified platform administrator only when both the
-- auth identity and canonical platform role exist. Operational IDs are resolved
-- dynamically from the existing production-style tenant/brand/workspace records.
insert into public.core_tenant_memberships (
  membership_id,
  tenant_id,
  user_id,
  role_key,
  brand_id,
  workspace_id,
  status,
  authority_limits,
  metadata
)
select
  'membership_platform_owner_primary',
  'tenant_oye_internal',
  auth_user.id::text,
  'platform_owner',
  'brand_oye_imagine',
  'workspace_oye_internal',
  'active',
  '{"autonomyMax":"L2"}'::jsonb,
  jsonb_strip_nulls(jsonb_build_object(
    'source', 'verified_auth_bootstrap',
    'purpose', 'initial platform owner',
    'operationalTenantId', (
      select tenant.id::text
      from public.tenants tenant
      where tenant.slug = 'oye-imagine'
      limit 1
    ),
    'operationalBrandId', (
      select brand.id::text
      from public.brands brand
      join public.tenants tenant on tenant.id = brand.tenant_id
      where tenant.slug = 'oye-imagine'
      order by brand.created_at asc
      limit 1
    ),
    'operationalWorkspaceId', (
      select workspace.id::text
      from public.workspaces workspace
      join public.tenants tenant on tenant.id = workspace.tenant_id
      where tenant.slug = 'oye-imagine'
        and workspace.slug = 'core-platform'
      limit 1
    )
  ))
from auth.users auth_user
where lower(auth_user.email) = lower('admin@oyeimagine.com')
  and exists (
    select 1 from public.core_role_definitions role_definition
    where role_definition.role_key = 'platform_owner'
  )
on conflict (membership_id) do update
set user_id = excluded.user_id,
    role_key = excluded.role_key,
    brand_id = excluded.brand_id,
    workspace_id = excluded.workspace_id,
    status = 'active',
    metadata = excluded.metadata,
    updated_at = now();

commit;
