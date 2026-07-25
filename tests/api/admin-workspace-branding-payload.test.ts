import { describe, expect, it } from "vitest";
import {
  getWorkspaceBrandingPayload,
  getWorkspaceDisplayName,
} from "../../src/lib/admin/workspace-branding";

describe("workspace branding payload helper", () => {
  it("returns workspaceDisplayName from explicit input", () => {
    expect(getWorkspaceBrandingPayload("Studio OS")).toEqual({
      workspaceDisplayName: "Studio OS",
    });
  });

  it("matches getWorkspaceDisplayName fallback behavior", () => {
    const value = getWorkspaceDisplayName("Oye Imagine");
    expect(getWorkspaceBrandingPayload("Oye Imagine")).toEqual({
      workspaceDisplayName: value,
    });
  });

  it("returns a non-empty branding payload", () => {
    const payload = getWorkspaceBrandingPayload("Growth Lab");
    expect(payload.workspaceDisplayName).toBe("Growth Lab");
    expect(payload.workspaceDisplayName.length).toBeGreaterThan(0);
  });
});