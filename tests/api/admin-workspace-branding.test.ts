import { describe, expect, it } from "vitest";

import {
  getWorkspaceDisplayName,
  getWorkspaceSurfaceLabel,
} from "@/lib/admin/workspace-branding";

describe("workspace branding helper", () => {
  it("reads brand from the root snapshot first when it is not tenant-specific", () => {
    expect(getWorkspaceDisplayName({ brand: "Oye Imagine" })).toBe("Oye Imagine");
  });

  it("falls back to current workspace when tenant-specific naming is present", () => {
    expect(getWorkspaceDisplayName({ brand: "Neejee" })).toBe("Current workspace");
    expect(getWorkspaceDisplayName({ workspace: { name: "Neejee pilot workspace" } })).toBe("Current workspace");
    expect(getWorkspaceDisplayName({ workspace: { label: "Neejee onboarding workspace" } })).toBe("Current workspace");
  });

  it("uses nested workspace naming fields when they are generic", () => {
    expect(getWorkspaceDisplayName({ workspace: { name: "Workspace Alpha" } })).toBe("Workspace Alpha");
    expect(getWorkspaceDisplayName({ workspace: { label: "Workspace Beta" } })).toBe("Workspace Beta");
  });

  it("returns the fallback when no usable name exists", () => {
    expect(getWorkspaceDisplayName({}, "Current workspace")).toBe("Current workspace");
  });

  it("builds normalized surface-aware labels", () => {
    expect(getWorkspaceSurfaceLabel({ brand: "Oye Imagine" }, "onboarding")).toBe(
      "Oye Imagine onboarding workspace"
    );
    expect(getWorkspaceSurfaceLabel({ brand: "Neejee" }, "brand-intelligence")).toBe(
      "Current brand intelligence workspace"
    );
    expect(getWorkspaceSurfaceLabel({}, "pilot")).toBe("Current pilot workspace");
  });
});