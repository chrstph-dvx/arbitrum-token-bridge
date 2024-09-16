import { Chain, mainnet } from 'wagmi'

import {
  arbitrumNova,
  arbitrumSepolia,
  localL1Network,
  localL2Network,
  localL3Network,
  sepolia
} from './wagmi/wagmiAdditionalNetworks'
import { ChainKeyQueryParam } from '../types/ChainQueryParam'
import { ChainId, rpcURLs } from './networks'
import { ether } from '../constants'
import { getOrbitChains } from './orbitChainsList'
import { arbitrum } from '@wagmi/chains'
import { chainToWagmiChain } from './wagmi/chainToWagmiChain'

// const arbitrumNova: Chain = {
//   id: ChainId.ArbitrumNova,
//   name: 'Arbitrum Nova',
//   network: 'arbitrum-nova',
//   nativeCurrency: ether,
//   rpcUrls: {
//     default: {
//       http: [rpcURLs[ChainId.ArbitrumNova]!]
//     },
//     public: {
//       http: [rpcURLs[ChainId.ArbitrumNova]!]
//     }
//   },
//   blockExplorers: {
//     etherscan: { name: 'Arbiscan', url: 'https://nova.arbiscan.io' },
//     default: { name: 'Arbiscan', url: 'https://nova.arbiscan.io' }
//   }
// }

export function getChainForChainKeyQueryParam(
  chainKeyQueryParam: ChainKeyQueryParam
): Chain {
  console.log('in getChainForChainKeyQueryParam')
  switch (chainKeyQueryParam) {
    case 'ethereum':
      return mainnet

    case 'sepolia':
      return sepolia

    case 'arbitrum-one':
      return arbitrum

    // case 'arbitrum-nova':
    //   return arbitrumNova

    case 'arbitrum-sepolia':
      return arbitrumSepolia

    // case 'custom-localhost':
    //   return localL1Network

    // case 'arbitrum-localhost':
    //   return localL2Network

    // case 'l3-localhost':
    //   return localL3Network

    default:
      const orbitChain = getOrbitChains().find(
        chain =>
          chain.slug === chainKeyQueryParam ??
          chain.chainId === Number(chainKeyQueryParam)
      )

      if (orbitChain) {
        return chainToWagmiChain(orbitChain)
      }

      throw new Error(
        `[getChainForChainKeyQueryParam] Unexpected chainKeyQueryParam: ${chainKeyQueryParam}`
      )
  }
}
