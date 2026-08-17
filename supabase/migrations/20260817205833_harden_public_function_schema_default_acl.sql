-- Supabase's schema-specific defaults can add EXECUTE back even after the global default is revoked.
-- Keep service_role execution while requiring explicit grants for anon/authenticated RPCs.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
