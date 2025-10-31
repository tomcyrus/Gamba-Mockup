export interface BettingResult {
  resultIndex: number
  payout: number
  multiplier: number
  wager: number
}

export interface PlayOptions {
  wager: number
  bet: number[]
  metadata?: string[]
}

export interface BettingInterface {
  play(options: PlayOptions): Promise<void>
  result(): Promise<BettingResult>
  state: 'idle' | 'simulating' | 'signing' | 'processing' | 'sending' | 'settling'
  error: Error | null
}

export interface GameHookResult {
  game: BettingInterface
  wager: number
  setWager: (wager: number) => void
  maxWager: number
  minWager: number
}
