import { useMemo } from 'react'

import { useNativeCurrency } from '../../../hooks/useNativeCurrency'
import { useNetworks } from '../../../hooks/useNetworks'
import { useNetworksRelationship } from '../../../hooks/useNetworksRelationship'
import { useBalances } from '../../../hooks/useBalances'
import { Balances } from '../../../hooks/TransferPanel/useSelectedTokenBalances'

export function useNativeCurrencyBalances(): Balances {
  const [networks] = useNetworks()
  const { childChainProvider, isDepositMode } =
    useNetworksRelationship(networks)
  const nativeCurrency = useNativeCurrency({ provider: childChainProvider })

  const { ethParentBalance, erc20ParentBalances, ethChildBalance } =
    useBalances()

  return useMemo(() => {
    if (!nativeCurrency.isCustom) {
      return {
        sourceBalance: isDepositMode ? ethParentBalance : ethChildBalance,
        destinationBalance: isDepositMode ? ethChildBalance : ethParentBalance
      }
    }

    const customFeeTokenParentBalance =
      erc20ParentBalances?.[nativeCurrency.address] ?? null
    const customFeeTokenChildBalance = ethChildBalance

    return {
      sourceBalance: isDepositMode
        ? customFeeTokenParentBalance
        : customFeeTokenChildBalance,
      destinationBalance: isDepositMode
        ? customFeeTokenChildBalance
        : customFeeTokenParentBalance
    }
  }, [
    nativeCurrency,
    erc20ParentBalances,
    ethChildBalance,
    isDepositMode,
    ethParentBalance
  ])
}
