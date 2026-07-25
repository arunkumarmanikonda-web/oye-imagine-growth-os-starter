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

export function getWorkspaceDisplayName(snapshot: unknown, fallback = "Workspace"): string {
  if (!snapshot || typeof snapshot !== "object") return fallback;

  const root = snapshot as UnknownRecord;
  const workspace =
    root.workspace && typeof root.workspace === "object"
      ? (root.workspace as UnknownRecord)
      : null;

  return (
    readString(root.brand) ||
    readNestedString(workspace, ["brand", "name", "label", "title"]) ||
    fallback
  );
}

export function getWorkspaceSurfaceLabel(
  snapshot: unknown,
  surface: "onboarding" | "brand-intelligence" | "pilot"
): string {
  const workspaceName = getWorkspaceDisplayName(snapshot);

  if (surface === "onboarding") return `${workspaceName} onboarding workspace`;
  if (surface === "brand-intelligence") return `${workspaceName} brand intelligence workspace`;
  return `${workspaceName} pilot workspace`;
}