/**
 * E2E smoke tests, run against DEMO MODE — no backend required, in CI or
 * locally: `npx playwright test`.
 *
 * Why these exist when 60+ vitest tests already pass: unit tests execute
 * components in jsdom, where whole classes of bug are invisible. The
 * StrictMode session-restore deadlock this template once had (auth status
 * stuck on 'loading' forever — an infinite login spinner) type-checked,
 * passed every unit test, and built cleanly; only a browser hitting /login
 * could see it. This suite is the tripwire for that class.
 *
 * The dev server is used deliberately: it runs React StrictMode, which is
 * where mount/cleanup/remount bugs live.
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Next 16 allows one dev server per project directory. If yours is already
 * running (with demo mode on), point the suite at it instead of fighting the
 * lock:  E2E_PORT=3001 npx playwright test
 * CI always starts its own on the default port.
 */
const PORT = Number(process.env.E2E_PORT ?? 3111);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    // Reuse a dev server you already have running; CI (no server) starts one.
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_DEMO_MODE: 'true',
    },
  },
});
