#!/usr/bin/env bash
set -euo pipefail

summary_file="${GITHUB_STEP_SUMMARY:-/tmp/migration-summary.md}"

fail_with_summary() {
  local title="$1"
  local log_file="$2"
  {
    echo "## Migration validation failure"
    echo
    echo "**Stage:** ${title}"
    echo
    echo '```text'
    tail -n 120 "$log_file" 2>/dev/null || true
    echo '```'
  } >> "$summary_file"
  cat "$log_file" >&2 || true
  exit 1
}

bootstrap_log=/tmp/migration-bootstrap.log
if ! psql -v ON_ERROR_STOP=1 >"$bootstrap_log" 2>&1 <<'SQL'
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
create schema if not exists auth;
create schema if not exists storage;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(), email text,
  raw_app_meta_data jsonb default '{}'::jsonb,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
create or replace function auth.role() returns text language sql stable as $$ select 'authenticated'::text $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
create table if not exists storage.buckets (
  id text primary key, name text unique not null, owner uuid, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[], created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),
  name text not null, owner uuid, metadata jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create or replace function storage.foldername(name text)
returns text[]
language sql
immutable
as $$
  select case
    when coalesce(array_length(string_to_array(name, '/'), 1), 0) <= 1 then array[]::text[]
    else (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1]
  end
$$;
SQL
then
  fail_with_summary "Supabase-compatible bootstrap" "$bootstrap_log"
fi

mapfile -t pre_20260731 < <(find supabase/migrations -maxdepth 1 -type f -name '*.sql' | sort | awk -F/ '$NF < "20260731_"')
mapfile -t post_20260731 < <(find supabase/migrations -maxdepth 1 -type f -name '*.sql' | sort | awk -F/ '$NF > "20260731_zzzzzzzz.sql"')

ordered_20260731=(
  "supabase/migrations/20260731_core_control_plane_part1.sql"
  "supabase/migrations/20260731_mega_batch_a_foundations.sql"
  "supabase/migrations/20260731_neejee_pilot_foundation_part1.sql"
  "supabase/migrations/20260731_neejee_pilot_foundation_part2.sql"
  "supabase/migrations/20260731_neejee_pilot_foundation_part3.sql"
  "supabase/migrations/20260731_execution_stack_part1.sql"
  "supabase/migrations/20260731_execution_stack_part2.sql"
  "supabase/migrations/20260731_execution_stack_part3.sql"
  "supabase/migrations/20260731_execution_integration_closeout.sql"
  "supabase/migrations/20260731_pilot_integration_closeout.sql"
  "supabase/migrations/20260731_production_activation_foundations.sql"
  "supabase/migrations/20260731_recovery_config_control_plane.sql"
  "supabase/migrations/20260731_reporting_optimization_part1.sql"
  "supabase/migrations/20260731_reporting_optimization_part2.sql"
  "supabase/migrations/20260731_reporting_optimization_part4.sql"
  "supabase/migrations/20260731_launch_hardening_closeout.sql"
)

migrations=("${pre_20260731[@]}" "${ordered_20260731[@]}" "${post_20260731[@]}")

for migration in "${migrations[@]}"; do
  [[ -f "$migration" ]] || fail_with_summary "missing migration file: $migration" /dev/null
  echo "==> validating ${migration}"
  migration_log=/tmp/migration-current.log
  if ! psql -v ON_ERROR_STOP=1 -f "$migration" >"$migration_log" 2>&1; then
    fail_with_summary "$migration" "$migration_log"
  fi
done

verify_log=/tmp/migration-verify.log
if ! psql -v ON_ERROR_STOP=1 >"$verify_log" 2>&1 <<'SQL'
do $$
declare
  required text[] := array[
    'execution_landing_page_publications','execution_campaign_packages','execution_channel_publish_readiness','execution_approval_bound_decisions','execution_proof_packages',
    'content_plan_runs','landing_page_drafts','campaign_drafts','seo_briefs','social_calendar_entries','creative_asset_drafts',
    'search_optimization_briefs','channel_qa_reports','publish_guardrail_decisions','proof_execution_assets',
    'reporting_delivery_centers','launch_readiness_dashboards','ops_support_handoffs','ops_dependency_signoffs','ops_hardening_evidence',
    'organization_profiles','support_channels','support_mail_logs','tenant_brand_profiles','cms_pages','cms_sections','cms_promotions','cms_people_profiles','cms_faqs','cms_publish_versions','cms_audit_events',
    'core_brands','core_workspaces','onboarding_intakes','brand_profiles','strategy_artifacts','website_audit_runs','competitor_snapshots','onboarding_activation_checklists',
    'strategy_presentation_manifests','client_portal_snapshots','operator_work_items','pilot_tenant_configurations','pilot_website_audit_runs','pilot_competitor_landscapes','pilot_commercial_activation_checks','pilot_state_transitions',
    'external_provider_credentials','tenant_activation_readiness_snapshots','deployment_verification_runs','external_dependency_register',
    'provider_config_profiles','provider_secret_material','config_sync_jobs','analytics_kpi_runs','report_snapshots','optimization_recommendations',
    'admin_health_checks','tenant_usage_snapshots','launch_readiness_reviews','persona_dashboard_snapshots','report_publication_jobs','optimization_escalations','super_admin_operational_snapshots','managed_service_workspace_snapshots'
  ];
  item text;
begin
  foreach item in array required loop
    if to_regclass('public.' || item) is null then
      raise exception 'required table missing after migration replay: %', item;
    end if;
  end loop;
end $$;
SQL
then
  fail_with_summary "required object verification" "$verify_log"
fi

{
  echo "## Migration validation passed"
  echo
  echo "Replayed ${#migrations[@]} migration files in dependency-safe order on disposable PostgreSQL 17."
} >> "$summary_file"

echo "Migration chain validated successfully in disposable PostgreSQL."
