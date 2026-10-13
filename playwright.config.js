import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default defineConfig({
  testDir: './tests',
  outputDir: join(tmpdir(), 'cowdy-playwright-results'),
  fullyParallel: false,
  workers: 1,
  timeout: 35000,
  webServer: process.env.COWDY_TEST_URL ? undefined : [
    { command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4178 --strictPort', url: 'http://127.0.0.1:4178', reuseExistingServer: false, timeout: 30000 },
    { command: 'npm run preview -- --host 127.0.0.1 --port 4179 --strictPort --base /portfolio/', url: 'http://127.0.0.1:4179/portfolio/', reuseExistingServer: false, timeout: 30000 },
  ],
  use: {
    baseURL: process.env.COWDY_TEST_URL || 'http://127.0.0.1:4179/portfolio/',
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.env.COWDY_CHROME ? { executablePath: process.env.COWDY_CHROME } : {},
  },
});
