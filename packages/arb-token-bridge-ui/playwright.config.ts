import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/specs',
  testMatch: '**/*.cy.ts',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['line']],
  expect: {
    timeout: 10000
  },
  timeout: 300000,
  use: {
    actionTimeout: 10000,
    baseURL: 'http://localhost:3000',
    testIdAttribute: 'data-testid',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
