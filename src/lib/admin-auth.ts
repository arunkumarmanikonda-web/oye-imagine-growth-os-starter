const ADMIN_ENV_KEYS = [
  "ADMIN_PASSWORD",
  "ADMIN_SECRET",
  "ADMIN_API_PASSWORD",
  "NEXT_PUBLIC_ADMIN_PASSWORD",
] as const;

const ADMIN_HEADER_KEYS = [
  "x-admin-password",
  "x-admin-secret",
  "x-admin-token",
] as const;

type ConfiguredSecret = {
  key: string;
  value: string;
};

export type AdminAuthResult = {
  ok: boolean;
  reason?: string;
  matchedEnvKey?: string;
  matchedHeader?: string;
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim();
}

export function getConfiguredAdminSecrets(): ConfiguredSecret[] {
  const seen = new Set<string>();
  const secrets: ConfiguredSecret[] = [];

  for (const key of ADMIN_ENV_KEYS) {
    const value = normalize(process.env[key]);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    secrets.push({ key, value });
  }

  return secrets;
}

export function getConfiguredAdminSecretKeys(): string[] {
  return getConfiguredAdminSecrets().map((item) => item.key);
}

export function authorizeAdminRequest(request: Request): AdminAuthResult {
  const configured = getConfiguredAdminSecrets();
  if (configured.length === 0) {
    return {
      ok: false,
      reason: "No admin secret configured in environment.",
    };
  }

  const provided: Array<{ header: string; value: string }> = [];

  for (const header of ADMIN_HEADER_KEYS) {
    const value = normalize(request.headers.get(header));
    if (value) {
      provided.push({ header, value });
    }
  }

  const authHeader = normalize(request.headers.get("authorization"));
  if (authHeader) {
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (bearer) {
      provided.push({ header: "authorization", value: bearer });
    }
  }

  if (provided.length === 0) {
    return {
      ok: false,
      reason: "Missing admin credential header.",
    };
  }

  for (const candidate of provided) {
    const match = configured.find((item) => item.value === candidate.value);
    if (match) {
      return {
        ok: true,
        matchedEnvKey: match.key,
        matchedHeader: candidate.header,
      };
    }
  }

  return {
    ok: false,
    reason: "Provided admin credential did not match configured secret.",
  };
}