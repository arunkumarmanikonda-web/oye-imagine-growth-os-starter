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

  if lower(new.qa_status) not in ('ready','passed','verified','green','approved','go') then
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