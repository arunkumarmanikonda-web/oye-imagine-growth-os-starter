create or replace function public.release_schema_evidence()
returns jsonb
language plpgsql
security definer
stable
set search_path = pg_catalog, public
as $function$
declare
  v_result jsonb;
begin
  if to_regclass('supabase_migrations.schema_migrations') is null then
    return jsonb_build_object(
      'ledgerAvailable', false,
      'migrationCount', null,
      'lastMigrationVersion', null,
      'lastMigrationName', null
    );
  end if;

  execute $sql$
    select jsonb_build_object(
      'ledgerAvailable', true,
      'migrationCount', count(*),
      'lastMigrationVersion', (array_agg(version order by version desc))[1],
      'lastMigrationName', (array_agg(name order by version desc))[1]
    )
    from supabase_migrations.schema_migrations
  $sql$
  into v_result;

  return v_result;
end;
$function$;

revoke all on function public.release_schema_evidence() from public, anon, authenticated;
grant execute on function public.release_schema_evidence() to service_role;
