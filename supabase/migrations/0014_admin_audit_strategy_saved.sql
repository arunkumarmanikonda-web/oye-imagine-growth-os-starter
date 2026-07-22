do $$
declare
  v_constraint_name text;
  v_actions text;
begin
  select c.conname
    into v_constraint_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'admin_audit_events'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ilike '%action%'
  order by c.conname
  limit 1;

  if v_constraint_name is not null then
    execute format(
      'alter table public.admin_audit_events drop constraint %I',
      v_constraint_name
    );
  end if;

  select string_agg(quote_literal(action), ', ' order by action)
    into v_actions
  from (
    select distinct action from public.admin_audit_events
    union
    select 'admin_workspace_strategy_saved'
  ) actions;

  execute
    'alter table public.admin_audit_events add constraint admin_audit_events_action_check ' ||
    'check (action = any (array[' || v_actions || ']))';
end $$;