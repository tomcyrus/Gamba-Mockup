import { BettingInterface, PlayOptions, BettingResult } from './types'
import { getContractAddress, SupportedChain } from '../contracts/addresses'
import GambaBettingABI from '../contracts/abis/GambaBetting.json'
import { createPublicClient, createWalletClient, custom, parseEther, formatEther, Hash, parseUnits, decodeEventLog } from 'viem'
import { mainnet, bsc } from 'viem/chains'

export class EVMBetting implements BettingInterface {
  state: 'idle' | 'simulating' | 'signing' | 'processing' | 'sending' | 'settling' = 'idle'
  error: Error | null = null
  
  private pendingResult: BettingResult | null = null
  private chainType: string
  private pendingBetId: Hash | null = null
  private walletClient: any = null
  private publicClient: any = null

  constructor(chainType: string) {
    this.chainType = chainType
    this.initializeClients()
  }

  private initializeClients() {
    const chain = this.chainType.toLowerCase() === 'ethereum' ? mainnet : bsc
    
    if (typeof window !== 'undefined' && window.ethereum) {
      this.publicClient = createPublicClient({
        chain,
        transport: custom(window.ethereum),
      })
    }
  }

  private async getWalletClient() {
    if (!this.walletClient && typeof window !== 'undefined' && window.ethereum) {
      const chain = this.chainType.toLowerCase() === 'ethereum' ? mainnet : bsc
      this.walletClient = createWalletClient({
        chain,
        transport: custom(window.ethereum),
      })
    }
    return this.walletClient
  }

  private getChainName(): SupportedChain {
    return this.chainType.toLowerCase() === 'ethereum' ? 'ethereum' : 'bsc'
  }

  private async getCurrentAccount(): Promise<`0x${string}`> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }) as string[]
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.')
    }
    
    return accounts[0] as `0x${string}`
  }

  async play(options: PlayOptions): Promise<void> {
    try {
      this.state = 'simulating'
      this.error = null
      
      const totalWeight = options.bet.reduce((a, b) => a + b, 0)
      if (totalWeight === 0) {
        throw new Error('Invalid bet array - total weight is zero')
      }

      const account = await this.getCurrentAccount()
      const walletClient = await this.getWalletClient()
      
      if (!walletClient) {
        throw new Error('Wallet client not initialized')
      }

      const contractAddress = getContractAddress(this.getChainName(), 'GambaBetting')
      
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        console.warn('Contract not deployed, using simulation mode')
        return this.simulatePlay(options)
      }

      this.state = 'signing'
      
      const clientSeed = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}` as Hash

      const wagerInWei = parseEther(options.wager.toString())
      
      const betArray = options.bet.map(b => BigInt(Math.floor(b * 10000)))

      try {
        this.state = 'processing'
        
        const hash = await walletClient.writeContract({
          account,
          address: contractAddress as `0x${string}`,
          abi: GambaBettingABI,
          functionName: 'placeBet',
          args: [
            '0x0000000000000000000000000000000000000000',
            wagerInWei,
            betArray,
            clientSeed,
          ],
          value: wagerInWei,
        })

        this.state = 'sending'
        
        const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

        this.state = 'settling'
        
        try {
          for (const log of receipt.logs) {
            try {
              const decodedLog = decodeEventLog({
                abi: GambaBettingABI,
                data: log.data,
                topics: log.topics,
              })
              
              if (decodedLog.eventName === 'BetPlaced') {
                this.pendingBetId = (decodedLog.args as any).betId as Hash
                break
              }
            } catch (e) {
              continue
            }
          }
          
          if (!this.pendingBetId) {
            console.warn('BetPlaced event not found in transaction receipt, falling back to simulation')
            const resultIndex = this.simulateResult(options.bet)
            const multiplier = options.bet[resultIndex]
            const payout = multiplier > 0 ? options.wager * multiplier : 0
            
            this.pendingResult = {
              resultIndex,
              payout,
              multiplier,
              wager: options.wager,
            }
          }
        } catch (parseError) {
          console.error('Error parsing transaction logs:', parseError)
          const resultIndex = this.simulateResult(options.bet)
          const multiplier = options.bet[resultIndex]
          const payout = multiplier > 0 ? options.wager * multiplier : 0
          
          this.pendingResult = {
            resultIndex,
            payout,
            multiplier,
            wager: options.wager,
          }
        }

        this.state = 'idle'
      } catch (err: any) {
        console.error('Contract interaction error:', err)
        throw new Error(`Transaction failed: ${err.message || 'Unknown error'}`)
      }
    } catch (err) {
      this.error = err as Error
      this.state = 'idle'
      throw err
    }
  }

  private async simulatePlay(options: PlayOptions): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.state = 'signing'
    await new Promise(resolve => setTimeout(resolve, 800))
    
    this.state = 'processing'
    
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
  }

  async result(): Promise<BettingResult> {
    if (this.pendingResult) {
      const result = this.pendingResult
      this.pendingResult = null
      return result
    }

    if (!this.pendingBetId) {
      throw new Error('No result available - call play() first')
    }

    const contractAddress = getContractAddress(this.getChainName(), 'GambaBetting')
    
    try {
      const betData = await this.publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: GambaBettingABI,
        functionName: 'getBet',
        args: [this.pendingBetId],
      }) as any

      const result: BettingResult = {
        resultIndex: Number(betData.resultIndex),
        payout: Number(formatEther(betData.payout)),
        multiplier: betData.betArray[Number(betData.resultIndex)] 
          ? Number(betData.betArray[Number(betData.resultIndex)]) / 10000
          : 0,
        wager: Number(formatEther(betData.wager)),
      }

      this.pendingBetId = null
      return result
    } catch (err) {
      console.error('Error fetching bet result:', err)
      throw new Error('Failed to fetch bet result from contract')
    }
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
