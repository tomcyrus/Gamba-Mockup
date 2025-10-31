import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ChainType } from '../types/chains'
import { DEFAULT_CHAIN } from '../chain-config'

interface ChainContextType {
  activeChain: ChainType
  setActiveChain: (chain: ChainType) => void
  isEVM: boolean
  isSolana: boolean
}

const ChainContext = createContext<ChainContextType | undefined>(undefined)

const CHAIN_STORAGE_KEY = 'gamba_active_chain'

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [activeChain, setActiveChainState] = useState<ChainType>(() => {
    const stored = localStorage.getItem(CHAIN_STORAGE_KEY)
    if (stored && Object.values(ChainType).includes(stored as ChainType)) {
      return stored as ChainType
    }
    return DEFAULT_CHAIN
  })

  const setActiveChain = useCallback((chain: ChainType) => {
    setActiveChainState(chain)
    localStorage.setItem(CHAIN_STORAGE_KEY, chain)
  }, [])

  const isEVM = activeChain === ChainType.ETHEREUM || activeChain === ChainType.BNB
  const isSolana = activeChain === ChainType.SOLANA

  const value = {
    activeChain,
    setActiveChain,
    isEVM,
    isSolana,
  }

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>
}

export function useChain() {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useChain must be used within a ChainProvider')
  }
  return context
}

export function useActiveChainConfig() {
  const { activeChain } = useChain()
  const { getChainConfig } = require('../chain-config')
  return getChainConfig(activeChain)
}

export function useActiveChainTokens() {
  const { activeChain } = useChain()
  const { getChainTokens } = require('../chain-config')
  return getChainTokens(activeChain)
}
