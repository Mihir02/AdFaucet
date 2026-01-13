# Sepolia ETH Faucet

A production-ready Next.js application that provides Sepolia ETH directly from a backend wallet. Features secure private key management, ad-based verification, multi-layer rate limiting, and comprehensive error handling.

## 🚀 Features

- 💰 **Direct ETH Transfers**: Backend wallet sends 0.0005 ETH directly to users
- 🔐 **Secure Backend**: Private key stored in environment variables only
- 📺 **Ad Verification**: 10-second interactive ad viewing with server validation
- 🛡️ **Multi-Layer Rate Limiting**: IP and wallet address protection (24h cooldown)
- 📊 **Real-time Monitoring**: Live faucet balance and transaction tracking
- ♿ **Accessibility**: Full ARIA compliance and keyboard navigation
- 🧪 **Comprehensive Testing**: Jest unit tests and API endpoint testing
- 🚀 **Production Ready**: Vercel deployment with error boundaries

## 🏗 Architecture

### Frontend

- **Next.js 14** with App Router and TypeScript
- **Wagmi v2** for wallet connections (MetaMask, Coinbase Wallet, etc.)
- **React Query** for state management and caching
- **Tailwind CSS** for responsive styling

### Backend

- **Next.js API Routes** for serverless functions
- **Ethers.js v6** for Ethereum wallet operations
- **Node Cache** for in-memory rate limiting
- **Secure environment** variable management

## 📦 Quick Start

### 1. Installation

```bash
git clone <repository-url>
cd crypto-faucet
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# REQUIRED: Your Sepolia wallet private key (keep this secure!)
FAUCET_PRIVATE_KEY=your_sepolia_wallet_private_key_here

# REQUIRED: Sepolia RPC endpoint
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# OPTIONAL: Customize faucet settings
ETH_AMOUNT=0.0005
COOLDOWN_HOURS=24

# REQUIRED: Supabase Configuration (for database storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# REQUIRED: PropellerAds Configuration (for ad integration)
NEXT_PUBLIC_PROPELLER_ZONE_ID=your_propeller_zone_id_here
NEXT_PUBLIC_PROPELLER_PUBLISHER_ID=your_propeller_publisher_id_here

```

### 3. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the faucet in action!

### 4. Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
```

## 🔧 Configuration

### Environment Variables

| Variable                 | Required | Default | Description                        |
| ------------------------ | -------- | ------- | ---------------------------------- |
| `FAUCET_PRIVATE_KEY`     | ✅       | -       | Private key of your Sepolia wallet |
| `SEPOLIA_RPC_URL`        | ✅       | -       | RPC endpoint for Sepolia network   |
| `ETH_AMOUNT`             | ❌       | 0.0005  | ETH amount per request             |
| `COOLDOWN_HOURS`         | ❌       | 24      | Hours between requests             |
| `NEXT_PUBLIC_ETH_AMOUNT` | ❌       | 0.0005  | Frontend display amount            |
| `NEXT_PUBLIC_RPC_URL`    | ❌       | -       | Frontend RPC endpoint              |

### Wallet Setup

1. **Create a Sepolia wallet** (or use existing one)
2. **Fund it with Sepolia ETH** from other faucets
3. **Export the private key** and add to environment variables
4. **Never commit private keys** to version control

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `FAUCET_PRIVATE_KEY`
   - `SEPOLIA_RPC_URL`
   - `ETH_AMOUNT` (optional)
   - `COOLDOWN_HOURS` (optional)
3. **Deploy** - automatic builds on push

### Manual Deployment

```bash
npm run build
npm start
```

## 🔒 Security Features

### Multi-Layer Rate Limiting

- **IP-based**: 24-hour cooldown per IP address
- **Address-based**: 24-hour cooldown per wallet address
- **Server-side validation**: All checks performed on backend

### Private Key Security

- **Environment variables only**: Never hardcoded in source
- **Server-side operations**: Private key never exposed to frontend
- **Secure transaction signing**: All operations server-side

### Input Validation

- **Address validation**: Ethereum address format checking
- **Timestamp validation**: Prevents replay attacks
- **Ad verification**: Server-side hash validation

## 📊 API Endpoints

### POST `/api/verify-ad`

Verify ad completion and generate verification hash.

**Request:**

```json
{
  "address": "0x...",
  "duration": 10,
  "timestamp": 1234567890
}
```

**Response:**

```json
{
  "success": true,
  "hash": "abc123...",
  "message": "Ad verification successful"
}
```

### POST `/api/drip`

Request ETH after ad verification.

**Request:**

```json
{
  "address": "0x...",
  "adHash": "abc123...",
  "adDuration": 10,
  "adTimestamp": 1234567890
}
```

**Response:**

```json
{
  "success": true,
  "txHash": "0x...",
  "message": "Successfully sent 0.0005 ETH"
}
```

### GET `/api/faucet-stats`

Get faucet wallet information and status.

**Response:**

```json
{
  "success": true,
  "stats": {
    "faucetAddress": "0x...",
    "balance": "1.234",
    "network": "sepolia",
    "ethAmount": "0.0005",
    "isOperational": true
  }
}
```

## 🧪 Testing

### Frontend Tests

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
```

### Test Coverage

- **Component testing**: React Testing Library
- **API testing**: Mock implementations
- **Utility testing**: Pure function testing
- **Error handling**: Edge case coverage

## 🎯 User Flow

1. **Connect Wallet**: User connects MetaMask or other Web3 wallet
2. **Watch Ad**: Interactive 10-second advertisement viewing
3. **Verify Ad**: Server-side verification generates unique hash
4. **Request ETH**: Backend wallet sends ETH directly to user
5. **Transaction Tracking**: Real-time status and Etherscan links

## 🔧 Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── drip/         # ETH transfer endpoint
│   │   ├── verify-ad/    # Ad verification endpoint
│   │   └── faucet-stats/ # Faucet status endpoint
│   ├── page.tsx          # Main page
│   └── layout.tsx        # Root layout
├── components/            # React components
├── context/              # React context providers
├── lib/                  # Utilities and configurations
├── __tests__/            # Test files
└── .kiro/                # AI assistant configuration
```

### Key Components

- **`EthFaucet`**: Core backend class for ETH operations
- **`FaucetContext`**: React context for state management
- **`AdDisplay`**: Interactive ad viewing component
- **`EthClaimButton`**: ETH claiming interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Ensure all tests pass: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- **Write tests** for new features
- **Follow TypeScript** best practices
- **Ensure accessibility** compliance
- **Update documentation** as needed
- **Test thoroughly** before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues) for bug reports
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions) for questions
- **Security**: Email security@yourproject.com for security issues

## ⚠️ Important Notes

- **Testnet Only**: This faucet is for Sepolia testnet ETH only
- **Rate Limited**: 1 request per 24 hours per address/IP
- **Development Use**: Intended for development and testing purposes
- **Private Key Security**: Never share or commit private keys
- **Monitor Balance**: Keep faucet wallet funded for continuous operation

## 🔗 Links

- **Live Demo**: [Your deployed URL]
- **Sepolia Etherscan**: [Faucet wallet address]
- **Documentation**: Additional guides and tutorials
