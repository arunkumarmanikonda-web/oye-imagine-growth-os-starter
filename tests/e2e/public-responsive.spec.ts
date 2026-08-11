import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', requiresForm: false },
  { path: '/contact', requiresForm: false },
  { path: '/demo', requiresForm: true },
  { path: '/qualification', requiresForm: true },
  { path: '/lead-capture', requiresForm: true },
];

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
];

for (const vp of viewports) {
  test.describe(`public responsive ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of routes) {
      test(`${route.path} renders without horizontal overflow`, async ({ page }) => {
        const baseUrl = process.env.BASE_URL!;
        const response = await page.goto(baseUrl + route.path, { waitUntil: 'domcontentloaded', timeout: 60000 });
        expect(response?.status()).toBe(200);

        await page.waitForTimeout(1200);

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(
            doc ? doc.scrollWidth : 0,
            body ? body.scrollWidth : 0
          );
          const innerWidth = window.innerWidth;
          return {
            horizontalOverflow: scrollWidth > innerWidth + 1,
            scrollWidth,
            innerWidth
          };
        });

        expect(metrics.horizontalOverflow, JSON.stringify(metrics)).toBeFalsy();

        if (route.requiresForm) {
          await expect(page.locator('form').first()).toBeVisible();
        }
      });
    }
  });
}
