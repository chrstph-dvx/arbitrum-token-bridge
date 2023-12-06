import { PropsWithChildren, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import { AutoSizer, Column, Table } from 'react-virtualized'
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline'

import { MergedTransaction } from '../../state/app/state'
import {
  getStandardizedDate,
  getStandardizedTime,
  isCustomDestinationAddressTx
} from '../../state/app/utils'
import { TransactionsTableClaimableRow } from './TransactionsTableClaimableRow'
import { TransactionsTableDepositRow } from './TransactionsTableDepositRow'
import { useTokensFromLists } from '../TransferPanel/TokenSearchUtils'
import { SafeImage } from '../common/SafeImage'
import { Loader } from '../common/atoms/Loader'
import { ExternalLink } from '../common/ExternalLink'
import { GET_HELP_LINK } from '../../constants'

export const TransactionDateTime = ({
  standardizedDate
}: {
  standardizedDate: number | null
}) => {
  // Standardized formatted date-time component used across transaction rows

  if (!standardizedDate) return <span className="whitespace-nowrap">n/a</span>
  return (
    <div className="flex flex-nowrap gap-1">
      <span className="whitespace-nowrap">
        {getStandardizedDate(standardizedDate)}
      </span>
      <span className="whitespace-nowrap opacity-60">
        {getStandardizedTime(standardizedDate)}
      </span>
    </div>
  )
}

export const TokenIcon = ({ tx }: { tx: MergedTransaction }) => {
  const tokensFromLists = useTokensFromLists({
    parentChainId: tx.parentChainId,
    chainId: tx.childChainId
  })

  if (!tx.tokenAddress) {
    const ethIconUrl =
      'https://raw.githubusercontent.com/ethereum/ethereum-org-website/957567c341f3ad91305c60f7d0b71dcaebfff839/src/assets/assets/eth-diamond-black-gray.png'

    return (
      /* SafeImage throws an error if eth logo is loaded from an external domain */
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={ethIconUrl} alt="Ether logo" className="h-5 w-5 rounded-full" />
    )
  }

  return (
    <SafeImage
      src={tokensFromLists[tx.tokenAddress]?.logoURI}
      alt="Token logo"
      className="h-5 w-5 rounded-full"
    />
  )
}

const TableHeader = ({
  children,
  className
}: PropsWithChildren<{ className?: string }>) => (
  <th
    className={twMerge(
      'h-full w-full py-4 pl-2 text-left text-sm font-normal',
      className
    )}
  >
    {children}
  </th>
)

export const TransactionHistoryTable = ({
  transactions,
  className,
  loading,
  completed,
  error,
  numberOfDays,
  resume,
  rowHeight,
  rowHeightCustomDestinationAddress
}: {
  transactions: MergedTransaction[]
  className?: string
  loading: boolean
  completed: boolean
  error: unknown
  numberOfDays: number
  resume: () => void
  rowHeight: number
  rowHeightCustomDestinationAddress: number
}) => {
  const isTxHistoryEmpty = transactions.length === 0

  const paused = !loading && !completed

  const getRowHeight = useCallback(
    (index: number) => {
      const tx = transactions[index]

      if (!tx) {
        return 0
      }

      return isCustomDestinationAddressTx(tx)
        ? rowHeightCustomDestinationAddress
        : rowHeight
    },
    [transactions, rowHeight, rowHeightCustomDestinationAddress]
  )

  const numberOfDaysString = `${numberOfDays}${
    numberOfDays === 1 ? ' day' : ' days'
  }`

  if (isTxHistoryEmpty) {
    if (error) {
      return (
        <div className="flex space-x-2 bg-white p-4 text-sm text-error">
          <span>
            We seem to be having a difficult time loading your data. Please give
            it a moment and then try refreshing the page. If the problem
            persists please file a ticket{' '}
            <ExternalLink
              className="arb-hover text-blue-link underline"
              href={GET_HELP_LINK}
            >
              here
            </ExternalLink>
            .
          </span>
        </div>
      )
    }
    if (loading) {
      return (
        <div className="flex space-x-2 bg-white p-4">
          <Loader wrapperClass="animate-pulse" color="black" size="small" />
          <span className="animate-pulse text-sm">Loading transactions...</span>
        </div>
      )
    }
    if (paused) {
      return (
        <div>
          <div className="flex justify-between bg-white p-4">
            <span className="text-sm">
              Looks like there are no transactions in the last{' '}
              {numberOfDaysString}.
            </span>
          </div>
          <button onClick={resume} className="arb-hover text-sm">
            <div className="flex space-x-1 rounded border border-black px-2 py-1">
              <span>Load more</span>
              <ArrowDownOnSquareIcon width={16} />
            </div>
          </button>
        </div>
      )
    }
    return (
      <div className="bg-white p-4 text-sm">
        Looks like no transactions here yet!
      </div>
    )
  }

  return (
    <div className={twMerge('relative h-full flex-col rounded-lg', className)}>
      <div className="bg-white px-8 pt-4">
        {loading ? (
          <div className="flex animate-pulse space-x-2">
            <Loader size="small" />
            <span className="text-sm">Loading transactions...</span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-sm">
              Showing transactions for the last {numberOfDaysString}.
            </span>

            <button onClick={resume} className="arb-hover text-sm">
              <div className="flex space-x-1 rounded border border-black px-2 py-1">
                <span>Load more</span>
                <ArrowDownOnSquareIcon width={16} />
              </div>
            </button>
          </div>
        )}
      </div>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            width={width}
            height={height - 82}
            rowHeight={({ index }) => getRowHeight(index)}
            rowCount={transactions.length}
            headerHeight={52}
            headerRowRenderer={props => (
              <div className="flex bg-white" style={{ width: width }}>
                {props.columns}
              </div>
            )}
            className="table-auto"
            rowGetter={({ index }) => transactions[index]}
            rowRenderer={({ index, key, style }) => {
              const tx = transactions[index]
              const isEvenRow = index % 2 === 0

              if (!tx) {
                return null
              }

              return (
                <div
                  key={key}
                  style={{ ...style, height: `${getRowHeight(index)}px` }}
                >
                  {tx.isWithdrawal || tx.isCctp ? (
                    <TransactionsTableClaimableRow
                      tx={tx}
                      className={isEvenRow ? 'bg-cyan' : 'bg-white'}
                    />
                  ) : (
                    <TransactionsTableDepositRow
                      tx={tx}
                      className={isEvenRow ? 'bg-cyan' : 'bg-white'}
                    />
                  )}
                </div>
              )
            }}
          >
            {/* TODO: FIX LAYOUT FOR HEADERS AND COLUMNS: WIDTH AND PADDING */}
            <Column
              label="Status"
              dataKey="status"
              width={width / 6}
              headerRenderer={() => (
                <TableHeader className="pl-8">Status</TableHeader>
              )}
            />
            <Column
              label="Date"
              dataKey="date"
              width={width / 5}
              headerRenderer={() => (
                <TableHeader className="pl-6">Date</TableHeader>
              )}
            />
            <Column
              label="Token"
              dataKey="token"
              width={width / 6}
              headerRenderer={() => (
                <TableHeader className="pl-12">Token</TableHeader>
              )}
            />
            <Column
              label="Networks"
              dataKey="networks"
              width={width / 6}
              headerRenderer={() => (
                <TableHeader className="pl-6">Networks</TableHeader>
              )}
            />
          </Table>
        )}
      </AutoSizer>
    </div>
  )
}
