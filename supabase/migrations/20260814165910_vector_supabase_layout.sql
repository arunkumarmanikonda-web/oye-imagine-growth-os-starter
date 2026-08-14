do $$
declare current_schema_name text;
begin
  create schema if not exists extensions;
  select n.nspname into current_schema_name
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'vector';
  if current_schema_name is distinct from 'extensions' then
    execute 'alter extension vector set schema extensions';
  end if;
end $$;

alter role current_user set search_path = public, extensions, pg_catalog;
