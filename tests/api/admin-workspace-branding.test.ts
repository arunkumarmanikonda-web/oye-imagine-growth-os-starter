import { describe, expect, it, vi } from "vitest";

describe("workspace-branding helpers", () => {
  it("prefers explicit display name", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME = "Configured Workspace";
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceDisplayName("Explicit Workspace")).toBe("Explicit Workspace");
  });

  it("uses NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME when explicit name is absent", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME = "Configured Workspace";
    delete process.env.WORKSPACE_DISPLAY_NAME;
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceDisplayName()).toBe("Configured Workspace");
  });

  it("falls back to WORKSPACE_DISPLAY_NAME when public env is absent", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    process.env.WORKSPACE_DISPLAY_NAME = "Internal Workspace";
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceDisplayName()).toBe("Internal Workspace");
  });

  it("falls back to Oye Imagine by default", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceDisplayName()).toBe("Oye Imagine");
  });

  it("builds surface labels from resolved workspace name", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME;
    delete process.env.WORKSPACE_DISPLAY_NAME;
    const mod = await import("../../src/lib/admin/workspace-branding");
    expect(mod.getWorkspaceSurfaceLabel("onboarding")).toBe("Oye Imagine onboarding workspace");
    expect(mod.getWorkspaceSurfaceLabel("brand-intelligence", "Studio OS")).toBe("Studio OS brand intelligence workspace");
    expect(mod.getWorkspaceSurfaceLabel("pilot", "Growth Lab")).toBe("Growth Lab pilot workspace");
  });
});