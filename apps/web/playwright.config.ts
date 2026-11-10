import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { E2E_API_PORT, E2E_API_URL, E2E_WEB_PORT, E2E_WEB_URL } from './e2e/support/e2e-env';

/**
 * Frontend asosiy oqimlari (Playwright). Serverlar o'z portlarida ko'tariladi (egasining 3000/3001
 * dev serverlariga tegilmaydi): API — alohida papkaga kompilyatsiya qilinib (`dist` ga tegmaydi),
 * web — `NEXT_DIST_DIR=.next-e2e` bilan production build. PostgreSQL va Redis — compose (5433).
 * Brauzer: `playwright install chromium`; yoki tizim Chrome'i — `E2E_CHROME_PATH=/usr/bin/google-chrome`.
 */
const API_DIR = path.resolve(__dirname, '..', 'api');
const API_E2E_OUT_DIR = 'node_modules/.cache/e2e-api';
const SERVER_START_TIMEOUT_MS = 300_000;
const IS_CI = process.env.CI !== undefined;
const CHROME_PATH = process.env.E2E_CHROME_PATH;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/support/global-setup.ts',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: 0,
  reporter: IS_CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: E2E_WEB_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(CHROME_PATH === undefined ? {} : { launchOptions: { executablePath: CHROME_PATH } }),
      },
    },
  ],
  webServer: [
    {
      command: `node_modules/.bin/tsc -p tsconfig.build.json --outDir ${API_E2E_OUT_DIR} && node --env-file-if-exists=../../.env ${API_E2E_OUT_DIR}/main.js`,
      cwd: API_DIR,
      url: `${E2E_API_URL}/api/v1/health`,
      env: {
        API_PORT: String(E2E_API_PORT),
        WEB_BASE_URL: E2E_WEB_URL,
        LOG_LEVEL: 'warn',
      },
      reuseExistingServer: !IS_CI,
      timeout: SERVER_START_TIMEOUT_MS,
    },
    {
      command: `node_modules/.bin/next build && node_modules/.bin/next start -p ${String(E2E_WEB_PORT)}`,
      url: `${E2E_WEB_URL}/login`,
      env: {
        NEXT_DIST_DIR: '.next-e2e',
        API_INTERNAL_URL: E2E_API_URL,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      reuseExistingServer: !IS_CI,
      timeout: SERVER_START_TIMEOUT_MS,
    },
  ],
});
