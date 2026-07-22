do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'admin_audit_events_action_check'
      and conrelid = 'public.admin_audit_events'::regclass
  ) then
    alter table public.admin_audit_events
      drop constraint admin_audit_events_action_check;
  end if;

  alter table public.admin_audit_events
    add constraint admin_audit_events_action_check
    check (
      action = any (
        array[
          'admin_workspace_note_saved',
          'admin_workspace_note_archived',
          'admin_workspace_note_restored',
          'admin_workspace_setting_saved',
          'admin_workspace_setting_restored',
          'admin_workspace_exported',
          'admin_workspace_onboarding_saved',
          'admin_workspace_strategy_saved',
          'admin_workspace_execution_saved'
        ]::text[]
      )
    );
exception
  when duplicate_object then
    null;
end

$$;