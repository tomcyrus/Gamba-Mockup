# Gamba Betting Smart Contracts

Secure smart contracts for multi-chain casino-style betting platform supporting Ethereum and BNB Smart Chain.

## Contracts

### GambaBetting.sol
Main betting contract that handles:
- Secure bet placement and settlement
- Provably fair randomness using on-chain sources
- Multiple token support (native ETH/BNB and ERC20 tokens)
- Liquidity pool management
- Platform fees and house edge configuration
- Emergency pause functionality

### GambaToken.sol
ERC20 token contract for testing purposes. Simulates USDC and other tokens on testnets.

## Security Features

1. **ReentrancyGuard**: Prevents reentrancy attacks on bet settlement
2. **Pausable**: Emergency stop mechanism for contract owner
3. **SafeERC20**: Safe token transfers to prevent common vulnerabilities
4. **Access Control**: Owner-only functions for critical operations
5. **Input Validation**: Comprehensive checks on bet parameters
6. **Maximum Bet Limits**: Protects pool liquidity from excessive payouts

## Randomness

⚠️ **CRITICAL WARNING: NOT PRODUCTION-READY** ⚠️

The current implementation uses on-chain randomness sources that are **NOT provably fair**:
- `block.prevrandao` - Can be influenced by validators
- `block.timestamp` - Manipulable within certain bounds
- `blockhash(block.number - 1)` - Limited availability
- Client-provided seed - Only client-side randomness
- Bet ID - Deterministic

**This randomness can be gamed by miners/validators and is NOT suitable for production gambling.**

### For Production Deployment

You **MUST** integrate a verifiable randomness solution:

1. **Chainlink VRF** (Recommended):
   ```solidity
   import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
   ```
   - Cryptographically secure
   - Verifiable on-chain
   - Industry standard for gaming

2. **Commit-Reveal Scheme** (Minimum):
   - Two-phase betting process
   - Prevents result manipulation
   - Still vulnerable to some attacks

3. **Professional Audit**:
   - Always audit before mainnet deployment
   - Focus on randomness and fund security
   - Test extensively on testnets

**DO NOT USE THIS CONTRACT IN PRODUCTION WITHOUT PROPER RANDOMNESS INTEGRATION.**

## Installation

```bash
cd contracts
npm install
```

## Configuration

Create a `.env` file in the contracts directory:

```env
PRIVATE_KEY=your_private_key_here
PLATFORM_WALLET=your_platform_wallet_address
ETHEREUM_RPC_ENDPOINT=https://eth.llamarpc.com
BNB_RPC_ENDPOINT=https://bsc-dataseed1.binance.org
ETHERSCAN_API_KEY=your_etherscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm test
```

## Deployment

### Local Network (for testing)
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npm run deploy:localhost
```

### Ethereum Mainnet
```bash
npm run deploy:ethereum
```

### BNB Smart Chain
```bash
npm run deploy:bsc
```

## Contract Parameters

### Pool Settings
- **maxPayout**: Maximum payout per bet (prevents pool drainage)
- **minWager**: Minimum bet amount
- **houseEdge**: Fee taken by the house (in basis points, e.g., 200 = 2%)

### Platform Settings
- **platformFee**: Fee sent to platform wallet (default 1%)
- **FEE_DENOMINATOR**: 10000 (for basis point calculations)

## Integration

After deployment:

1. Update `src/contracts/addresses.ts` with deployed contract addresses
2. Set environment variables:
   ```
   VITE_ETHEREUM_BETTING_CONTRACT=0x...
   VITE_BSC_BETTING_CONTRACT=0x...
   ```
3. Restart the application

## Game Integration

The betting contract supports any game that can be represented as a bet array where:
- Each index represents a possible outcome
- Each value represents the multiplier for that outcome (in basis points)

Example for coin flip (2x payout):
```javascript
betArray = [20000, 0, 0, 20000] // Heads: 2x, Tails: 2x
```

Example for dice (100 sides, roll under 50):
```javascript
betArray = [2000, 2000, ..., 0, 0] // First 50 outcomes win 2x
```

## Security Considerations

1. **Always test thoroughly on testnets before mainnet deployment**
2. **Audit smart contracts before handling real funds**
3. **Monitor pool liquidity to ensure adequate reserves**
4. **Use multisig wallet for contract owner**
5. **Consider upgradeability patterns for future improvements**

## License

MIT
