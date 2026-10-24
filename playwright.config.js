import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "runtime.spec.js",
  workers: 1,
  timeout: 90000,
  use: {
    viewport: { width: 960, height: 640 },
    launchOptions: {
      channel: process.env.CI ? undefined : "chrome",
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
  },
  webServer: process.env.WORLDFOLIO_URL
    ? undefined
    : {
        command: "npm run preview -- --port 5184 --strictPort",
        url: "http://127.0.0.1:5184/",
        reuseExistingServer: !process.env.CI,
      },
});
