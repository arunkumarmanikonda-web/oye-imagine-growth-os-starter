create or replace function private.sync_provider_readiness_legacy()
returns trigger
language plpgsql
set search_path = pg_catalog, public, private
as $$
declare
  v_brand_name text;
  v_status text;
  v_blockers jsonb;
begin
  select b.name into v_brand_name
  from public.workspaces w
  join public.brands b on b.id = w.brand_id
  where w.id = new.workspace_id
    and w.tenant_id = new.tenant_id;

  if v_brand_name is null then
    raise exception 'provider_readiness_brand_mapping_missing';
  end if;

  if new.state = 'ready' and new.valid_until > clock_timestamp() and jsonb_array_length(new.blockers) = 0 then
    v_status := 'ready';
    v_blockers := '[]'::jsonb;
  else
    v_status := case
      when new.valid_until <= clock_timestamp() then 'expired'
      else new.state
    end;
    v_blockers := coalesce(new.blockers, '[]'::jsonb);
    if v_status = 'expired' and not (v_blockers ? 'machine_provider_readiness_expired') then
      v_blockers := v_blockers || '"machine_provider_readiness_expired"'::jsonb;
    end if;
  end if;

  insert into public.execution_channel_publish_readiness (
    brand_name,
    channel,
    qa_status,
    blockers,
    next_action,
    created_at
  ) values (
    v_brand_name,
    new.channel,
    v_status,
    v_blockers,
    case
      when v_status = 'ready' then 'Machine provider certificate is current. Preserve provider authority and reconciliation evidence.'
      when v_status = 'capabilities_verified' then 'Complete one supervised provider write with provider readback before autonomous publishing.'
      when v_status = 'expired' then 'Re-run machine provider QA before any autonomous provider action.'
      else 'Resolve machine provider QA blockers before any autonomous provider action.'
    end,
    clock_timestamp()
  );

  return new;
end;
$$;

revoke all on function private.sync_provider_readiness_legacy() from public, anon, authenticated;

drop trigger if exists provider_readiness_sync_legacy on public.provider_channel_readiness;
create trigger provider_readiness_sync_legacy
after insert or update of state, blockers, valid_until, qa_run_id, last_canary_at
on public.provider_channel_readiness
for each row
execute function private.sync_provider_readiness_legacy();

create or replace function private.guard_provider_legacy_readiness()
returns trigger
language plpgsql
set search_path = pg_catalog, public, private
as $$
declare
  v_valid boolean;
begin
  if new.channel not in ('google_ads','facebook','instagram','linkedin','youtube') then
    return new;
  end if;

  if lower(new.qa_status) not in ('ready','passed','verified','green','approved') then
    return new;
  end if;

  select exists (
    select 1
    from public.provider_channel_readiness r
    join public.workspaces w
      on w.id = r.workspace_id
     and w.tenant_id = r.tenant_id
    join public.brands b
      on b.id = w.brand_id
    where b.name = new.brand_name
      and r.channel = new.channel
      and r.state = 'ready'
      and r.valid_until > clock_timestamp()
      and jsonb_array_length(r.blockers) = 0
      and r.source = 'machine'
  ) into v_valid;

  if not v_valid then
    raise exception 'machine_provider_readiness_required';
  end if;

  new.qa_status := 'ready';
  new.blockers := '[]'::jsonb;
  return new;
end;
$$;

revoke all on function private.guard_provider_legacy_readiness() from public, anon, authenticated;

drop trigger if exists provider_legacy_readiness_guard on public.execution_channel_publish_readiness;
create trigger provider_legacy_readiness_guard
before insert or update of qa_status, blockers
on public.execution_channel_publish_readiness
for each row
execute function private.guard_provider_legacy_readiness();

revoke insert, update, delete on public.execution_channel_publish_readiness from anon, authenticated;

create or replace function private.expire_provider_channel_readiness()
returns integer
language plpgsql
set search_path = pg_catalog, public, private
as $$
declare
  v_count integer;
begin
  update public.provider_channel_readiness
  set state = 'expired',
      blockers = case
        when blockers ? 'machine_provider_readiness_expired' then blockers
        else blockers || '"machine_provider_readiness_expired"'::jsonb
      end,
      updated_at = clock_timestamp()
  where state not in ('expired','revoked')
    and valid_until <= clock_timestamp();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function private.expire_provider_channel_readiness() from public, anon, authenticated;

do $$
declare
  v_job_id bigint;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    select jobid into v_job_id from cron.job where jobname = 'oye-provider-readiness-expiry' limit 1;
    if v_job_id is not null then
      perform cron.unschedule(v_job_id);
    end if;
    perform cron.schedule(
      'oye-provider-readiness-expiry',
      '* * * * *',
      'select private.expire_provider_channel_readiness();'
    );
  end if;
end;
$$;