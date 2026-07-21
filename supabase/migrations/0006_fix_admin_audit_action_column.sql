create or replace function public.log_admin_audit_event(
  p_event text,
  p_actor_user_id uuid,
  p_actor_email text,
  p_tenant_id uuid default null,
  p_brand_id uuid default null,
  p_workspace_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := gen_random_uuid();
  v_target_type text;
  v_target_id text;
begin
  v_target_type :=
    case
      when p_workspace_id is not null then 'workspace'
      when p_brand_id is not null then 'brand'
      when p_tenant_id is not null then 'tenant'
      else 'admin'
    end;

  v_target_id := coalesce(
    p_workspace_id::text,
    p_brand_id::text,
    p_tenant_id::text,
    p_actor_user_id::text
  );

  insert into public.admin_audit_events (
    id,
    actor_user_id,
    actor_email,
    action,
    target_type,
    target_id,
    tenant_id,
    brand_id,
    workspace_id,
    payload,
    created_at
  )
  values (
    v_id,
    p_actor_user_id,
    p_actor_email,
    p_event,
    v_target_type,
    v_target_id,
    p_tenant_id,
    p_brand_id,
    p_workspace_id,
    coalesce(p_payload, '{}'::jsonb),
    now()
  );

  return v_id;
end;

$$;

grant execute on function public.log_admin_audit_event(text, uuid, text, uuid, uuid, uuid, jsonb) to anon, authenticated, service_role;