import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests",
  testMatch: "checkout-compatibility.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 2 * 60 * 1000,
  reporter: [["list"]],
  use: {
    baseURL,
    colorScheme: "light",
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "webkit-desktop",
      grep: /@desktop/,
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "webkit-touch",
      grep: /@touch/,
      use: {
        ...devices["iPhone 13"],
      },
    },
  ],
  webServer: {
    command: "pnpm start --hostname 127.0.0.1 --port 3000",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
