import { describe, expect, it, vi } from "vitest";

describe("workspace branding diagnostics", () => {
  it("prefers explicit branding values", async () => {
    vi.resetModules();
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceBrandingDiagnostics("Studio OS")).toEqual({
      workspaceDisplayName: "Studio OS",
      brandingSource: "explicit",
    });
  });

  it("uses NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME when present", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME = "Public Workspace";
    delete process.env.WORKSPACE_DISPLAY_NAME;
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceBrandingDiagnostics()).toEqual({
      workspaceDisplayName: "Public Workspace",
      brandingSource: "NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME",
    });
  });

  it("falls back to WORKSPACE_DISPLAY_NAME when public env is absent", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    process.env.WORKSPACE_DISPLAY_NAME = "Private Workspace";
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceBrandingDiagnostics()).toEqual({
      workspaceDisplayName: "Private Workspace",
      brandingSource: "WORKSPACE_DISPLAY_NAME",
    });
  });

  it("falls back to default branding when envs are absent", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceBrandingDiagnostics()).toEqual({
      workspaceDisplayName: "Oye Imagine",
      brandingSource: "default",
    });
  });
});