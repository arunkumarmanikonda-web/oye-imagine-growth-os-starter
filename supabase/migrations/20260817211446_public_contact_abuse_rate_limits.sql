-- Race-safe, service-role-only abuse throttling for the public contact intake.
CREATE TABLE IF NOT EXISTS public.public_contact_rate_limits (
  request_fingerprint text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempt_count integer NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.public_contact_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.public_contact_rate_limits FROM anon, authenticated;
GRANT ALL ON TABLE public.public_contact_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.claim_public_contact_rate_limit(
  p_request_fingerprint text,
  p_limit integer DEFAULT 5,
  p_window_seconds integer DEFAULT 900
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_allowed boolean;
BEGIN
  IF p_request_fingerprint IS NULL OR length(p_request_fingerprint) < 16 THEN
    RAISE EXCEPTION 'invalid request fingerprint';
  END IF;
  IF p_limit < 1 OR p_limit > 100 OR p_window_seconds < 60 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'invalid rate limit configuration';
  END IF;

  INSERT INTO public.public_contact_rate_limits AS limits (
    request_fingerprint,
    window_started_at,
    attempt_count,
    updated_at
  )
  VALUES (p_request_fingerprint, now(), 1, now())
  ON CONFLICT (request_fingerprint) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= now() - (p_window_seconds * interval '1 second') THEN now()
      ELSE limits.window_started_at
    END,
    attempt_count = CASE
      WHEN limits.window_started_at <= now() - (p_window_seconds * interval '1 second') THEN 1
      ELSE limits.attempt_count + 1
    END,
    updated_at = now()
  RETURNING attempt_count <= p_limit INTO v_allowed;

  RETURN v_allowed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_public_contact_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_public_contact_rate_limit(text, integer, integer) TO service_role;
