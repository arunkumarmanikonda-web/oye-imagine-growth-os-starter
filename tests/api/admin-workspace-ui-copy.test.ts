import { describe, expect, it } from "vitest";

import {
  getWorkspaceDisplayName,
  getWorkspaceSurfaceLabel,
} from "@/lib/admin/workspace-branding";

describe("workspace admin UI copy contract", () => {
  it("uses the root brand when available", () => {
    const snapshot = { brand: "Oye Imagine", workspace: { name: "Ignored Name" } };
    expect(getWorkspaceDisplayName(snapshot)).toBe("Oye Imagine");
  });

  it("falls back to workspace naming fields in stable order", () => {
    expect(getWorkspaceDisplayName({ workspace: { name: "Workspace Name" } })).toBe("Workspace Name");
    expect(getWorkspaceDisplayName({ workspace: { label: "Workspace Label" } })).toBe("Workspace Label");
    expect(getWorkspaceDisplayName({ workspace: { title: "Workspace Title" } })).toBe("Workspace Title");
  });

  it("builds surface-specific hero eyebrow labels", () => {
    const snapshot = { brand: "Oye Imagine" };

    expect(getWorkspaceSurfaceLabel(snapshot, "onboarding")).toBe(
      "Oye Imagine onboarding workspace"
    );
    expect(getWorkspaceSurfaceLabel(snapshot, "brand-intelligence")).toBe(
      "Oye Imagine brand intelligence workspace"
    );
    expect(getWorkspaceSurfaceLabel(snapshot, "pilot")).toBe(
      "Oye Imagine pilot workspace"
    );
  });

  it("uses fallback branding when no brand is present", () => {
    expect(getWorkspaceSurfaceLabel({}, "onboarding")).toBe("Workspace onboarding workspace");
  });
});