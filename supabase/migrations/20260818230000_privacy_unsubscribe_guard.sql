-- Make public unsubscribe application atomic, workspace-correct and replay-safe.

create or replace function public.apply_public_unsubscribe_guarded(
  p_tenant_id uuid,
  p_workspace_id uuid,
  p_subject_key text,
  p_channel text,
  p_purpose text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_subject_key text := trim(coalesce(p_subject_key, ''));
  v_channel text := lower(trim(coalesce(p_channel, '')));
  v_purpose text := trim(coalesce(p_purpose, ''));
  v_suppression_id uuid;
  v_latest_decision text;
  v_suppression_created boolean := false;
  v_consent_created boolean := false;
begin
  if p_tenant_id is null then
    raise exception 'unsubscribe_tenant_required';
  end if;
  if v_subject_key = '' or v_purpose = '' then
    raise exception 'unsubscribe_fields_required';
  end if;
  if v_channel not in ('email', 'whatsapp', 'sms') then
    raise exception 'unsubscribe_channel_invalid';
  end if;

  -- Serialize the semantic opt-out key so repeated/parallel one-click requests
  -- cannot create duplicate withdrawal events or suppressions.
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_tenant_id::text || '|' ||
      coalesce(p_workspace_id::text, '<null>') || '|' ||
      v_subject_key || '|' || v_channel || '|' || v_purpose,
      0
    )
  );

  select suppression_id
    into v_suppression_id
    from public.privacy_suppressions
   where tenant_id = p_tenant_id
     and subject_key = v_subject_key
     and active = true
     and (
       (
         scope = 'global'
         and channel is null
         and (workspace_id is null or workspace_id is not distinct from p_workspace_id)
       )
       or
       (
         scope = 'channel'
         and channel = v_channel
         and (workspace_id is null or workspace_id is not distinct from p_workspace_id)
       )
     )
   order by suppressed_at desc
   limit 1;

  if v_suppression_id is null then
    insert into public.privacy_suppressions (
      tenant_id,
      workspace_id,
      subject_key,
      channel,
      scope,
      reason,
      source,
      reversible,
      active,
      metadata
    ) values (
      p_tenant_id,
      p_workspace_id,
      v_subject_key,
      v_channel,
      'channel',
      'recipient_opt_out',
      'signed_unsubscribe',
      true,
      true,
      jsonb_build_object('oneClick', true)
    )
    returning suppression_id into v_suppression_id;
    v_suppression_created := true;
  end if;

  select decision
    into v_latest_decision
    from public.privacy_consent_events
   where tenant_id = p_tenant_id
     and workspace_id is not distinct from p_workspace_id
     and subject_key = v_subject_key
     and channel = v_channel
     and purpose = v_purpose
   order by occurred_at desc, created_at desc
   limit 1;

  if v_latest_decision is distinct from 'withdrawn' then
    insert into public.privacy_consent_events (
      tenant_id,
      workspace_id,
      subject_key,
      channel,
      purpose,
      decision,
      notice_version,
      source,
      lawful_basis,
      actor_id,
      metadata
    ) values (
      p_tenant_id,
      p_workspace_id,
      v_subject_key,
      v_channel,
      v_purpose,
      'withdrawn',
      'recipient_opt_out',
      'signed_unsubscribe',
      null,
      null,
      jsonb_build_object('unsubscribe', true, 'oneClick', true)
    );
    v_consent_created := true;
  end if;

  return jsonb_build_object(
    'ok', true,
    'applied', v_suppression_created or v_consent_created,
    'alreadyApplied', not (v_suppression_created or v_consent_created),
    'suppressionCreated', v_suppression_created,
    'consentEventCreated', v_consent_created,
    'channel', v_channel,
    'purpose', v_purpose
  );
end;
$$;

revoke all on function public.apply_public_unsubscribe_guarded(uuid, uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.apply_public_unsubscribe_guarded(uuid, uuid, text, text, text)
  to service_role;
