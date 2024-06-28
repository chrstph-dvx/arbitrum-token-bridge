import { test, expect } from '@playwright/test'
import { initialize, metamask, teardown } from '@synthetixio/synpress'
import {
  importTokenThroughUI,
  ERC20TokenName,
  ERC20TokenSymbol,
  zeroToLessThanOneETH
} from '../../support/common'

const ERC20TokenAddressL1 = process.env.ERC20_TOKEN_ADDRESS_L1

test.describe('Approve token and deposit afterwards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/') // Assuming this is your app's base URL
  })

  test('should approve and deposit ERC-20 token', async ({ page }) => {
    // Import token through UI
    await importTokenThroughUI(page, ERC20TokenAddressL1)

    // Select the ERC-20 token
    await expect(page.getByText('Added by User')).toBeVisible()
    await page.getByText(ERC20TokenName).click()

    // ERC-20 token should be selected now and popup should be closed after selection
    const selectTokenButton = page.getByRole('button', { name: 'Select Token' })
    await expect(selectTokenButton).toBeVisible()
    await expect(selectTokenButton).toHaveText(ERC20TokenSymbol)

    await page.getByText('MAX').click()

    // Check gas fees
    await expect(
      page
        .getByText('You will pay in gas fees:')
        .locator('..')
        .getByText(zeroToLessThanOneETH)
    ).toBeVisible()
    await expect(
      page
        .getByText('Ethereum Local gas fee')
        .locator('../..')
        .getByText(zeroToLessThanOneETH)
    ).toBeVisible()
    await expect(
      page
        .getByText('Arbitrum Local gas fee')
        .locator('../..')
        .getByText(zeroToLessThanOneETH)
    ).toBeVisible()

    // Wait for the "Move funds" button to be enabled
    const moveFundsButton = page.getByRole('button', {
      name: /Move funds to Arbitrum Local/i
    })
    await expect(moveFundsButton).toBeEnabled({ timeout: 50000 })

    await moveFundsButton.scrollIntoViewIfNeeded()
    await moveFundsButton.click()

    await page.getByText(/pay a one-time approval fee/).click()
    await page.getByRole('button', { name: /Pay approval fee of/ }).click()

    // Confirm MetaMask permission to spend
    await metamask.confirmPermissionToSpend('1')
  })

  test.afterEach(async ({ page }) => {
    await teardown(page)
  })
})
