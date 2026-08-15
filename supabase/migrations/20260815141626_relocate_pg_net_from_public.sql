-- Keep pg_net extension objects out of the public API-exposed schema.
-- Production dependency checks confirmed no application functions, cron jobs,
-- or database webhook triggers depend on pg_net before this recreation.
-- Generic PostgreSQL CI images may not package Supabase's pg_net extension,
-- so the migration is intentionally a no-op when pg_net is unavailable.

do $$
begin
  if exists (
    select 1
    from pg_available_extensions
    where name = 'pg_net'
  ) then
    drop extension if exists pg_net;
    create extension pg_net schema extensions;
  end if;
end
$$;
