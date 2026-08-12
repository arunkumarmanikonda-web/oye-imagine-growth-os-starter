const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const routes = [
  "/",
  "/contact",
  "/demo",
  "/qualification",
  "/lead-capture",
  "/accessibility"
];

for (const route of routes) {
  test(`accessibility smoke ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations, `axe violations on ${route}`).toEqual([]);
  });
}