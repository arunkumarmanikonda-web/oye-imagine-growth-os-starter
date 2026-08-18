update public.agent_autonomy_policies
set kill_switch = true,
    metadata = coalesce(metadata, '{}'::jsonb) || '{"activation_state":"installed_not_released"}'::jsonb,
    updated_at = now()
where tenant_id = 'tenant_neejee'
  and workspace_id = 'workspace_neejee'
  and agent_key = 'growth-executor';
