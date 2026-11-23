import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:3100' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start -- -p 3100',
      url: 'http://127.0.0.1:3100',
      reuseExistingServer: !process.env.CI,
    },
    {
      // two-player games go through the relay; the page finds it on port 3001
      command: 'npm run relay',
      url: 'http://127.0.0.1:3001/relay/health',
      env: { RELAY_ORIGINS: 'http://127.0.0.1:3100' },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
