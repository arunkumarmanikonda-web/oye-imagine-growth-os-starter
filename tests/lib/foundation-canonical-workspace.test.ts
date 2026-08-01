import { describe, expect, it } from "vitest";
import { resolveCanonicalWorkspaceContext } from "../../src/lib/admin/canonical-workspace";

describe("foundation canonical workspace", () => {
  it("returns Neejee fallback for client lane", () => {
    const context = resolveCanonicalWorkspaceContext({
      lane: "client",
      workspaceSlug: null,
      tenantSlug: null,
      brandSlug: null,
    });

    expect(context.workspaceSlug).toBe("neejee-pilot");
    expect(context.brandName).toBe("Neejee");
    expect(context.source).toBe("fallback");
  });

  it("returns Oye Imagine fallback for admin lane", () => {
    const context = resolveCanonicalWorkspaceContext({
      lane: "admin",
      workspaceSlug: null,
      tenantSlug: null,
      brandSlug: null,
    });

    expect(context.workspaceSlug).toBe("oye-imagine-admin");
    expect(context.tenantSlug).toBe("oye-imagine");
    expect(context.source).toBe("fallback");
  });

  it("prefers explicit session context when present", () => {
    const context = resolveCanonicalWorkspaceContext({
      lane: "admin",
      workspaceSlug: "ops-eu",
      tenantSlug: "tenant-eu",
      brandSlug: "brand-eu",
    });

    expect(context.workspaceSlug).toBe("ops-eu");
    expect(context.tenantSlug).toBe("tenant-eu");
    expect(context.brandSlug).toBe("brand-eu");
    expect(context.source).toBe("session");
  });
});