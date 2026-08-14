begin;

alter function public.set_workspace_notes_updated_at() set search_path = pg_catalog, public;
alter function public.tg_workspace_settings_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_commercial_workflow_set_updated_at() set search_path = pg_catalog, public;
alter function public.tg_core_set_updated_at() set search_path = pg_catalog, public;

commit;
