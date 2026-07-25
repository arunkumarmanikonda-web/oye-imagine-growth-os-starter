const DEFAULT_WORKSPACE_DISPLAY_NAME = "Oye Imagine";

function cleanValue(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

export function normalizeWorkspaceDisplayName(value?: string | null): string {
  const explicit = cleanValue(value);
  if (explicit) return explicit;

  const publicEnv = cleanValue(process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME);
  if (publicEnv) return publicEnv;

  const privateEnv = cleanValue(process.env.WORKSPACE_DISPLAY_NAME);
  if (privateEnv) return privateEnv;

  return DEFAULT_WORKSPACE_DISPLAY_NAME;
}

export function getWorkspaceDisplayName(value?: string | null): string {
  return normalizeWorkspaceDisplayName(value);
}

export function getWorkspaceSurfaceLabel(
  surface: "onboarding" | "brand-intelligence" | "pilot",
  workspaceName?: string | null,
): string {
  const name = normalizeWorkspaceDisplayName(workspaceName);

  switch (surface) {
    case "onboarding":
      return `${name} onboarding workspace`;
    case "brand-intelligence":
      return `${name} brand intelligence workspace`;
    case "pilot":
      return `${name} pilot workspace`;
    default:
      return `${name} workspace`;
  }
}