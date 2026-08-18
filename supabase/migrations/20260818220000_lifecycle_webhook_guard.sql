-- Authenticate provider callbacks at the HTTP boundary and apply their state
-- transitions atomically without allowing replay/out-of-order downgrades.

create unique index if not exists ux_lifecycle_delivery_provider_message_id
  on public.lifecycle_delivery_jobs(provider_message_id)
  where provider_message_id is not null;

create or replace function public.apply_lifecycle_delivery_callback_guarded(
  p_provider_message_id text,
  p_provider_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_job public.lifecycle_delivery_jobs%rowtype;
  v_incoming text := lower(trim(coalesce(p_provider_status, '')));
  v_target_status text;
  v_applied boolean := false;
begin
  if p_provider_message_id is null or length(trim(p_provider_message_id)) < 1 then
    raise exception 'provider_message_id_required';
  end if;

  if v_incoming not in (
    'accepted', 'queued', 'sending', 'sent',
    'delivered', 'read',
    'failed', 'undelivered', 'bounced', 'complained'
  ) then
    raise exception 'provider_status_invalid';
  end if;

  select *
    into v_job
    from public.lifecycle_delivery_jobs
   where provider_message_id = trim(p_provider_message_id)
   for update;

  if not found then
    return jsonb_build_object('applied', false, 'job', null);
  end if;

  -- Terminal local states cannot be regressed by replayed or late callbacks.
  if v_job.status in ('failed', 'cancelled', 'blocked') then
    return jsonb_build_object('applied', false, 'job', to_jsonb(v_job));
  end if;

  -- Delivered is terminal locally. A later provider "read" receipt may enrich
  -- provider_status/metadata but must not change the local state.
  if v_job.status = 'delivered' then
    if v_incoming = 'read' and lower(coalesce(v_job.provider_status, '')) <> 'read' then
      update public.lifecycle_delivery_jobs
         set provider_status = p_provider_status,
             callback_metadata = coalesce(callback_metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb),
             completed_at = coalesce(completed_at, now()),
             updated_at = now()
       where delivery_job_id = v_job.delivery_job_id
       returning * into v_job;
      v_applied := true;
    end if;
    return jsonb_build_object('applied', v_applied, 'job', to_jsonb(v_job));
  end if;

  v_target_status := case
    when v_incoming in ('delivered', 'read') then 'delivered'
    when v_incoming in ('failed', 'undelivered', 'bounced', 'complained') then 'failed'
    else 'sent'
  end;

  update public.lifecycle_delivery_jobs
     set status = v_target_status,
         provider_status = p_provider_status,
         callback_metadata = coalesce(callback_metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb),
         completed_at = case
           when v_target_status in ('delivered', 'failed') then coalesce(completed_at, now())
           else completed_at
         end,
         updated_at = now()
   where delivery_job_id = v_job.delivery_job_id
   returning * into v_job;

  return jsonb_build_object('applied', true, 'job', to_jsonb(v_job));
end;
$$;

revoke all on function public.apply_lifecycle_delivery_callback_guarded(text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.apply_lifecycle_delivery_callback_guarded(text, text, jsonb)
  to service_role;

insert into public.config_provider_secret_fields (
  provider_key, field_key, label, field_type, required, sensitive, help_text, sort_order
) values (
  'meta_marketing',
  'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
  'WhatsApp webhook verify token',
  'secret',
  false,
  true,
  'Private platform token used only to validate the Meta WhatsApp Cloud webhook subscription challenge.',
  35
)
on conflict (provider_key, field_key) do update set
  label = excluded.label,
  field_type = excluded.field_type,
  required = excluded.required,
  sensitive = excluded.sensitive,
  help_text = excluded.help_text,
  sort_order = excluded.sort_order;
