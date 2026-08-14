begin;

-- P0 fail-closed posture for commercial and financial data. The client-facing
-- database API is read-only and tenant-scoped; all state-changing operations
-- remain server/service-role only until approval policies are independently proven.

alter table public.commercial_approval_requests enable row level security;
alter table public.commercial_audit_events enable row level security;
alter table public.commercial_contracts enable row level security;
alter table public.commercial_invoices enable row level security;
alter table public.commercial_ledger_entries enable row level security;
alter table public.commercial_media_balance_accounts enable row level security;
alter table public.commercial_mutation_ops enable row level security;
alter table public.commercial_subscriptions enable row level security;
alter table public.commercial_tenant_snapshots enable row level security;

revoke all on public.commercial_approval_requests from anon, authenticated;
revoke all on public.commercial_audit_events from anon, authenticated;
revoke all on public.commercial_contracts from anon, authenticated;
revoke all on public.commercial_invoices from anon, authenticated;
revoke all on public.commercial_ledger_entries from anon, authenticated;
revoke all on public.commercial_media_balance_accounts from anon, authenticated;
revoke all on public.commercial_mutation_ops from anon, authenticated;
revoke all on public.commercial_subscriptions from anon, authenticated;
revoke all on public.commercial_tenant_snapshots from anon, authenticated;

grant select on public.commercial_approval_requests to authenticated;
grant select on public.commercial_contracts to authenticated;
grant select on public.commercial_invoices to authenticated;
grant select on public.commercial_ledger_entries to authenticated;
grant select on public.commercial_media_balance_accounts to authenticated;
grant select on public.commercial_subscriptions to authenticated;
grant select on public.commercial_tenant_snapshots to authenticated;

grant all on public.commercial_approval_requests to service_role;
grant all on public.commercial_audit_events to service_role;
grant all on public.commercial_contracts to service_role;
grant all on public.commercial_invoices to service_role;
grant all on public.commercial_ledger_entries to service_role;
grant all on public.commercial_media_balance_accounts to service_role;
grant all on public.commercial_mutation_ops to service_role;
grant all on public.commercial_subscriptions to service_role;
grant all on public.commercial_tenant_snapshots to service_role;

drop policy if exists commercial_approval_requests_tenant_read on public.commercial_approval_requests;
create policy commercial_approval_requests_tenant_read on public.commercial_approval_requests for select to authenticated using ((select private.current_user_has_tenant_membership(tenant_id)));
drop policy if exists commercial_contracts_tenant_read on public.commercial_contracts;
create policy commercial_contracts_tenant_read on public.commercial_contracts for select to authenticated using ((select private.current_user_has_tenant_membership(tenant_id)));
drop policy if exists commercial_invoices_tenant_read on public.commercial_invoices;
create policy commercial_invoices_tenant_read on public.commercial_invoices for select to authenticated using ((select private.current_user_has_tenant_membership(tenant_id)));
drop policy if exists commercial_ledger_entries_tenant_read on public.commercial_ledger_entries;
create policy commercial_ledger_entries_tenant_read on public.commercial_ledger_entries for select to authenticated using ((select private.current_user_has_tenant_membership(tenant_id)));
drop policy if exists commercial_media_balance_accounts_tenant_read on public.commercial_media_balance_accounts;
create policy commercial_media_balance_accounts_tenant_read on public.commercial_media_balance_accounts for select to authenticated using ((select private.current_user_has_tenant_membership(tenant_id)));
drop policy if exists commercial_subscriptions_tenant_read on public.commercial_subscriptions;
create policy commercial_subscriptions_tenant_read on public.commercial_subscriptions for select to authenticated using ((select private.current_user_has_tenant_membership(tenant_id)));
drop policy if exists commercial_tenant_snapshots_tenant_read on public.commercial_tenant_snapshots;
create policy commercial_tenant_snapshots_tenant_read on public.commercial_tenant_snapshots for select to authenticated using ((select private.current_user_has_tenant_membership(tenant_id)));

drop policy if exists commercial_audit_events_authenticated_access on public.commercial_audit_events;
drop policy if exists commercial_mutation_ops_authenticated_access on public.commercial_mutation_ops;

revoke execute on function public.bootstrap_seed_platform(uuid, text, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.commercial_activate_contract(text, text, timestamptz, text, text) from public, anon, authenticated;
revoke execute on function public.commercial_mark_invoice_paid(text, text, timestamptz, text, text) from public, anon, authenticated;
revoke execute on function public.commercial_release_media_balance(text, numeric, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.commercial_renew_subscription(text, text, timestamptz, text, text) from public, anon, authenticated;
revoke execute on function public.commercial_reserve_media_balance(text, numeric, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.commercial_resolve_approval_request(text, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.commercial_spend_media_balance(text, numeric, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.ensure_commercial_media_balance_account(text, text) from public, anon, authenticated;
revoke execute on function public.log_admin_audit_event(text, uuid, text, uuid, uuid, uuid, jsonb) from public, anon, authenticated;

grant execute on function public.bootstrap_seed_platform(uuid, text, text, text, text, text, text) to service_role;
grant execute on function public.commercial_activate_contract(text, text, timestamptz, text, text) to service_role;
grant execute on function public.commercial_mark_invoice_paid(text, text, timestamptz, text, text) to service_role;
grant execute on function public.commercial_release_media_balance(text, numeric, text, text, text, text, jsonb) to service_role;
grant execute on function public.commercial_renew_subscription(text, text, timestamptz, text, text) to service_role;
grant execute on function public.commercial_reserve_media_balance(text, numeric, text, text, text, text, jsonb) to service_role;
grant execute on function public.commercial_resolve_approval_request(text, text, text, text, text, text) to service_role;
grant execute on function public.commercial_spend_media_balance(text, numeric, text, text, text, text, jsonb) to service_role;
grant execute on function public.ensure_commercial_media_balance_account(text, text) to service_role;
grant execute on function public.log_admin_audit_event(text, uuid, text, uuid, uuid, uuid, jsonb) to service_role;

alter function public.bootstrap_seed_platform(uuid, text, text, text, text, text, text) set search_path = pg_catalog, public;
alter function public.commercial_activate_contract(text, text, timestamptz, text, text) set search_path = pg_catalog, public;
alter function public.commercial_mark_invoice_paid(text, text, timestamptz, text, text) set search_path = pg_catalog, public;
alter function public.commercial_release_media_balance(text, numeric, text, text, text, text, jsonb) set search_path = pg_catalog, public;
alter function public.commercial_renew_subscription(text, text, timestamptz, text, text) set search_path = pg_catalog, public;
alter function public.commercial_reserve_media_balance(text, numeric, text, text, text, text, jsonb) set search_path = pg_catalog, public;
alter function public.commercial_resolve_approval_request(text, text, text, text, text, text) set search_path = pg_catalog, public;
alter function public.commercial_spend_media_balance(text, numeric, text, text, text, text, jsonb) set search_path = pg_catalog, public;
alter function public.ensure_commercial_media_balance_account(text, text) set search_path = pg_catalog, public;
alter function public.log_admin_audit_event(text, uuid, text, uuid, uuid, uuid, jsonb) set search_path = pg_catalog, public;

commit;
