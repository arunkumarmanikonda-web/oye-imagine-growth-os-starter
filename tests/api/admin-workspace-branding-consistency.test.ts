import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const routeFiles = [
  "src/app/api/admin/execution/route.ts",
  "src/app/api/admin/exports/route.ts",
  "src/app/api/admin/marketplace/events/route.ts",
  "src/app/api/admin/marketplace/proposals/route.ts",
  "src/app/api/admin/marketplace/requests/route.ts",
  "src/app/api/bootstrap/seed/route.ts",
  "src/app/api/bootstrap/neejee-seed/route.ts",
  "src/app/api/marketplace/requests/route.ts",
  "src/app/api/marketplace/services/route.ts",
  "src/app/api/marketplace/specialists/route.ts",
];

describe("workspace branding consistency across remaining route surfaces", () => {
  it("keeps every targeted route wired to workspace branding", () => {
    for (const relativePath of routeFiles) {
      const absolutePath = join(process.cwd(), relativePath);
      const source = readFileSync(absolutePath, "utf8");

      expect(source).toContain('getWorkspaceDisplayName');
      expect(source).toContain('workspaceDisplayName');
    }
  });
});