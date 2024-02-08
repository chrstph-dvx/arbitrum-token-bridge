import React, { useEffect } from 'react'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import dynamic from 'next/dynamic'
import { addCustomNetwork } from '@arbitrum/sdk'

import { AppConnectionFallbackContainer } from '../components/App/AppConnectionFallbackContainer'
import { Loader } from '../components/common/atoms/Loader'
import {
  getCustomChainsFromLocalStorage,
  mapCustomChainToNetworkData
} from '../util/networks'
import { getOrbitChains } from '../util/orbitChainsList'
import { sanitizeQueryParams } from '../hooks/useNetworks'
import {
  decodeChainQueryParam,
  encodeChainQueryParam
} from '../hooks/useArbQueryParams'

const App = dynamic(() => import('../components/App/App'), {
  ssr: false,
  loading: () => (
    <AppConnectionFallbackContainer>
      <div className="fixed inset-0 m-auto h-[44px] w-[44px]">
        <Loader size="large" color="white" />
      </div>
    </AppConnectionFallbackContainer>
  )
})

function getDestinationWithSanitizedQueryParams(sanitized: {
  sourceChainId: number
  destinationChainId: number
}) {
  const sourceChain = encodeChainQueryParam(sanitized.sourceChainId)!
  const destinationChain = encodeChainQueryParam(sanitized.destinationChainId)!

  return `/?sourceChain=${sourceChain}&destinationChain=${destinationChain}`
}

function addOrbitChainsToArbitrumSDK() {
  ;[...getOrbitChains(), ...getCustomChainsFromLocalStorage()].forEach(
    chain => {
      try {
        addCustomNetwork({ customL2Network: chain })
        mapCustomChainToNetworkData(chain)
      } catch (_) {
        // already added
      }
    }
  )
}

export function getServerSideProps({
  query
}: GetServerSidePropsContext): GetServerSidePropsResult<Record<string, never>> {
  const sourceChainId = decodeChainQueryParam(query.sourceChain)
  const destinationChainId = decodeChainQueryParam(query.destinationChain)

  // If both sourceChain and destinationChain are not present, let the client sync with Metamask
  if (!sourceChainId && !destinationChainId) {
    return {
      props: {}
    }
  }

  addOrbitChainsToArbitrumSDK()

  // sanitize the query params
  const sanitized = sanitizeQueryParams({ sourceChainId, destinationChainId })

  // if the sanitized query params are different from the initial values, redirect to the url with sanitized query params
  if (
    sourceChainId !== sanitized.sourceChainId ||
    destinationChainId !== sanitized.destinationChainId
  ) {
    return {
      redirect: {
        permanent: false,
        destination: getDestinationWithSanitizedQueryParams(sanitized)
      }
    }
  }

  return {
    props: {}
  }
}

export default function Index() {
  useEffect(() => {
    addOrbitChainsToArbitrumSDK()
  }, [])

  return <App />
}
