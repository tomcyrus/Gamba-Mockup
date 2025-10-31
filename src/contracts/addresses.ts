export const CONTRACT_ADDRESSES = {
  ethereum: {
    GambaBetting: import.meta.env.VITE_ETHEREUM_BETTING_CONTRACT || '0x0000000000000000000000000000000000000000',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  bsc: {
    GambaBetting: import.meta.env.VITE_BSC_BETTING_CONTRACT || '0x0000000000000000000000000000000000000000',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
} as const;

export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;

export function getContractAddress(chain: SupportedChain, contract: string): string {
  return CONTRACT_ADDRESSES[chain][contract as keyof typeof CONTRACT_ADDRESSES[typeof chain]];
}
