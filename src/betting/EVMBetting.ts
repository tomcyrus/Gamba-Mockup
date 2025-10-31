import { BettingInterface, PlayOptions, BettingResult } from './types'

export class EVMBetting implements BettingInterface {
  state: 'idle' | 'simulating' | 'signing' | 'processing' | 'sending' | 'settling' = 'idle'
  error: Error | null = null
  
  private pendingResult: BettingResult | null = null
  private chainType: string

  constructor(chainType: string) {
    this.chainType = chainType
  }

  async play(options: PlayOptions): Promise<void> {
    try {
      this.state = 'simulating'
      this.error = null
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.state = 'signing'
      await new Promise(resolve => setTimeout(resolve, 800))
      
      this.state = 'processing'
      
      const totalWeight = options.bet.reduce((a, b) => a + b, 0)
      if (totalWeight === 0) {
        throw new Error('Invalid bet array - total weight is zero')
      }
      
      const resultIndex = this.simulateResult(options.bet)
      const multiplier = options.bet[resultIndex]
      const payout = multiplier > 0 ? options.wager * multiplier : 0
      
      this.pendingResult = {
        resultIndex,
        payout,
        multiplier,
        wager: options.wager,
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.state = 'settling'
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.state = 'idle'
    } catch (err) {
      this.error = err as Error
      this.state = 'idle'
      throw err
    }
  }

  async result(): Promise<BettingResult> {
    if (!this.pendingResult) {
      throw new Error('No result available - call play() first')
    }
    const result = this.pendingResult
    this.pendingResult = null
    return result
  }

  private simulateResult(bet: number[]): number {
    const totalWeight = bet.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < bet.length; i++) {
      random -= bet[i]
      if (random <= 0) {
        return i
      }
    }
    
    return bet.length - 1
  }
}
