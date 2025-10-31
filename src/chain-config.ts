import { ChainType, ChainConfig, ChainTokens } from './types/chains'

export const CHAIN_CONFIGS: Record<ChainType, ChainConfig> = {
  [ChainType.SOLANA]: {
    id: 'solana-mainnet',
    name: 'Solana',
    type: ChainType.SOLANA,
    rpcEndpoint: import.meta.env.VITE_SOLANA_RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
     blockExplorer: 'https://solscan.io',
  },
  [ChainType.ETHEREUM]: {
    id: 'ethereum-mainnet',
    name: 'Ethereum',
    type: ChainType.ETHEREUM,
    rpcEndpoint: import.meta.env.VITE_ETHEREUM_RPC_ENDPOINT ?? `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || 'demo'}`,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://etherscan.io',
    chainId: 1,
  },
  [ChainType.BNB]: {
    id: 'bnb-mainnet',
    name: 'BNB Smart Chain',
    type: ChainType.BNB,
    rpcEndpoint: import.meta.env.VITE_BNB_RPC_ENDPOINT ?? 'https://bsc-dataseed1.binance.org',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorer: 'https://bscscan.com',
    chainId: 56,
  },
}


export const CHAIN_TOKENS: ChainTokens[] = [
  {
    chainType: ChainType.SOLANA,
    tokens: [
      {
        address: 'So11111111111111111111111111111111111111112',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        logo: '/tokens/sol.png',
        baseWager: 0.01,
        usdPrice: 0,
      },
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logo: '/tokens/usdc.png',
        baseWager: 1,
        usdPrice: 1,
      },
    ],
  },
  {
    chainType: ChainType.ETHEREUM,
    tokens: [
      {
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        logo: '/tokens/eth.png',
        baseWager: 0.001,
        usdPrice: 0,
      },
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logo: '/tokens/usdc.png',
        baseWager: 1,
        usdPrice: 1,
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        logo: '/tokens/usdt.png',
        baseWager: 1,
        usdPrice: 1,
      },
    ],
  },
  {
    chainType: ChainType.BNB,
    tokens: [
      {
        address: '0x0000000000000000000000000000000000000000',
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
        logo: '/tokens/bnb.png',
        baseWager: 0.01,
        usdPrice: 0,
      },
      {
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 18,
        logo: '/tokens/usdc.png',
        baseWager: 1,
        usdPrice: 1,
      },
      {
        address: '0x55d398326f99059fF775485246999027B3197955',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 18,
        logo: '/tokens/usdt.png',
        baseWager: 1,
        usdPrice: 1,
      },
    ],
  },
]

export const DEFAULT_CHAIN = ChainType.SOLANA

export function getChainConfig(chainType: ChainType): ChainConfig {
  return CHAIN_CONFIGS[chainType]
}

export function getChainTokens(chainType: ChainType): ChainTokens | undefined {
  return CHAIN_TOKENS.find(ct => ct.chainType === chainType)
}

export function getTokenByAddress(chainType: ChainType, address: string) {
  const chainTokens = getChainTokens(chainType)
  return chainTokens?.tokens.find(t => t.address.toLowerCase() === address.toLowerCase())
}
