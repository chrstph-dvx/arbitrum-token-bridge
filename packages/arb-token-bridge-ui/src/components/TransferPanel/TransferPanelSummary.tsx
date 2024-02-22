import React, { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import { formatAmount } from '../../util/NumberUtils'
import { getBaseChainIdByChainId, getNetworkName } from '../../util/networks'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'
import { useGasSummary } from '../../hooks/TransferPanel/useGasSummary'
import { useArbQueryParams } from '../../hooks/useArbQueryParams'
import { TokenSymbolWithExplorerLink } from '../common/TokenSymbolWithExplorerLink'
import { ERC20BridgeToken } from '../../hooks/arbTokenBridge.types'
import dayjs from 'dayjs'
import { getTxConfirmationDate } from '../common/WithdrawalCountdown'
import { useNetworks } from '../../hooks/useNetworks'
import { useNetworksRelationship } from '../../hooks/useNetworksRelationship'
import { NativeCurrencyPrice } from './NativeCurrencyPrice'
import { isTokenUSDC } from '../../util/TokenUtils'

export type TransferPanelSummaryToken = { symbol: string; address: string }

export type TransferPanelSummaryProps = {
  amount: number
  token: ERC20BridgeToken | null
}

function TransferPanelSummaryContainer({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex flex-col text-white">
      <span className="mb-4 text-xl">Summary</span>

      <div className={twMerge('flex flex-col space-y-4', className)}>
        {children}
      </div>

      <div className="h-10" />
    </div>
  )
}

export function TransferPanelSummary({ token }: TransferPanelSummaryProps) {
  const {
    status: gasSummaryStatus,
    estimatedL1GasFees,
    estimatedL2GasFees
  } = useGasSummary()

  const [networks] = useNetworks()
  const {
    childChain,
    childChainProvider,
    parentChain,
    parentChainProvider,
    isDepositMode
  } = useNetworksRelationship(networks)

  const nativeCurrency = useNativeCurrency({ provider: childChainProvider })
  const parentChainNativeCurrency = useNativeCurrency({
    provider: parentChainProvider
  })

  const [{ amount }] = useArbQueryParams()

  const estimatedConfirmationDate = getTxConfirmationDate({
    createdAt: dayjs(new Date()),
    withdrawalFromChainId: childChain.id
  })

  const confirmationPeriod = estimatedConfirmationDate.fromNow(true)

  const sameNativeCurrency = useMemo(
    // we'll have to change this if we ever have L4s that are built on top of L3s with a custom fee token
    () => nativeCurrency.isCustom === parentChainNativeCurrency.isCustom,
    [nativeCurrency, parentChainNativeCurrency]
  )

  const estimatedTotalGasFees = useMemo(
    () => estimatedL1GasFees + estimatedL2GasFees,
    [estimatedL1GasFees, estimatedL2GasFees]
  )

  if (gasSummaryStatus === 'unavailable') {
    return (
      <TransferPanelSummaryContainer>
        <div className="flex flex-row justify-between text-sm lg:text-base">
          Gas estimates are not available for this action.
        </div>
      </TransferPanelSummaryContainer>
    )
  }

  return (
    <TransferPanelSummaryContainer>
      <div
        className={twMerge(
          'grid grid-cols-[260px_auto] items-center text-sm font-light'
        )}
      >
        <span className="text-left">You will pay in gas fees:</span>

        <span className="font-medium">
          {!sameNativeCurrency && isDepositMode && (
            <span className="tabular-nums">
              {formatAmount(estimatedL1GasFees, {
                symbol: parentChainNativeCurrency.symbol
              })}
              {' + '}
            </span>
          )}
          <span className="tabular-nums">
            {formatAmount(
              sameNativeCurrency ? estimatedTotalGasFees : estimatedL2GasFees
            )}
          </span>{' '}
          <span>{nativeCurrency.symbol}</span>{' '}
          <NativeCurrencyPrice amount={estimatedTotalGasFees} showBrackets />
        </span>
      </div>

      <div
        className={twMerge(
          'grid grid-cols-[260px_auto] items-center text-sm font-light'
        )}
      >
        <span>
          You will receive on{' '}
          {getNetworkName(isDepositMode ? childChain.id : parentChain.id)}:
        </span>
        <span className="font-medium">
          <span className="tabular-nums">{formatAmount(Number(amount))}</span>{' '}
          <TokenSymbolWithExplorerLink
            token={token}
            isParentChain={!isDepositMode}
          />{' '}
          {isTokenUSDC(token?.address) && isDepositMode && <>or USDC</>}
          <NativeCurrencyPrice amount={Number(amount)} showBrackets />
        </span>
      </div>

      {!isDepositMode && (
        <p className="flex flex-col gap-3 text-sm font-light">
          You will have to claim the withdrawal on {parentChain.name} in ~
          {confirmationPeriod}.
        </p>
      )}
    </TransferPanelSummaryContainer>
  )
}
