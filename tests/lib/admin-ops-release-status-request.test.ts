import { describe, expect, it } from "vitest";
import { buildReleaseStatusRequestPath } from "../../src/lib/ops/admin-ops-release-status";

describe("admin ops release-status request path", () => {
  it("returns the base route when no search is provided", () => {
    expect(buildReleaseStatusRequestPath("")).toBe("/api/admin/release-status");
    expect(buildReleaseStatusRequestPath(null)).toBe("/api/admin/release-status");
  });

  it("preserves a leading question mark search string", () => {
    expect(buildReleaseStatusRequestPath("?tenantId=tenant_neejee&companyName=Neejee")).toBe(
      "/api/admin/release-status?tenantId=tenant_neejee&companyName=Neejee",
    );
  });

  it("adds a question mark when the search string has no prefix", () => {
    expect(buildReleaseStatusRequestPath("tenantId=tenant_neejee")).toBe(
      "/api/admin/release-status?tenantId=tenant_neejee",
    );
  });
});
