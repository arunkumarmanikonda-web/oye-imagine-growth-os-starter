begin;

insert into public.core_permission_catalog(permission_key,category,label,description,risk_class)
values
  ('commercial.enquiry.view','Commercial','View public enquiries','View inbound Oye !magine public sales and commercial enquiries.','low'),
  ('commercial.enquiry.manage','Commercial','Manage public enquiries','Qualify, assign and update inbound Oye !magine public sales and commercial enquiries.','medium')
on conflict(permission_key) do update set
  category=excluded.category,
  label=excluded.label,
  description=excluded.description,
  risk_class=excluded.risk_class,
  updated_at=now();

update public.core_role_definitions
set permissions = permissions || '["commercial.enquiry.view","commercial.enquiry.manage"]'::jsonb,
    updated_at = now()
where role_key in ('tenant_admin','account_manager')
  and not (permissions @> '["commercial.enquiry.view","commercial.enquiry.manage"]'::jsonb);

update public.core_role_definitions
set permissions = permissions || '["commercial.enquiry.view"]'::jsonb,
    updated_at = now()
where role_key = 'finance_approver'
  and not (permissions @> '["commercial.enquiry.view"]'::jsonb);

commit;