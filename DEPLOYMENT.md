# Gamba Multi-Chain Deployment Guide

This guide walks you through deploying the Gamba betting platform with full Ethereum and BNB Smart Chain support.

## Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- ETH/BNB for gas fees (testnets recommended for initial deployment)
- WalletConnect Project ID (get one at https://cloud.walletconnect.com/)

## Part 1: Smart Contract Deployment

### Step 1: Install Contract Dependencies

```bash
cd contracts
npm install
```

### Step 2: Configure Environment

Create `contracts/.env`:

```env
PRIVATE_KEY=your_deployer_private_key
PLATFORM_WALLET=your_platform_wallet_address
ETHEREUM_RPC_ENDPOINT=https://eth.llamarpc.com
BNB_RPC_ENDPOINT=https://bsc-dataseed1.binance.org
```

**Security Note**: Never commit your private key. Use a dedicated deployment wallet with minimal funds.

### Step 3: Test Locally (Recommended)

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to local network
npm run deploy:localhost
```

This creates a local blockchain at `http://127.0.0.1:8545` for testing.

### Step 4: Deploy to Testnets

**Ethereum Sepolia**:
```bash
# Update hardhat.config.js to add Sepolia network
npm run deploy:ethereum
```

**BNB Testnet**:
```bash
npm run deploy:bsc
```

### Step 5: Deploy to Mainnets

⚠️ **WARNING**: Only deploy to mainnet after thorough testing!

```bash
# Ethereum Mainnet
npm run deploy:ethereum

# BNB Smart Chain
npm run deploy:bsc
```

### Step 6: Save Deployment Addresses

After each deployment, save the contract addresses from the output:

```
GambaBetting deployed to: 0x...
Test USDC deployed to: 0x...
```

You'll need these for the frontend configuration.

## Part 2: Frontend Configuration

### Step 1: Configure Environment Variables

Create `.env` in the project root:

```env
# Solana (existing)
VITE_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Ethereum
VITE_ETHEREUM_RPC_ENDPOINT=https://eth.llamarpc.com
VITE_ETHEREUM_BETTING_CONTRACT=0xYourDeployedContractAddress

# BNB Smart Chain
VITE_BNB_RPC_ENDPOINT=https://bsc-dataseed1.binance.org
VITE_BSC_BETTING_CONTRACT=0xYourDeployedContractAddress

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Platform
VITE_PLATFORM_WALLET=your_platform_wallet_address
```

### Step 2: Update Contract Addresses

Edit `src/contracts/addresses.ts` with your deployed contract addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  ethereum: {
    GambaBetting: '0xYourEthereumContractAddress',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  },
  bsc: {
    GambaBetting: '0xYourBSCContractAddress',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // BSC USDC
  },
};
```

### Step 3: Install Frontend Dependencies

```bash
npm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Part 3: Testing Multi-Chain Functionality

### Test Wallet Connections

1. **Solana** (existing):
   - Click "Connect" and select Phantom/Solflare
   - Switch to Solana network

2. **Ethereum**:
   - Click "Connect" and select MetaMask
   - Switch to Ethereum network
   - Ensure MetaMask is on Ethereum Mainnet (or your test network)

3. **BNB Smart Chain**:
   - Click "Connect" and select MetaMask
   - Switch to BNB network
   - Add BNB Smart Chain to MetaMask if not present

### Test Betting Flow

1. Select a game (e.g., Dice, Flip, Roulette)
2. Choose your wager amount
3. Place a bet
4. Confirm the transaction in your wallet
5. Wait for transaction confirmation
6. View the result

### Verify Transactions

- **Ethereum**: https://etherscan.io/tx/YOUR_TX_HASH
- **BNB**: https://bscscan.com/tx/YOUR_TX_HASH

## Part 4: Adding Liquidity to Pools

After deployment, you need to add liquidity for users to bet against:

```javascript
// Using Hardhat console
npx hardhat console --network ethereum

const GambaBetting = await ethers.getContractFactory("GambaBetting");
const contract = await GambaBetting.attach("YOUR_CONTRACT_ADDRESS");

// Add 10 ETH liquidity
await contract.addLiquidity(
  "0x0000000000000000000000000000000000000000", // ETH
  ethers.parseEther("10"),
  { value: ethers.parseEther("10") }
);
```

## Part 5: Production Deployment

### Security Checklist

- [ ] Smart contracts audited by professional auditors
- [ ] Private keys stored securely (hardware wallet, HSM)
- [ ] Platform wallet is a multisig wallet
- [ ] RPC endpoints are reliable (Alchemy, Infura, QuickNode)
- [ ] Rate limiting implemented
- [ ] Monitoring and alerts configured
- [ ] Emergency pause mechanism tested
- [ ] Maximum payout limits properly configured
- [ ] House edge calculated and tested

### Publish to Replit

1. Click "Publish" button in Replit
2. Choose deployment type (Autoscale recommended)
3. Set environment variables in Replit Secrets
4. Deploy!

### Custom Domain (Optional)

1. Purchase a domain
2. Configure DNS to point to your Replit deployment
3. Enable HTTPS (automatic with Replit)

## Monitoring & Maintenance

### Track Pool Liquidity

```bash
# Check pool status
npx hardhat run scripts/check-pools.js --network ethereum
```

### Monitor Transactions

Set up event listeners for:
- `BetPlaced` events
- `BetSettled` events
- Pool liquidity changes

### Emergency Procedures

If you need to pause the contract:

```javascript
await contract.pause(); // Stop all betting
await contract.removeLiquidity(token, amount); // Withdraw funds
await contract.unpause(); // Resume when ready
```

## Troubleshooting

### "Insufficient pool liquidity"
- Add more liquidity to the pool
- Reduce maximum payout limits

### "Transaction failed: user rejected"
- User cancelled the transaction in MetaMask
- No action needed

### "Wrong network"
- Ensure MetaMask is on the correct network
- Use the network switcher in the app

### "Contract not deployed"
- App falls back to simulation mode
- Deploy contracts or use testnet

## Support

For issues:
1. Check browser console for errors
2. Verify wallet connections
3. Confirm correct network selection
4. Check transaction status on block explorer

## Next Steps

- [ ] Deploy to testnets and test thoroughly
- [ ] Get smart contracts audited
- [ ] Set up monitoring and analytics
- [ ] Configure proper liquidity pools
- [ ] Launch marketing campaign
- [ ] Monitor performance and user feedback

---

**Remember**: Always test on testnets before mainnet deployment!
