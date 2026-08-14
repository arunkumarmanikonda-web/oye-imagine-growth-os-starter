# P0-013 — Git ↔ production Supabase migration parity

Captured: 2026-08-14  
Git evidence SHA: `5d55ec6966257601dcd676d7c9da6de04764c4c9`  
Oye Supabase project: `bqhaifivpcwwiauiynlv`

## Result

**Parity status: FAIL — real production schema gap.**

The repository contains 45 SQL migration files. The production Oye migration ledger contains 30 logical migrations. Fifteen 31 July migration files are not represented in the ledger. Object-level verification shows the tables created by those migrations are also absent from the live production `public` schema.

This is therefore not a filename/version-number mismatch. The unledgered migrations represent schema that has not been applied to the Oye production database.

## Why no production replay was performed

The tracker requires P0-014 before P0-015: missing migrations must first be replayed and validated on a staging/development clone. The 31 July group is dependency-linked: later execution/reporting migrations reference objects such as `core_brands`, `core_workspaces`, `strategy_artifacts`, `content_plan_runs` and `campaign_drafts`. Directly applying selected files to production without staging validation would create avoidable migration-order and RLS/security risk.

## Production ledger state

The production ledger contains the original `0001`–`0021` migrations, commercial finance/workflow foundations, the control-plane/security migrations applied on 14 August, the Creative Asset Platform migrations and commercial/search-path hardening.

The newer security migrations were applied with Supabase-generated migration versions, so logical migration name rather than filename timestamp is the correct comparison key for those rows.

## Unledgered Git migrations

| Migration | Representative expected objects | Production object state |
|---|---|---|
| `20260731_execution_integration_closeout.sql` | `execution_landing_page_publications`, `execution_campaign_packages`, `execution_channel_publish_readiness`, `execution_approval_bound_decisions`, `execution_proof_packages` | Absent |
| `20260731_execution_stack_part1.sql` | `content_plan_runs`, `landing_page_drafts`, `campaign_drafts` | Absent |
| `20260731_execution_stack_part2.sql` | `seo_briefs`, `social_calendar_entries`, `creative_asset_drafts` | Absent |
| `20260731_execution_stack_part3.sql` | `search_optimization_briefs`, `channel_qa_reports`, `publish_guardrail_decisions`, `proof_execution_assets` | Absent |
| `20260731_launch_hardening_closeout.sql` | `reporting_delivery_centers`, `launch_readiness_dashboards`, `ops_support_handoffs`, `ops_dependency_signoffs`, `ops_hardening_evidence` | Absent |
| `20260731_mega_batch_a_foundations.sql` | organization/support/CMS control-plane tables | Absent |
| `20260731_neejee_pilot_foundation_part1.sql` | `core_brands`, `core_workspaces`, `onboarding_intakes`, `brand_profiles`, `strategy_artifacts` | Absent |
| `20260731_neejee_pilot_foundation_part2.sql` | `website_audit_runs`, `competitor_snapshots`, `onboarding_activation_checklists` | Absent |
| `20260731_neejee_pilot_foundation_part3.sql` | `strategy_presentation_manifests`, `client_portal_snapshots`, `operator_work_items` | Absent |
| `20260731_pilot_integration_closeout.sql` | pilot tenant/audit/competitor/activation/state tables | Absent |
| `20260731_production_activation_foundations.sql` | provider/readiness/deployment/dependency tables | Absent |
| `20260731_recovery_config_control_plane.sql` | provider configuration/secret/sync tables | Absent |
| `20260731_reporting_optimization_part1.sql` | KPI/report/optimization tables | Absent |
| `20260731_reporting_optimization_part2.sql` | health/usage/launch-review tables | Absent |
| `20260731_reporting_optimization_part4.sql` | persona/report-publication/escalation/super-admin/managed-service tables | Absent |

The complete machine-readable object list and current production table snapshot are stored beside this report in `P0-013-supabase-production-parity.json`.

## Required next action

P0-014 must create a Supabase development branch from the current Oye production project and replay the missing dependency chain there. Validation must cover:

1. migration order and idempotency;
2. foreign-key dependencies;
3. RLS and grants on every new tenant-scoped table;
4. function `search_path` and `SECURITY DEFINER` exposure;
5. seed/default data for Neejee using the corrected canonical brand truth;
6. build/API compatibility against the staged schema;
7. tenant A → tenant B denial tests;
8. migration rollback/reset behavior on the staging branch.

Only after that evidence exists should P0-015 prepare an approved production migration set.
