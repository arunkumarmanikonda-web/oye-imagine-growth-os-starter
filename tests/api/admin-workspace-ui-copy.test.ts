import { describe, expect, it } from "vitest";

import {
  getWorkspaceDisplayName,
  getWorkspaceSurfaceLabel,
} from "@/lib/admin/workspace-branding";

describe("workspace admin UI copy contract", () => {
  it("uses the root product brand when available", () => {
    const snapshot = { brand: "Oye Imagine", workspace: { name: "Ignored Name" } };
    expect(getWorkspaceDisplayName(snapshot)).toBe("Oye Imagine");
  });

  it("suppresses tenant-facing Neejee labels from visible workspace copy", () => {
    expect(getWorkspaceDisplayName({ brand: "Neejee" })).toBe("Current workspace");
    expect(getWorkspaceSurfaceLabel({ brand: "Neejee" }, "onboarding")).toBe(
      "Current onboarding workspace"
    );
    expect(getWorkspaceSurfaceLabel({ workspace: { name: "Neejee pilot workspace" } }, "pilot")).toBe(
      "Current pilot workspace"
    );
  });

  it("keeps generic workspace names if they are not tenant-specific", () => {
    expect(getWorkspaceDisplayName({ workspace: { title: "Workspace Title" } })).toBe("Workspace Title");
  });

  it("uses fallback branding when no brand is present", () => {
    expect(getWorkspaceSurfaceLabel({}, "brand-intelligence")).toBe(
      "Current brand intelligence workspace"
    );
  });
});