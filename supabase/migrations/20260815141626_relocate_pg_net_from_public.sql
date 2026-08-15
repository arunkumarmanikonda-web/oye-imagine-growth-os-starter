-- Keep pg_net extension objects out of the public API-exposed schema.
-- Production dependency checks confirmed no application functions, cron jobs,
-- or database webhook triggers depend on pg_net before this recreation.

drop extension if exists pg_net;
create extension pg_net schema extensions;
