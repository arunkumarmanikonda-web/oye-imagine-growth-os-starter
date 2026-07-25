const DEFAULT_WORKSPACE_DISPLAY_NAME = "Oye Imagine";

export type WorkspaceBrandingSource =
  | "explicit"
  | "NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME"
  | "WORKSPACE_DISPLAY_NAME"
  | "default";

function cleanValue(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

export function getWorkspaceBrandingDiagnostics(value?: string | null): {
  workspaceDisplayName: string;
  brandingSource: WorkspaceBrandingSource;
} {
  const explicit = cleanValue(value);
  if (explicit) {
    return {
      workspaceDisplayName: explicit,
      brandingSource: "explicit",
    };
  }

  const publicEnv = cleanValue(process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME);
  if (publicEnv) {
    return {
      workspaceDisplayName: publicEnv,
      brandingSource: "NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME",
    };
  }

  const privateEnv = cleanValue(process.env.WORKSPACE_DISPLAY_NAME);
  if (privateEnv) {
    return {
      workspaceDisplayName: privateEnv,
      brandingSource: "WORKSPACE_DISPLAY_NAME",
    };
  }

  return {
    workspaceDisplayName: DEFAULT_WORKSPACE_DISPLAY_NAME,
    brandingSource: "default",
  };
}

export function normalizeWorkspaceDisplayName(value?: string | null): string {
  return getWorkspaceBrandingDiagnostics(value).workspaceDisplayName;
}

export function getWorkspaceDisplayName(value?: string | null): string {
  return normalizeWorkspaceDisplayName(value);
}

export function getWorkspaceSurfaceLabel(
  surface:
    | "onboarding"
    | "brand-intelligence"
    | "pilot"
    | "settings"
    | "ops"
    | "strategy"
    | "execution"
    | "marketplace",
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
    case "settings":
      return `${name} settings workspace`;
    case "ops":
      return `${name} ops workspace`;
    case "strategy":
      return `${name} strategy workspace`;
    case "execution":
      return `${name} execution workspace`;
    case "marketplace":
      return `${name} marketplace workspace`;
    default:
      return `${name} workspace`;
  }
}

export function getWorkspaceBrandingPayload(value?: string | null): {
  workspaceDisplayName: string;
} {
  return {
    workspaceDisplayName: getWorkspaceDisplayName(value),
  };
}