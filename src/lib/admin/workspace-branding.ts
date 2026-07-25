type UnknownRecord = Record<string, unknown>;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNestedString(record: UnknownRecord | null | undefined, keys: string[]): string {
  if (!record) return "";
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function normalizeWorkspaceDisplayName(value: string, fallback: string): string {
  const candidate = value.trim();
  if (!candidate) return fallback;

  if (/\bneejee\b/i.test(candidate)) {
    return fallback;
  }

  return candidate;
}

function surfaceLabelText(surface: "onboarding" | "brand-intelligence" | "pilot"): string {
  if (surface === "onboarding") return "onboarding";
  if (surface === "brand-intelligence") return "brand intelligence";
  return "pilot";
}

export function getWorkspaceDisplayName(snapshot: unknown, fallback = "Current workspace"): string {
  if (!snapshot || typeof snapshot !== "object") return fallback;

  const root = snapshot as UnknownRecord;
  const workspace =
    root.workspace && typeof root.workspace === "object"
      ? (root.workspace as UnknownRecord)
      : null;

  const candidate =
    readString(root.brand) ||
    readNestedString(workspace, ["brand", "name", "label", "title"]) ||
    "";

  return normalizeWorkspaceDisplayName(candidate, fallback);
}

export function getWorkspaceSurfaceLabel(
  snapshot: unknown,
  surface: "onboarding" | "brand-intelligence" | "pilot"
): string {
  const displayName = getWorkspaceDisplayName(snapshot, "Current workspace");
  const surfaceText = surfaceLabelText(surface);

  if (displayName === "Current workspace") {
    return `Current ${surfaceText} workspace`;
  }

  return `${displayName} ${surfaceText} workspace`;
}