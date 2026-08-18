create table if not exists public.security_csp_report_buckets (
  report_id uuid primary key default gen_random_uuid(),
  fingerprint text not null,
  hour_bucket timestamptz not null,
  disposition text,
  effective_directive text,
  violated_directive text,
  document_origin text,
  document_path text,
  blocked_origin text,
  blocked_path text,
  source_origin text,
  source_path text,
  line_number bigint,
  report_count bigint not null default 1 check (report_count > 0),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint security_csp_report_fingerprint_length check (char_length(fingerprint) between 32 and 128),
  constraint security_csp_report_bucket_unique unique (fingerprint, hour_bucket)
);

create index if not exists security_csp_report_last_seen_idx
  on public.security_csp_report_buckets (last_seen_at desc);
create index if not exists security_csp_report_directive_idx
  on public.security_csp_report_buckets (effective_directive, last_seen_at desc);
create index if not exists security_csp_report_blocked_origin_idx
  on public.security_csp_report_buckets (blocked_origin, last_seen_at desc);

alter table public.security_csp_report_buckets enable row level security;
revoke all on table public.security_csp_report_buckets from anon, authenticated;
grant select, insert, update, delete on table public.security_csp_report_buckets to service_role;

create table if not exists public.security_csp_report_rate_limits (
  bucket_key text not null,
  window_start timestamptz not null,
  report_count integer not null default 1 check (report_count > 0),
  updated_at timestamptz not null default now(),
  primary key (bucket_key, window_start),
  constraint security_csp_rate_bucket_length check (char_length(bucket_key) between 32 and 128)
);

alter table public.security_csp_report_rate_limits enable row level security;
revoke all on table public.security_csp_report_rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.security_csp_report_rate_limits to service_role;

create or replace function public.record_csp_security_report(
  p_bucket_key text,
  p_fingerprint text,
  p_hour_bucket timestamptz,
  p_disposition text,
  p_effective_directive text,
  p_violated_directive text,
  p_document_origin text,
  p_document_path text,
  p_blocked_origin text,
  p_blocked_path text,
  p_source_origin text,
  p_source_path text,
  p_line_number bigint
)
returns table (accepted boolean, throttled boolean, stored_report_count bigint)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_window timestamptz := date_trunc('minute', now());
  v_rate integer;
  v_report_count bigint;
begin
  if p_bucket_key is null or char_length(p_bucket_key) not between 32 and 128 then
    raise exception 'csp_rate_bucket_invalid';
  end if;
  if p_fingerprint is null or char_length(p_fingerprint) not between 32 and 128 then
    raise exception 'csp_fingerprint_invalid';
  end if;

  insert into public.security_csp_report_rate_limits (bucket_key, window_start, report_count, updated_at)
  values (p_bucket_key, v_window, 1, now())
  on conflict (bucket_key, window_start) do update
    set report_count = public.security_csp_report_rate_limits.report_count + 1,
        updated_at = now()
  returning report_count into v_rate;

  if v_rate > 120 then
    return query select false, true, null::bigint;
    return;
  end if;

  insert into public.security_csp_report_buckets (
    fingerprint,
    hour_bucket,
    disposition,
    effective_directive,
    violated_directive,
    document_origin,
    document_path,
    blocked_origin,
    blocked_path,
    source_origin,
    source_path,
    line_number,
    report_count,
    first_seen_at,
    last_seen_at
  ) values (
    p_fingerprint,
    date_trunc('hour', p_hour_bucket),
    nullif(p_disposition, ''),
    nullif(p_effective_directive, ''),
    nullif(p_violated_directive, ''),
    nullif(p_document_origin, ''),
    nullif(p_document_path, ''),
    nullif(p_blocked_origin, ''),
    nullif(p_blocked_path, ''),
    nullif(p_source_origin, ''),
    nullif(p_source_path, ''),
    p_line_number,
    1,
    now(),
    now()
  )
  on conflict (fingerprint, hour_bucket) do update
    set report_count = public.security_csp_report_buckets.report_count + 1,
        last_seen_at = now(),
        disposition = excluded.disposition,
        effective_directive = excluded.effective_directive,
        violated_directive = excluded.violated_directive,
        document_origin = excluded.document_origin,
        document_path = excluded.document_path,
        blocked_origin = excluded.blocked_origin,
        blocked_path = excluded.blocked_path,
        source_origin = excluded.source_origin,
        source_path = excluded.source_path,
        line_number = excluded.line_number
  returning report_count into v_report_count;

  return query select true, false, v_report_count;
end;
$$;

revoke all on function public.record_csp_security_report(text,text,timestamptz,text,text,text,text,text,text,text,text,text,bigint) from public, anon, authenticated;
grant execute on function public.record_csp_security_report(text,text,timestamptz,text,text,text,text,text,text,text,text,text,bigint) to service_role;

create or replace function public.expire_csp_security_telemetry()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_reports bigint;
  v_rates bigint;
begin
  delete from public.security_csp_report_buckets
  where last_seen_at < now() - interval '30 days';
  get diagnostics v_reports = row_count;

  delete from public.security_csp_report_rate_limits
  where window_start < now() - interval '1 day';
  get diagnostics v_rates = row_count;

  return jsonb_build_object('reportsDeleted', v_reports, 'rateBucketsDeleted', v_rates);
end;
$$;

revoke all on function public.expire_csp_security_telemetry() from public, anon, authenticated;
grant execute on function public.expire_csp_security_telemetry() to service_role;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'oye-csp-telemetry-retention') then
    perform cron.unschedule('oye-csp-telemetry-retention');
  end if;
  perform cron.schedule(
    'oye-csp-telemetry-retention',
    '17 3 * * *',
    'select public.expire_csp_security_telemetry();'
  );
end;
$$;
