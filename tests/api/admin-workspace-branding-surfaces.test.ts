import { describe, expect, it } from "vitest";
import {
  getWorkspaceBrandingPayload,
  getWorkspaceSurfaceLabel,
} from "../../src/lib/admin/workspace-branding";

describe("workspace branding secondary surfaces", () => {
  it("builds settings label", () => {
    expect(getWorkspaceSurfaceLabel("settings", "Oye Imagine")).toBe(
      "Oye Imagine settings workspace",
    );
  });

  it("builds ops label", () => {
    expect(getWorkspaceSurfaceLabel("ops", "Oye Imagine")).toBe(
      "Oye Imagine ops workspace",
    );
  });

  it("builds strategy label", () => {
    expect(getWorkspaceSurfaceLabel("strategy", "Oye Imagine")).toBe(
      "Oye Imagine strategy workspace",
    );
  });

  it("builds execution label", () => {
    expect(getWorkspaceSurfaceLabel("execution", "Oye Imagine")).toBe(
      "Oye Imagine execution workspace",
    );
  });

  it("builds marketplace label", () => {
    expect(getWorkspaceSurfaceLabel("marketplace", "Oye Imagine")).toBe(
      "Oye Imagine marketplace workspace",
    );
  });

  it("keeps branding payload additive", () => {
    expect(getWorkspaceBrandingPayload("Growth Lab")).toEqual({
      workspaceDisplayName: "Growth Lab",
    });
  });
});