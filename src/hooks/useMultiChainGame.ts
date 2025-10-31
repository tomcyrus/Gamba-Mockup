import { useState, useMemo } from 'react'
import { useChain } from '../contexts/ChainContext'
import { ChainType } from '../types/chains'
import { EVMBetting } from '../betting/EVMBetting'
import { BettingInterface, GameHookResult } from '../betting/types'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGambaProgram } from 'gamba-react-v2'

export function useMultiChainGame(): GameHookResult {
  const { activeChain, isSolana, isEVM } = useChain()
  const solanaWallet = useWallet()
  const [wager, setWager] = useState(0.01)

  const game = useMemo<BettingInterface>(() => {
    if (isEVM) {
      return new EVMBetting(activeChain)
    }
    
    return createSolanaGameAdapter()
  }, [activeChain, isEVM])

  const maxWager = isEVM ? 10 : 100
  const minWager = isEVM ? 0.001 : 0.01

  return {
    game,
    wager,
    setWager,
    maxWager,
    minWager,
  }
}

function createSolanaGameAdapter(): BettingInterface {
  let gambaGame: any
  let pendingPlay: any = null

  return {
    state: 'idle',
    error: null,
    
    async play(options) {
      pendingPlay = options
    },
    
    async result() {
      if (!pendingPlay) {
        throw new Error('No result available')
      }
      
      const random = Math.floor(Math.random() * pendingPlay.bet.length)
      const multiplier = pendingPlay.bet[random]
      const payout = multiplier > 0 ? pendingPlay.wager * multiplier : 0
      
      const result = {
        resultIndex: random,
        payout,
        multiplier,
        wager: pendingPlay.wager,
      }
      
      pendingPlay = null
      return result
    },
  }
}
