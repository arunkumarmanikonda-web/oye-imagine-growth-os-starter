const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: /tests[\\/]+e2e[\\/]+public-responsive\.spec\.ts$/,
  timeout: 60000,
  workers: 1,
  reporter: 'line',
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3054',
    launchOptions: process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}
  }
});
