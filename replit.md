# Overview

Gamba is a multi-chain betting platform that enables users to play casino-style games (Dice, Slots, Flip, etc.) across multiple blockchains. The platform originally supported Solana with Phantom wallet integration and has been expanded to support Ethereum and BNB Smart Chain with MetaMask integration. Users can place bets, receive payouts, and interact with liquidity pools across different blockchain networks.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Vite as build tool and dev server
- React Router for navigation
- Styled Components for styling
- Web3 wallet integrations (Solana Wallet Adapter, Wagmi for EVM)

**Chain Abstraction Layer:**
The application implements a multi-chain architecture with a unified betting interface. A `ChainContext` provider manages the active blockchain selection, persisting user preferences to localStorage. The system distinguishes between Solana (using Gamba SDK) and EVM chains (Ethereum/BNB using custom implementation).

**Wallet Integration:**
- **Solana**: Uses `@solana/wallet-adapter-react` with support for Phantom and Solflare wallets
- **EVM Chains**: Uses Wagmi with RainbowKit for MetaMask, WalletConnect, and injected wallet support
- Chain-specific wallet connection flows managed through respective providers

**Game Architecture:**
Games are implemented as lazy-loaded React components using `React.lazy()`. Each game implements a standard betting interface with methods for placing bets and retrieving results. The `useMultiChainGame` hook provides chain-agnostic game logic by creating appropriate betting adapters (Solana or EVM) based on the active chain.

**State Management:**
- Zustand for client-side state (user preferences, toasts, game history)
- React Context for chain and wallet state
- SWR for data fetching and caching
- Firebase Realtime Database for user data persistence

## Backend Architecture

**Server Framework:**
Express.js server with middleware stack including:
- Body parsing (JSON, URL-encoded)
- Cookie parsing
- File upload handling (express-fileupload)
- CORS and security headers

**Database:**
MongoDB with Mongoose ODM. Schema design includes:
- User management (accounts, authentication, profiles)
- Order and payment tracking
- Product catalog with categories and brands
- Cart and wishlist functionality
- Notification system
- Address and geolocation data

**Authentication:**
JWT-based authentication with bcrypt password hashing. Supports both traditional email/password and social authentication (Google, Facebook). Refresh token pattern implemented with token storage in database.

**File Handling:**
- Cloudinary integration for image storage and CDN delivery
- Multer for multipart form data and file uploads
- Image compression using Jimp for optimized storage

## Smart Contract Architecture (EVM)

**Contracts:**
- `GambaBetting.sol`: Main betting contract handling bet placement, settlement, liquidity pools, and platform fees
- `GambaToken.sol`: ERC20 token for testing (simulates USDC on testnets)

**Security Patterns:**
- OpenZeppelin contracts for ReentrancyGuard, Pausable, and SafeERC20
- Owner-only access control for critical operations
- Input validation and bet limit enforcement
- Emergency pause mechanism

**Randomness Implementation:**
⚠️ **Current implementation uses insecure on-chain randomness** (block.prevrandao, timestamp, blockhash) suitable only for development/testing. Production deployment requires integration with Chainlink VRF or similar verifiable randomness solution.

**Multi-Token Support:**
Betting contract supports both native tokens (ETH/BNB) and ERC20 tokens with configurable house edge, min/max wagers per token.

## Blockchain Integration Strategy

**Solana Integration:**
Uses Gamba SDK (`gamba-react-v2`, `gamba-react-ui-v2`, `gamba-core-v2`) for:
- Connection to Solana blockchain via RPC endpoints
- Pool-based betting system with liquidity providers
- Transaction signing and confirmation
- Platform fee collection (1% creator fee, 0.1% jackpot fee)

**EVM Integration:**
Custom implementation using Viem for:
- Wallet client and public client management
- Smart contract interaction (read/write operations)
- Transaction simulation, signing, and broadcasting
- Event log decoding for bet settlement
- Multi-chain support (Ethereum mainnet, BNB Smart Chain)

**Chain Configuration:**
Centralized chain configuration in `chain-config.ts` defining RPC endpoints, native currencies, block explorers, and chain IDs for each supported network.

# External Dependencies

## Third-Party Services

**Blockchain RPCs:**
- Solana: Mainnet Beta RPC (default: `https://api.mainnet-beta.solana.com`)
- Ethereum: Alchemy or LlamaRPC (configurable via environment variables)
- BNB: Binance public RPC (`https://bsc-dataseed1.binance.org`)

**Wallet Providers:**
- WalletConnect Project ID required for EVM wallet connections
- Solana Wallet Adapter for Phantom/Solflare integration

**Firebase:**
- Firebase Realtime Database for user data persistence
- Configuration in `src/components/firebase.ts`
- Used for storing user preferences and session data

**Cloudinary:**
- Image upload and CDN hosting
- Requires API key, secret, and cloud name configuration

**SendGrid:**
- Email delivery service for notifications
- Template-based emails for orders and user actions

**Payment Gateway:**
- Paytm integration for fiat payments (Indian market)
- Requires merchant credentials and checksum validation

## NPM Packages

**Web3 & Blockchain:**
- `@solana/web3.js`, `@solana/spl-token`: Solana blockchain interaction
- `@solana/wallet-adapter-*`: Solana wallet integration
- `wagmi`, `viem`: EVM blockchain interaction
- `@rainbow-me/rainbowkit`: EVM wallet UI components
- `gamba-*`: Gamba protocol SDK for Solana betting

**Frontend:**
- `react`, `react-dom`: UI framework
- `react-router-dom`: Client-side routing
- `styled-components`: CSS-in-JS styling
- `@react-three/fiber`, `@react-three/drei`: 3D graphics
- `@preact/signals-react`: Reactive state management

**Backend:**
- `express`: Web server framework
- `mongoose`: MongoDB ODM
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `express-validator`: Request validation
- `axios`: HTTP client

**Development:**
- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React plugin for Vite
- `vite-plugin-node-polyfills`: Node.js polyfills for browser
- `hardhat`: EVM smart contract development and testing
- `@nomicfoundation/hardhat-toolbox`: Hardhat plugins

**Utilities:**
- `dotenv`: Environment variable management
- `concurrently`: Run multiple commands concurrently
- `matter-js`: Physics engine for game mechanics
- `html2canvas`: Screenshot generation