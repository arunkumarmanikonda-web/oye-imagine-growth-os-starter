import { describe, expect, it } from "vitest";
import {
  getWorkspaceDisplayName,
  getWorkspaceSurfaceLabel,
} from "../../src/lib/admin/workspace-branding";

describe("workspace ui copy contract", () => {
  it("returns a non-empty workspace display name", () => {
    expect(getWorkspaceDisplayName("Oye Imagine")).toBe("Oye Imagine");
  });

  it("builds onboarding workspace copy", () => {
    expect(getWorkspaceSurfaceLabel("onboarding", "Oye Imagine")).toBe(
      "Oye Imagine onboarding workspace",
    );
  });

  it("builds brand intelligence workspace copy", () => {
    expect(getWorkspaceSurfaceLabel("brand-intelligence", "Oye Imagine")).toBe(
      "Oye Imagine brand intelligence workspace",
    );
  });

  it("builds pilot workspace copy", () => {
    expect(getWorkspaceSurfaceLabel("pilot", "Oye Imagine")).toBe(
      "Oye Imagine pilot workspace",
    );
  });
});