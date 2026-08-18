alter table public.autonomous_action_queue
  drop constraint if exists autonomous_action_queue_status_check;
alter table public.autonomous_action_queue
  add constraint autonomous_action_queue_status_check
  check (status in ('pending','claimed','reconciling','completed','blocked','failed'));

create table if not exists private.autonomy_scheduler_config (
  singleton boolean primary key default true check (singleton),
  worker_endpoint text not null,
  worker_secret text not null,
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now()
);

revoke all on private.autonomy_scheduler_config from public, anon, authenticated;

insert into private.autonomy_scheduler_config (singleton, worker_endpoint, worker_secret)
values (
  true,
  'https://www.oyeimagine.com/api/cron/autonomy',
  pg_catalog.encode(extensions.gen_random_bytes(32), 'hex')
)
on conflict (singleton) do update set worker_endpoint = excluded.worker_endpoint;

create or replace function public.verify_autonomy_scheduler_secret(p_secret text)
returns boolean
language sql
security definer
set search_path = pg_catalog, public, private
as $$
  select coalesce(
    pg_catalog.encode(extensions.digest(coalesce(p_secret,''), 'sha256'), 'hex') =
    pg_catalog.encode(extensions.digest(c.worker_secret, 'sha256'), 'hex'),
    false
  )
  from private.autonomy_scheduler_config c
  where c.singleton = true;
$$;

revoke all on function public.verify_autonomy_scheduler_secret(text) from public, anon, authenticated;
grant execute on function public.verify_autonomy_scheduler_secret(text) to service_role;

create or replace function private.invoke_autonomy_worker()
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public, private, net
as $$
declare
  v_endpoint text;
  v_secret text;
  v_request_id bigint;
begin
  select worker_endpoint, worker_secret into v_endpoint, v_secret
  from private.autonomy_scheduler_config
  where singleton = true;
  if v_endpoint is null or v_secret is null then
    raise exception 'autonomy_scheduler_config_missing';
  end if;
  select net.http_post(
    url := v_endpoint,
    body := jsonb_build_object('source','supabase_pg_cron','requested_at',now()),
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'X-Oye-Autonomy-Secret',v_secret
    ),
    timeout_milliseconds := 10000
  ) into v_request_id;
  return v_request_id;
end;
$$;

revoke all on function private.invoke_autonomy_worker() from public, anon, authenticated;

do $do$
begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    begin
      perform cron.unschedule('oye-autonomy-worker');
    exception when others then
      null;
    end;
    perform cron.schedule('oye-autonomy-worker','*/5 * * * *','select private.invoke_autonomy_worker();');
  end if;
end
$do$;
