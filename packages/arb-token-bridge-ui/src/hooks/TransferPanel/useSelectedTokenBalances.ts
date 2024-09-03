import { BigNumber, constants } from 'ethers'
import { useMemo } from 'react'
import { useAppState } from '../../state'
import { useNetworks } from '../useNetworks'
import {
  isTokenArbitrumOneNativeUSDC,
  isTokenArbitrumSepoliaNativeUSDC
} from '../../util/TokenUtils'
import { CommonAddress } from '../../util/CommonAddressUtils'
import { isNetwork } from '../../util/networks'
import { useBalances } from '../useBalances'
import { useNetworksRelationship } from '../useNetworksRelationship'

export type Balances = {
  sourceBalance: BigNumber | null
  destinationBalance: BigNumber | null
}

export function useSelectedTokenBalances(): Balances {
  const { app } = useAppState()
  const { selectedToken } = app
  const [networks] = useNetworks()
  const { isDepositMode } = useNetworksRelationship(networks)

  const {
    isArbitrumOne: isSourceChainArbitrumOne,
    isEthereumMainnet: isSourceChainEthereum,
    isSepolia: isSourceChainSepolia,
    isArbitrumSepolia: isSourceChainArbitrumSepolia
  } = isNetwork(networks.sourceChain.id)
  const {
    isArbitrumOne: isDestinationChainArbitrumOne,
    isEthereumMainnet: isDestinationChainEthereum,
    isSepolia: isDestinationChainSepolia,
    isArbitrumSepolia: isDestinationChainArbitrumSepolia
  } = isNetwork(networks.destinationChain.id)

  const isSepoliaArbSepoliaPair =
    (isSourceChainSepolia && isDestinationChainArbitrumSepolia) ||
    (isSourceChainArbitrumSepolia && isDestinationChainSepolia)

  const isEthereumArbitrumOnePair =
    (isSourceChainEthereum && isDestinationChainArbitrumOne) ||
    (isSourceChainArbitrumOne && isDestinationChainEthereum)

  const { erc20ParentBalances, erc20ChildBalances } = useBalances()

  return useMemo(() => {
    const result: Balances = {
      sourceBalance: null,
      destinationBalance: null
    }

    if (!selectedToken) {
      return result
    }

    if (!erc20ParentBalances) {
      return result
    }

    if (!erc20ChildBalances) {
      return result
    }

    let parentBalance =
      erc20ParentBalances[selectedToken.address.toLowerCase()] ?? null

    let childBalance: BigNumber | null = null

    if (selectedToken.l2Address) {
      childBalance =
        erc20ChildBalances[selectedToken.l2Address.toLowerCase()] ??
        constants.Zero
    } else {
      // token not bridged to the child chain, show zero
      childBalance = constants.Zero
    }

    if (
      isTokenArbitrumOneNativeUSDC(selectedToken.address) &&
      isEthereumArbitrumOnePair
    ) {
      parentBalance =
        erc20ParentBalances[CommonAddress.Ethereum.USDC.toLowerCase()] ?? null
      childBalance =
        erc20ChildBalances[selectedToken.address.toLowerCase()] ?? null
    }
    if (
      isTokenArbitrumSepoliaNativeUSDC(selectedToken.address.toLowerCase()) &&
      isSepoliaArbSepoliaPair
    ) {
      parentBalance =
        erc20ParentBalances[CommonAddress.Sepolia.USDC.toLowerCase()] ?? null
      childBalance =
        erc20ChildBalances[selectedToken.address.toLowerCase()] ?? null
    }

    return {
      sourceBalance: isDepositMode ? parentBalance : childBalance,
      destinationBalance: isDepositMode ? childBalance : parentBalance
    }
  }, [
    selectedToken,
    erc20ParentBalances,
    erc20ChildBalances,
    isEthereumArbitrumOnePair,
    isSepoliaArbSepoliaPair,
    isDepositMode
  ])
}
