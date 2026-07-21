create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid null references public.brands(id) on delete set null,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspaces_tenant_id on public.workspaces(tenant_id);
create index if not exists idx_workspaces_brand_id on public.workspaces(brand_id);
create unique index if not exists uq_workspaces_tenant_slug on public.workspaces(tenant_id, slug);

alter table public.workspaces enable row level security;

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
  has_brand_slug boolean;
  has_brand_tenant boolean;
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
      and table_name = 'brands'
      and column_name = 'slug'
  ) into has_brand_slug;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'brands'
      and column_name = 'tenant_id'
  ) into has_brand_tenant;

  if has_tenant_slug then
    execute 'select id from public.tenants where slug = $1 limit 1'
      into v_tenant_id
      using p_tenant_slug;
  end if;

  if v_tenant_id is null then
    execute 'select id from public.tenants where name = $1 limit 1'
      into v_tenant_id
      using p_tenant_name;
  end if;

  if v_tenant_id is null then
    if has_tenant_slug then
      execute 'insert into public.tenants (name, slug) values ($1, $2) returning id'
        into v_tenant_id
        using p_tenant_name, p_tenant_slug;
    else
      execute 'insert into public.tenants (name) values ($1) returning id'
        into v_tenant_id
        using p_tenant_name;
    end if;
  end if;

  if has_brand_tenant and has_brand_slug then
    execute 'select id from public.brands where tenant_id = $1 and slug = $2 limit 1'
      into v_brand_id
      using v_tenant_id, p_brand_slug;
  elsif has_brand_tenant then
    execute 'select id from public.brands where tenant_id = $1 and name = $2 limit 1'
      into v_brand_id
      using v_tenant_id, p_brand_name;
  elsif has_brand_slug then
    execute 'select id from public.brands where slug = $1 limit 1'
      into v_brand_id
      using p_brand_slug;
  else
    execute 'select id from public.brands where name = $1 limit 1'
      into v_brand_id
      using p_brand_name;
  end if;

  if v_brand_id is null then
    if has_brand_tenant and has_brand_slug then
      execute 'insert into public.brands (tenant_id, name, slug) values ($1, $2, $3) returning id'
        into v_brand_id
        using v_tenant_id, p_brand_name, p_brand_slug;
    elsif has_brand_tenant then
      execute 'insert into public.brands (tenant_id, name) values ($1, $2) returning id'
        into v_brand_id
        using v_tenant_id, p_brand_name;
    elsif has_brand_slug then
      execute 'insert into public.brands (name, slug) values ($1, $2) returning id'
        into v_brand_id
        using p_brand_name, p_brand_slug;
    else
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