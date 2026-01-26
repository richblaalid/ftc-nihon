import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for FTC: Nihon UX Audit
 * Configured for iPhone 13 Pro viewport (390x844) to match target users
 */
export default defineConfig({
  testDir: './tests/audit',

  // Run tests sequentially for audit consistency
  fullyParallel: false,

  // Fail build on CI if test.only is present
  forbidOnly: !!process.env.CI,

  // No retries for audit - we want to capture real failures
  retries: 0,

  // Single worker for consistent results
  workers: 1,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/audit-results.json' }],
  ],

  // Global timeout
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Shared settings
  use: {
    baseURL: 'http://localhost:4000',

    // Trace on failure for debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',

    // Mobile viewport matching iPhone 13 Pro
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },

  // Projects for different testing scenarios
  projects: [
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13 Pro'],
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari Dark',
      use: {
        ...devices['iPhone 13 Pro'],
        colorScheme: 'dark',
      },
    },
    {
      name: 'Mobile Chrome Dark',
      use: {
        ...devices['Pixel 5'],
        colorScheme: 'dark',
      },
    },
  ],

  // Start dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
