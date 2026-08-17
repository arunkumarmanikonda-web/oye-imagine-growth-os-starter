# P0-013 Final Migration Reconciliation — 2026-08-17

## Purpose

Resolve the final source-control versus production-ledger asymmetry after P0-014 without replaying historical DDL blindly.

## Verified starting state

At Git SHA `af32a9b6e634343c219cbc0356eb4f35cbd7f13a`:

- production Supabase migration ledger: 74 entries;
- repository migration files: 74;
- the counts are equal but the sets contain one offsetting asymmetry.

### Production-only ledger entry

`20260814101955 post_reconciliation_default_deny_rls_and_search_path` exists in the production ledger but has no corresponding Git migration file.

The exact migration statement was recovered from `supabase_migrations.schema_migrations.statements` and is mirrored into source control in this change as:

`20260814101955_post_reconciliation_default_deny_rls_and_search_path.sql`

Live production verification also proves its intended effects remain active:

- zero public base/partitioned tables have RLS disabled;
- all nine named batch trigger functions have `search_path=pg_catalog, public`.

### Git-only migration provenance gap

`20260815070500_commercial_enquiry_permissions.sql` is present in Git but has no same-named production ledger entry.

Its live effects are nevertheless already present in production:

- `commercial.enquiry.view` exists in `core_permission_catalog` with low risk;
- `commercial.enquiry.manage` exists with medium risk;
- `tenant_admin` and `account_manager` have both permissions;
- `finance_approver` has `commercial.enquiry.view`.

Because the original migration is not ledgered, it is re-versioned as a forward reconciliation migration while preserving the exact Git blob/content:

`20260817083000_reconcile_commercial_enquiry_permissions.sql`

The old filename is removed. The SQL content is unchanged and remains idempotent.

## Safety boundary

- The production-only migration is mirrored from Supabase's stored migration statement; it is not reconstructed from memory.
- The enquiry permission migration is a filename/version provenance repair with byte-identical SQL.
- The complete repository chain must pass disposable PostgreSQL 17 replay before production application.
- Only the forward `reconcile_commercial_enquiry_permissions` migration is eligible for production application after merge; the mirrored `20260814101955` migration is already represented in the production ledger and must not be replayed there.

## Expected final state after controlled production apply

- repository migration files: 75;
- production migration ledger entries: 75;
- no production-only migration without a Git source file;
- no Git-only migration without either a direct ledger entry or the documented P0-014 reconciliation alias;
- all historical July reconciliation aliases remain explicitly documented rather than rewritten a second time.

A final machine-readable parity snapshot will be captured after production application and tied to the post-merge Git SHA before P0-013 is closed.
