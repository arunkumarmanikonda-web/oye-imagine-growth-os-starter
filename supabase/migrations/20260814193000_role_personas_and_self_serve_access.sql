begin;

insert into public.core_role_definitions (role_key, role_name, role_scope, permissions, system_role, updated_at)
values
  ('account_manager','Account Manager','workspace','["brand.view","workspace.view","content.*","creative.*","campaign.*","approval.*","reporting.view","marketplace.view"]'::jsonb,true,now()),
  ('designer','Designer / Creative','workspace','["brand.view","workspace.view","content.view","content.update","creative.*","campaign.view"]'::jsonb,true,now()),
  ('digital_marketer','Digital Marketer','workspace','["brand.view","workspace.view","content.*","creative.*","campaign.*","analytics.view","reporting.view","integration.view"]'::jsonb,true,now()),
  ('partner_specialist','Partner / Specialist','workspace','["workspace.view","brand.view","content.view","creative.view","creative.update","marketplace.view","marketplace.update"]'::jsonb,true,now()),
  ('client_operator','Client Operator','workspace','["brand.view","workspace.view","campaign.view","content.view","creative.view","analytics.view","reporting.view","finance.view","approval.view"]'::jsonb,true,now())
on conflict (role_key) do update set
  role_name = excluded.role_name,
  role_scope = excluded.role_scope,
  permissions = excluded.permissions,
  system_role = excluded.system_role,
  updated_at = now();

commit;
