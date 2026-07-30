import { describe, expect, it } from "vitest";
import { evaluateRouteAccess } from "../../src/lib/auth/route-access";
import type { AuthSession } from "../../src/lib/auth/session";

const publicSession: AuthSession = {
  lane: "public",
  isAuthenticated: false,
  email: null,
  workspaceSlug: null,
  tenantSlug: null,
  brandSlug: null,
  issuedAt: null,
};

const adminSession: AuthSession = {
  lane: "admin",
  isAuthenticated: true,
  email: "ops@oyeimagine.com",
  workspaceSlug: "oye-imagine-admin",
  tenantSlug: "oye-imagine",
  brandSlug: "oye-imagine",
  issuedAt: "2026-07-31T00:00:00.000Z",
};

const clientSession: AuthSession = {
  lane: "client",
  isAuthenticated: true,
  email: "client@oyeimagine.com",
  workspaceSlug: "neejee-pilot",
  tenantSlug: "neejee",
  brandSlug: "neejee",
  issuedAt: "2026-07-31T00:00:00.000Z",
};

describe("foundation route access", () => {
  it("redirects unauthenticated admin access", () => {
    const decision = evaluateRouteAccess("/admin", publicSession);

    expect(decision.allow).toBe(false);
    expect(decision.redirectTo).toContain("/login/admin");
  });

  it("redirects unauthenticated client access", () => {
    const decision = evaluateRouteAccess("/client", publicSession);

    expect(decision.allow).toBe(false);
    expect(decision.redirectTo).toContain("/login/client");
  });

  it("allows matching authenticated lanes", () => {
    expect(evaluateRouteAccess("/admin/settings", adminSession).allow).toBe(true);
    expect(evaluateRouteAccess("/client", clientSession).allow).toBe(true);
  });

  it("prevents lane mismatch and redirects to correct login", () => {
    const decision = evaluateRouteAccess("/admin", clientSession);

    expect(decision.allow).toBe(false);
    expect(decision.reason).toBe("lane_mismatch");
    expect(decision.redirectTo).toContain("/login/admin");
  });

  it("redirects already-authenticated users away from login lane pages", () => {
    expect(evaluateRouteAccess("/login/admin", adminSession).redirectTo).toBe("/admin");
    expect(evaluateRouteAccess("/login/client", clientSession).redirectTo).toBe("/client");
  });
});