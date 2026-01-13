# Technology Stack

## Frontend Framework

- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

## Backend Integration

- **Ethers.js v6**: Ethereum library for wallet operations
- **Node Cache**: In-memory caching for rate limiting
- **Next.js API Routes**: Serverless backend functions

## Web3 Integration

- **Wagmi v2**: React hooks for wallet connections
- **Viem**: TypeScript interface for Ethereum
- **@tanstack/react-query**: Data fetching and caching

## Wallet Support

- **Injected Wallets**: MetaMask, Coinbase Wallet, and other browser extension wallets
- **Browser Integration**: Automatic detection of available wallets

## Development Environment

- **Platform**: Windows (win32) with cmd shell
- **Editor**: VSCode with Kiro extension
- **Package Manager**: npm

## Common Commands

### Development

```cmd
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
npm run test:watch

# Run linting
npm run lint
```

### Deployment

```cmd
# Deploy to Vercel (after connecting repo)
vercel --prod

# Or use Vercel CLI for first deployment
vercel
```

## Backend Architecture

- **ETH Transfers**: Direct wallet-to-wallet transfers using ethers.js
- **Rate Limiting**: IP and address-based cooldown periods
- **Ad Verification**: Server-side hash generation and validation
- **Error Handling**: Comprehensive error types and user-friendly messages

## Environment Variables

### Required

- `FAUCET_PRIVATE_KEY`: Private key of the Sepolia wallet for sending ETH
- `SEPOLIA_RPC_URL`: RPC endpoint for Sepolia network

### Optional

- `ETH_AMOUNT`: Amount of ETH to send per request (default: 0.0005)
- `COOLDOWN_HOURS`: Hours between requests (default: 24)
- `NEXT_PUBLIC_ETH_AMOUNT`: Frontend display amount
- `NEXT_PUBLIC_COOLDOWN_HOURS`: Frontend display cooldown
- `NEXT_PUBLIC_RPC_URL`: Frontend RPC endpoint

## Security Features

- **Private Key Security**: Environment variable storage only
- **Rate Limiting**: Multi-layer protection (IP + address)
- **Input Validation**: Comprehensive validation on all endpoints
- **Error Boundaries**: Graceful error handling throughout app
- **Transaction Verification**: Real-time transaction status tracking
