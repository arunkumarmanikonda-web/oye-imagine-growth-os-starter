import { describe, expect, it } from "vitest";

import {
  getWorkspaceDisplayName,
  getWorkspaceSurfaceLabel,
} from "@/lib/admin/workspace-branding";

describe("workspace branding helper", () => {
  it("reads brand from the root snapshot first", () => {
    expect(getWorkspaceDisplayName({ brand: "Oye Imagine" })).toBe("Oye Imagine");
  });

  it("falls back to nested workspace naming fields", () => {
    expect(getWorkspaceDisplayName({ workspace: { name: "Workspace Alpha" } })).toBe("Workspace Alpha");
    expect(getWorkspaceDisplayName({ workspace: { label: "Workspace Beta" } })).toBe("Workspace Beta");
  });

  it("returns the fallback when no name exists", () => {
    expect(getWorkspaceDisplayName({}, "Workspace")).toBe("Workspace");
  });

  it("builds surface-aware labels", () => {
    const snapshot = { brand: "Oye Imagine" };
    expect(getWorkspaceSurfaceLabel(snapshot, "onboarding")).toBe("Oye Imagine onboarding workspace");
    expect(getWorkspaceSurfaceLabel(snapshot, "brand-intelligence")).toBe("Oye Imagine brand intelligence workspace");
    expect(getWorkspaceSurfaceLabel(snapshot, "pilot")).toBe("Oye Imagine pilot workspace");
  });
});