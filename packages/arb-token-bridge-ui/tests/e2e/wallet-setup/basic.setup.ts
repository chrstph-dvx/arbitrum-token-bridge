import { defineWalletSetup, MetaMask } from '@synthetixio/synpress'

const SEED_PHRASE =
  'test test test test test test test test test test test junk'
const PASSWORD = 'VeryTopSecretPasswordOmgDontSteal'

export default defineWalletSetup(
  PASSWORD,
  async (context: any, walletPage: any) => {
    const metamask = new MetaMask(context, walletPage, PASSWORD)
    await metamask.importWallet(SEED_PHRASE)
  }
)
