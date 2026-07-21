create or replace function public.bootstrap_seed_platform(
  p_admin_user_id uuid,
  p_tenant_name text,
  p_tenant_slug text,
  p_brand_name text,
  p_brand_slug text,
  p_workspace_name text,
  p_workspace_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_brand_id uuid;
  v_workspace_id uuid;

  has_tenant_slug boolean;
  has_tenant_legal_name boolean;
  has_tenant_display_name boolean;
  has_brand_tenant boolean;
  has_brand_name boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tenants'
      and column_name = 'slug'
  ) into has_tenant_slug;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tenants'
      and column_name = 'legal_name'
  ) into has_tenant_legal_name;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tenants'
      and column_name = 'display_name'
  ) into has_tenant_display_name;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brands'
      and column_name = 'tenant_id'
  ) into has_brand_tenant;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brands'
      and column_name = 'name'
  ) into has_brand_name;

  if has_tenant_slug then
    execute 'select id from public.tenants where slug = $1 limit 1'
      into v_tenant_id
      using p_tenant_slug;
  end if;

  if v_tenant_id is null and has_tenant_display_name then
    execute 'select id from public.tenants where display_name = $1 limit 1'
      into v_tenant_id
      using p_tenant_name;
  end if;

  if v_tenant_id is null and has_tenant_legal_name then
    execute 'select id from public.tenants where legal_name = $1 limit 1'
      into v_tenant_id
      using p_tenant_name;
  end if;

  if v_tenant_id is null then
    if has_tenant_slug and has_tenant_legal_name and has_tenant_display_name then
      execute 'insert into public.tenants (slug, legal_name, display_name) values ($1, $2, $3) returning id'
        into v_tenant_id
        using p_tenant_slug, p_tenant_name, p_tenant_name;
    elsif has_tenant_slug and has_tenant_display_name then
      execute 'insert into public.tenants (slug, display_name) values ($1, $2) returning id'
        into v_tenant_id
        using p_tenant_slug, p_tenant_name;
    elsif has_tenant_slug and has_tenant_legal_name then
      execute 'insert into public.tenants (slug, legal_name) values ($1, $2) returning id'
        into v_tenant_id
        using p_tenant_slug, p_tenant_name;
    elsif has_tenant_display_name then
      execute 'insert into public.tenants (display_name) values ($1) returning id'
        into v_tenant_id
        using p_tenant_name;
    elsif has_tenant_legal_name then
      execute 'insert into public.tenants (legal_name) values ($1) returning id'
        into v_tenant_id
        using p_tenant_name;
    else
      raise exception 'tenants table does not have expected columns';
    end if;
  end if;

  if has_brand_tenant and has_brand_name then
    execute 'select id from public.brands where tenant_id = $1 and name = $2 limit 1'
      into v_brand_id
      using v_tenant_id, p_brand_name;
  elsif has_brand_name then
    execute 'select id from public.brands where name = $1 limit 1'
      into v_brand_id
      using p_brand_name;
  else
    raise exception 'brands table does not have expected columns';
  end if;

  if v_brand_id is null then
    if has_brand_tenant and has_brand_name then
      execute 'insert into public.brands (tenant_id, name) values ($1, $2) returning id'
        into v_brand_id
        using v_tenant_id, p_brand_name;
    elsif has_brand_name then
      execute 'insert into public.brands (name) values ($1) returning id'
        into v_brand_id
        using p_brand_name;
    end if;
  end if;

  select id
    into v_workspace_id
  from public.workspaces
  where tenant_id = v_tenant_id
    and slug = p_workspace_slug
  limit 1;

  if v_workspace_id is null then
    insert into public.workspaces (
      tenant_id,
      brand_id,
      name,
      slug
    )
    values (
      v_tenant_id,
      v_brand_id,
      p_workspace_name,
      p_workspace_slug
    )
    returning id into v_workspace_id;
  end if;

  return jsonb_build_object(
    'tenant_id', v_tenant_id,
    'brand_id', v_brand_id,
    'workspace_id', v_workspace_id,
    'admin_user_id', p_admin_user_id,
    'tenant_name', p_tenant_name,
    'brand_name', p_brand_name,
    'workspace_name', p_workspace_name
  );
end;

$$;