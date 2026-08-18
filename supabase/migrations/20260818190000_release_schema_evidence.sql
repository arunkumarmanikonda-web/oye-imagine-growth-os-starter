create or replace function public.release_schema_evidence()
returns jsonb
language sql
security definer
stable
set search_path = pg_catalog, public
as $$
  select jsonb_build_object(
    'migrationCount', count(*),
    'lastMigrationVersion', (array_agg(version order by version desc))[1],
    'lastMigrationName', (array_agg(name order by version desc))[1]
  )
  from supabase_migrations.schema_migrations;
$$;

revoke all on function public.release_schema_evidence() from public, anon, authenticated;
grant execute on function public.release_schema_evidence() to service_role;
