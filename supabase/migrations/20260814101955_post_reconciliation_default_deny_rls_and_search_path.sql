do $$
declare r record;
begin
  for r in
    select n.nspname as schema_name, c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p') and not c.relrowsecurity
  loop
    execute format('alter table %I.%I enable row level security', r.schema_name, r.table_name);
  end loop;
end $$;

alter function public.tg_batch3_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch3b_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch3_operating_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch4a_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch4b_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch4_governance_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch5a_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch5b_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_batch5_closeout_set_updated_at() set search_path = pg_catalog, public;
