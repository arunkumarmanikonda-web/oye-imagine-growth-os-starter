begin;

update public.core_role_definitions
set permissions = case
  when permissions @> '["ai.search"]'::jsonb then permissions
  else permissions || '["ai.search"]'::jsonb
end,
updated_at = now()
where role_key <> 'platform_owner';

insert into public.core_permission_catalog(permission_key,category,label,description,risk_class)
values ('ai.search','AI','Ask Oye','Use permission-aware bilingual global search and command assistance.','low')
on conflict(permission_key) do update set category=excluded.category,label=excluded.label,description=excluded.description,risk_class=excluded.risk_class,updated_at=now();

commit;
