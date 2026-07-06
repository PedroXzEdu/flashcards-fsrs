import { defineConfig } from "@playwright/test";
import { resolve } from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: resolve(__dirname, ".env.e2e") });

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],

  globalSetup: resolve(__dirname, "global-setup.ts"),
  globalTeardown: resolve(__dirname, "global-teardown.ts"),

  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
