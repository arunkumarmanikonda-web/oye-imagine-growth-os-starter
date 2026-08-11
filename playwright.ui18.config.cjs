const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3055",
    headless: true,
    channel: "msedge",
    viewport: { width: 1440, height: 900 }
  }
});