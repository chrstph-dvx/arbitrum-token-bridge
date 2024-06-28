const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e/specs',
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    headless: false
  }
})
