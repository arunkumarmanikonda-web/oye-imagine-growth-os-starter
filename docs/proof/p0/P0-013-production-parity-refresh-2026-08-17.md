# P0-013 Production Parity Refresh — 2026-08-17

## Purpose

Refresh the historical P0-013 production-parity evidence against the current production deployment and database. This document supersedes the object-level findings in the 2026-08-14 report; it does not waive the programme rule that P0 closes only on production/staging evidence rather than code presence alone.

## Production application evidence

- Vercel project: `oye-imagine-growth-os-starter`
- Production deployment state: `READY`
- Production Git SHA: `9ff774992d97a46d79c721fdb480687f3ae95c5c`
- Branch: `main`
- Public domains: `oyeimagine.com`, `www.oyeimagine.com`
- Runtime error review: no production runtime error groups observed in the most recent 24-hour review window on 2026-08-17.

## Production Supabase evidence

- Project: `bqhaifivpcwwiauiynlv` (`oye-imagine-growth-os-20260721-1440`)
- Health: `ACTIVE_HEALTHY`
- PostgreSQL: 17.6.1
- Migration-ledger row count: 73
- Public base-table count: 151
- `pg_net`: installed in schema `extensions`
- `pgcrypto`: installed in schema `extensions`
- `vector`: installed in schema `extensions`

## Historical object-gap recheck

Every representative object explicitly listed as absent in the previous P0-013 evidence is now present in production, including:

- `execution_landing_page_publications`
- `execution_campaign_packages`
- `execution_channel_publish_readiness`
- `execution_approval_bound_decisions`
- `execution_proof_packages`
- `content_plan_runs`
- `landing_page_drafts`
- `campaign_drafts`
- `seo_briefs`
- `social_calendar_entries`
- `creative_asset_drafts`
- `search_optimization_briefs`
- `channel_qa_reports`
- `publish_guardrail_decisions`
- `proof_execution_assets`
- `reporting_delivery_centers`
- `launch_readiness_dashboards`
- `ops_support_handoffs`
- `ops_dependency_signoffs`
- `ops_hardening_evidence`
- `core_brands`
- `core_workspaces`
- `onboarding_intakes`
- `brand_profiles`
- `strategy_artifacts`
- `website_audit_runs`
- `competitor_snapshots`
- `onboarding_activation_checklists`
- `strategy_presentation_manifests`
- `client_portal_snapshots`
- `operator_work_items`
- `provider_secret_material`

**Object-level conclusion:** the historical production object gap recorded on 2026-08-14 is resolved.

## Security-adviser recheck

The production security adviser still reports informational `rls_enabled_no_policy` findings. Review of grants shows that many of these tables are intentionally backend/service-role only and expose no client-role table privileges, so an RLS policy is not required merely to silence the adviser.

One actionable legacy condition remains in scope for this change:

- `external_provider_credentials` has RLS enabled and no client policies, but retained broad SQL grants for `anon` and `authenticated`.
- `provider_secret_material` has RLS enabled and no client policies, but retained broad SQL grants for `anon` and `authenticated`.

The migration in this branch revokes all table privileges from `anon` and `authenticated` on both tables while preserving `service_role` access. This is defence in depth and aligns the legacy credential surfaces with the newer service-role-only provider-secret model.

The adviser also reports leaked-password protection disabled. That is an Auth configuration control and remains an operational configuration blocker until enabled and evidenced in the production project.

## P0-013 disposition

- Historical object-level production gap: **RESOLVED**.
- Current production application deployment: **VERIFIED READY** at the SHA above.
- Current production database health: **VERIFIED HEALTHY**.
- Exact Git migration-file ↔ production migration-ledger reconciliation: **STILL EVIDENCE-GATED**.
- Replay/validation of the new sensitive-grant hardening migration in staging/development: **REQUIRED BEFORE MERGE/APPLY**.

Therefore P0-013 should not be closed solely from this document. The issue can move from “known object parity failure” to “final ledger reconciliation and staged replay evidence required.”

## Spend/autonomy gate

Nothing in this evidence authorises unrestricted provider mutation, customer-money handling or autonomous media spend. Those remain gated by their own P0 production proof, including provider execution, MFA/AAL2, commercial controls and the first closed-loop pilot evidence.
