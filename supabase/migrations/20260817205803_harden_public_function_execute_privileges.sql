-- Public-schema functions are internal helpers unless a migration explicitly grants RPC access.
-- Remove direct execution from browser-facing roles and PUBLIC.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default. Override that globally
-- for functions created by postgres, and remove direct defaults for API browser roles.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
