# P0-014 — Migration History Repair Manifest — 2026-08-17

## Objective

Eliminate the duplicate Supabase migration version `20260731` without changing SQL semantics, preserve the dependency order already proven by isolated replay, and make ordinary lexical migration ordering sufficient for clean-environment validation.

## Scope and safety boundary

There are 16 repository migrations with the `20260731_*` prefix. The first migration remains version `20260731`; the remaining 15 are filename-only re-versionings. Blob contents are unchanged.

This repair is source-history normalization only. The repaired historical migrations must **not** be pushed to production as new DDL. Production already contains later reconciliation migrations and currently has its own applied migration ledger. P0-015/P0-016 govern any separate production promotion or migration-history reconciliation.

No production database mutation is part of P0-014 validation.

## Before → after manifest

| Order | Before | After | SQL semantics |
|---:|---|---|---|
| 1 | `20260731_core_control_plane_part1.sql` | `20260731_core_control_plane_part1.sql` | retained canonical version |
| 2 | `20260731_mega_batch_a_foundations.sql` | `20260731000100_mega_batch_a_foundations.sql` | unchanged blob |
| 3 | `20260731_neejee_pilot_foundation_part1.sql` | `20260731000200_neejee_pilot_foundation_part1.sql` | unchanged blob |
| 4 | `20260731_neejee_pilot_foundation_part2.sql` | `20260731000300_neejee_pilot_foundation_part2.sql` | unchanged blob |
| 5 | `20260731_neejee_pilot_foundation_part3.sql` | `20260731000400_neejee_pilot_foundation_part3.sql` | unchanged blob |
| 6 | `20260731_execution_stack_part1.sql` | `20260731000500_execution_stack_part1.sql` | unchanged blob |
| 7 | `20260731_execution_stack_part2.sql` | `20260731000600_execution_stack_part2.sql` | unchanged blob |
| 8 | `20260731_execution_stack_part3.sql` | `20260731000700_execution_stack_part3.sql` | unchanged blob |
| 9 | `20260731_execution_integration_closeout.sql` | `20260731000800_execution_integration_closeout.sql` | unchanged blob |
| 10 | `20260731_pilot_integration_closeout.sql` | `20260731000900_pilot_integration_closeout.sql` | unchanged blob |
| 11 | `20260731_production_activation_foundations.sql` | `20260731001000_production_activation_foundations.sql` | unchanged blob |
| 12 | `20260731_recovery_config_control_plane.sql` | `20260731001100_recovery_config_control_plane.sql` | unchanged blob |
| 13 | `20260731_reporting_optimization_part1.sql` | `20260731001200_reporting_optimization_part1.sql` | unchanged blob |
| 14 | `20260731_reporting_optimization_part2.sql` | `20260731001300_reporting_optimization_part2.sql` | unchanged blob |
| 15 | `20260731_reporting_optimization_part4.sql` | `20260731001400_reporting_optimization_part4.sql` | unchanged blob |
| 16 | `20260731_launch_hardening_closeout.sql` | `20260731001500_launch_hardening_closeout.sql` | unchanged blob |

## Dependency-order proof

The order above is the exact `ordered_20260731` sequence previously encoded in `scripts/validate-migration-chain.sh` and already replayed successfully on disposable PostgreSQL 17. Re-versioning assigns monotonically increasing versions in that same order, so normal filename sorting now reproduces the proven dependency sequence without a special-case array.

## Validation hardening

The migration validator is changed to:

1. enumerate every `supabase/migrations/*.sql` file in normal lexical order;
2. derive each migration version from the filename prefix before the first underscore;
3. fail immediately if a duplicate version exists;
4. replay the complete chain on disposable PostgreSQL 17 with Supabase-compatible roles and compatibility objects;
5. verify required execution, content, reporting, onboarding, pilot, provider and operations object families after replay.

This means a future duplicate-version regression cannot be hidden by custom ordering logic.

## Production ledger context at repair start

Production Supabase project `bqhaifivpcwwiauiynlv` was healthy and had 74 applied migration-ledger entries after the separately governed `sensitive_provider_grant_hardening` production change. The historical `20260731_*` repository files are not to be replayed into that live database as part of this repair.

## P0-014 closure criteria

P0-014 can close when CI on this repair branch proves all of the following:

- no duplicate migration version remains;
- the complete chain replays from a clean database in canonical lexical order;
- the required object-family smoke checks pass;
- the 15 repaired files retain their original blob SHAs, proving filename-only changes;
- no production database mutation occurred during validation.

Production migration-ledger reconciliation remains a separate evidence gate under P0-013/P0-015/P0-016.
