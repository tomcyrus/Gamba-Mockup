export enum ChainType {
  SOLANA = 'solana',
  ETHEREUM = 'ethereum',
  BNB = 'bnb',
}

export interface ChainConfig {
  id: string
  name: string
  type: ChainType
  rpcEndpoint: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorer: string
  chainId?: number
  testnet?: boolean
}

export interface TokenConfig {
  address: string
  name: string
  symbol: string
  decimals: number
  logo?: string
  baseWager?: number
  usdPrice?: number
}

export interface ChainTokens {
  chainType: ChainType
  tokens: TokenConfig[]
}

export interface WalletConfig {
  chainType: ChainType
  supportedWallets: string[]
}
