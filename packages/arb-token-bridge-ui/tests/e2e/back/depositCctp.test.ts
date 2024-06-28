import { test, expect } from '@playwright/test'
import { synpressPlugins } from '@synthetixio/synpress'
import { formatAmount } from '../../../src/util/NumberUtils'
import { zeroToLessThanOneETH } from '../../support/common'
import { CommonAddress } from '../../../src/util/CommonAddressUtils'
import { shortenAddress } from '../../../src/util/CommonUtils'

// Helper function for CCTP deposit confirmation
async function confirmAndApproveCctpDeposit(page) {
  await expect(
    page.getByRole('tab', { name: 'Native USDC', selected: true })
  ).toBeVisible()
  await expect(
    page.getByRole('tab', {
      name: 'Native USDC (Third Party Bridge)',
      selected: false
    })
  ).toBeVisible()
  await expect(
    page.getByRole('tab', { name: 'Wrapped USDC (USDC.e)', selected: false })
  ).toBeVisible()

  const continueButton = page.getByRole('button', { name: /Continue/i })
  await expect(continueButton).toBeVisible()
  await expect(continueButton).toBeDisabled()

  await page
    .getByRole('switch', { name: /I understand that I'll have to send/i })
    .click()
  await page
    .getByRole('switch', { name: /I understand that it will take/i })
    .click()
  await page.getByRole('switch', { name: /I understand USDC.e/i }).click()

  await expect(continueButton).toBeEnabled()
  await continueButton.click()

  await page.getByText(/I understand that I have to/).click()
  await page.getByRole('button', { name: /Pay approval fee of/ }).click()
  console.log('Approving USDC...')
}

test.describe('Deposit USDC through CCTP', () => {
  let USDCAmountToSend = 0

  test.beforeEach(async ({ page }) => {
    await synpressPlugins.initialize(page)
    await synpressPlugins.metamask.login()

    USDCAmountToSend = Number((Math.random() * 0.001).toFixed(6))

    // TODO: Implement these functions for Playwright
    // await fundUserWalletEth('L1');
    // await fundUserUsdcTestnet('L1');
    // await resetCctpAllowance('L1');

    await page.goto('/') // Assuming this is your app's base URL

    await expect(
      page.getByRole('button', { name: /From: Sepolia/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /To: Arbitrum Sepolia/i })
    ).toBeVisible()
    const selectTokenButton = page.getByRole('button', { name: 'Select Token' })
    await expect(selectTokenButton).toBeVisible()
    await expect(selectTokenButton).toHaveText('ETH')

    // TODO: Implement searchAndSelectToken for Playwright
    // await searchAndSelectToken(page, {
    //   tokenName: 'USDC',
    //   tokenAddress: CommonAddress.Sepolia.USDC
    // });

    await page.getByPlaceholder('Enter amount').fill(String(USDCAmountToSend))
    await expect(
      page
        .getByText(/You will pay in gas fees:/i)
        .locator('..')
        .getByText(zeroToLessThanOneETH)
    ).toBeVisible()
    await expect(
      page
        .getByText(/gas fee$/)
        .first()
        .locator('../..')
        .getByText(zeroToLessThanOneETH)
    ).toBeVisible()
    await expect(
      page.getByText(/You'll have to pay [\w\s]+ gas fee upon claiming./i)
    ).toBeVisible()
  })

  test('should initiate depositing USDC to the same address through CCTP successfully', async ({
    page
  }) => {
    const depositButton = page.getByRole('button', {
      name: /Move funds to Arbitrum Sepolia/i
    })
    await depositButton.scrollIntoViewIfNeeded()
    await expect(depositButton).toBeVisible()
    await expect(depositButton).toBeEnabled()
    await depositButton.click()

    await confirmAndApproveCctpDeposit(page)
    await synpressPlugins.metamask.confirmPermissionToSpend(
      USDCAmountToSend.toString()
    )

    await page.waitForTimeout(40000) // TODO: Replace with a more robust waiting mechanism
    await synpressPlugins.metamask.confirmTransaction()

    await expect(page.getByText('Pending transactions')).toBeVisible()
    await expect(
      page.getByText(formatAmount(USDCAmountToSend, { symbol: 'USDC' }))
    ).toBeVisible()
  })

  test('should initiate depositing USDC to custom destination address through CCTP successfully', async ({
    page
  }) => {
    // TODO: Implement fillCustomDestinationAddress for Playwright
    // await fillCustomDestinationAddress(page);

    const depositButton = page.getByRole('button', {
      name: /Move funds to Arbitrum Sepolia/i
    })
    await depositButton.scrollIntoViewIfNeeded()
    await depositButton.click()

    await confirmAndApproveCctpDeposit(page)
    await synpressPlugins.metamask.confirmPermissionToSpend(
      USDCAmountToSend.toString()
    )

    await page.waitForTimeout(40000) // TODO: Replace with a more robust waiting mechanism
    await synpressPlugins.metamask.confirmTransaction()

    await expect(page.getByText('Pending transactions')).toBeVisible()
    await expect(
      page.getByText(formatAmount(USDCAmountToSend, { symbol: 'USDC' }))
    ).toBeVisible()

    await page.getByLabel('Transaction details button').first().click()
    await expect(page.getByText('Transaction details')).toBeVisible()
    await expect(page.getByText(/CUSTOM ADDRESS/i)).toBeVisible()

    const customAddress = process.env.CUSTOM_DESTINATION_ADDRESS
    await expect(
      page.getByLabel(`Custom address: ${shortenAddress(customAddress)}`)
    ).toBeVisible()

    await page.getByLabel('Close transaction details popup').click()
  })

  test.afterEach(async ({ page }) => {
    await synpressPlugins.teardown(page)
  })
})
