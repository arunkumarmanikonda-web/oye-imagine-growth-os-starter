import { describe, expect, it } from "vitest";
import {
  authCookieKeys,
  buildAuthCookieRecord,
  createLoginRedirectPath,
  resolveAuthSessionFromCookieMap,
} from "../../src/lib/auth/session";

describe("foundation auth session", () => {
  it("resolves authenticated client session from cookies", () => {
    const session = resolveAuthSessionFromCookieMap({
      [authCookieKeys.lane]: "client",
      [authCookieKeys.email]: "client@oyeimagine.com",
      [authCookieKeys.workspaceSlug]: "neejee-pilot",
      [authCookieKeys.tenantSlug]: "neejee",
      [authCookieKeys.brandSlug]: "neejee",
      [authCookieKeys.issuedAt]: "2026-07-31T00:00:00.000Z",
    });

    expect(session.isAuthenticated).toBe(true);
    expect(session.lane).toBe("client");
    expect(session.workspaceSlug).toBe("neejee-pilot");
  });

  it("falls back to public session when cookies are incomplete", () => {
    const session = resolveAuthSessionFromCookieMap({
      [authCookieKeys.lane]: "admin",
    });

    expect(session.isAuthenticated).toBe(false);
    expect(session.lane).toBe("public");
  });

  it("creates safe lane redirect paths and cookie records", () => {
    expect(createLoginRedirectPath("admin", "/admin")).toBe("/admin");
    expect(createLoginRedirectPath("client", "/admin")).toBe("/client");

    const record = buildAuthCookieRecord({
      lane: "admin",
      email: "ops@oyeimagine.com",
      workspaceSlug: "oye-imagine-admin",
      tenantSlug: "oye-imagine",
      brandSlug: "oye-imagine",
      issuedAt: "2026-07-31T00:00:00.000Z",
    });

    expect(record[authCookieKeys.email]).toBe("ops@oyeimagine.com");
    expect(record[authCookieKeys.workspaceSlug]).toBe("oye-imagine-admin");
  });
});