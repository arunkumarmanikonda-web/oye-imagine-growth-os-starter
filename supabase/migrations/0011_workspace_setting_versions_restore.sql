alter table public.workspace_setting_versions
drop constraint if exists workspace_setting_versions_action_check;

alter table public.workspace_setting_versions
add constraint workspace_setting_versions_action_check
check (action in ('created','updated','deleted','restored'));