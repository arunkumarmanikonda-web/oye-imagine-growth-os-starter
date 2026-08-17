-- Remove non-CRUD table privileges from browser-facing API roles.
-- RLS remains the row-level authorization boundary for permitted CRUD access.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Prevent future public tables created by postgres from inheriting these privileges.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;
