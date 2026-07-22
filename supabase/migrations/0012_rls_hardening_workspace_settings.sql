alter table public.workspace_settings enable row level security;
alter table public.workspace_setting_versions enable row level security;

drop policy if exists workspace_settings_service_role_all on public.workspace_settings;
create policy workspace_settings_service_role_all
on public.workspace_settings
for all
to service_role
using (true)
with check (true);

drop policy if exists workspace_setting_versions_service_role_all on public.workspace_setting_versions;
create policy workspace_setting_versions_service_role_all
on public.workspace_setting_versions
for all
to service_role
using (true)
with check (true);

drop policy if exists workspace_settings_authenticated_read on public.workspace_settings;
create policy workspace_settings_authenticated_read
on public.workspace_settings
for select
to authenticated
using (false);

drop policy if exists workspace_setting_versions_authenticated_read on public.workspace_setting_versions;
create policy workspace_setting_versions_authenticated_read
on public.workspace_setting_versions
for select
to authenticated
using (false);