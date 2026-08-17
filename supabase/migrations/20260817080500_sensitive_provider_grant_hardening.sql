begin;

-- These legacy provider credential tables are intentionally service-role only.
-- Row-level security already blocks anon/authenticated row access, but implicit
-- table grants widen the attack surface unnecessarily. Align these tables with
-- the newer provider-secret storage model by removing all client-role grants.
revoke all privileges on table public.external_provider_credentials from anon, authenticated;
revoke all privileges on table public.provider_secret_material from anon, authenticated;

-- Preserve explicit backend access for trusted server-side workflows.
grant all privileges on table public.external_provider_credentials to service_role;
grant all privileges on table public.provider_secret_material to service_role;

comment on table public.external_provider_credentials is
  'Provider credential metadata; service-role only. Client roles have no table privileges.';
comment on table public.provider_secret_material is
  'Encrypted/provider secret material; service-role only. Client roles have no table privileges.';

commit;
