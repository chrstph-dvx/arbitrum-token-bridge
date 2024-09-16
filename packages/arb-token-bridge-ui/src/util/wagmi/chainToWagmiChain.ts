import { Chain } from 'wagmi'

import { ether } from '../../constants'
import { ChainWithRpcUrl } from '../networks'
import { getBridgeUiConfigForChain } from '../bridgeUiConfig'

export function chainToWagmiChain(chain: ChainWithRpcUrl): Chain {
  const { nativeTokenData } = getBridgeUiConfigForChain(chain.chainId)

  return {
    id: chain.chainId,
    name: chain.name,
    network: chain.name.toLowerCase().split(' ').join('-'),
    nativeCurrency: nativeTokenData ?? ether,
    rpcUrls: {
      default: {
        http: [chain.rpcUrl]
      },
      public: {
        http: [chain.rpcUrl]
      }
    },
    blockExplorers: {
      default: {
        name: 'Block Explorer',
        url: chain.explorerUrl
      }
    }
  }
}
