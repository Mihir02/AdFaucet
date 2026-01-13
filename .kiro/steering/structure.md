# Project Structure

## Complete Organization

```
crypto-faucet/
├── contracts/                  # Solidity smart contracts
│   ├── TestToken.sol          # ERC-20 test token
│   └── TokenFaucet.sol        # Main faucet contract
├── scripts/                   # Deployment scripts
│   ├── deploy.js             # Contract deployment
│   └── verify.js             # Etherscan verification
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── verify-ad/        # Ad verification endpoint
│   │   └── faucet-stats/     # Faucet statistics
│   ├── page.tsx              # Main page
│   ├── layout.tsx            # Root layout
│   ├── providers.tsx         # Context providers
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── WalletConnect.tsx     # Wallet connection
│   ├── AdDisplay.tsx         # Advertisement viewer
│   ├── TokenClaimButton.tsx  # Token claiming
│   └── ErrorBoundary.tsx     # Error handling
├── context/                  # React contexts
│   └── FaucetContext.tsx     # Faucet state management
├── lib/                      # Utilities
│   ├── contracts.ts          # Contract ABIs
│   ├── wagmi.ts             # Wagmi configuration
│   └── rate-limit.ts        # Rate limiting logic
├── __tests__/               # Frontend tests
│   └── components/          # Component tests
├── test/                    # Contract tests
├── deployments/             # Deployment artifacts
├── .kiro/                   # Kiro AI configuration
│   └── steering/            # AI guidance documents
└── .vscode/                 # VSCode settings
```

## Folder Conventions

### Smart Contracts (`contracts/`)

- **Solidity files**: One contract per file
- **OpenZeppelin imports**: Use established security patterns
- **Clear naming**: Contract names match file names
- **Documentation**: NatSpec comments for all public functions

### Scripts (`scripts/`)

- **Deployment scripts**: Hardhat deployment automation
- **Verification scripts**: Etherscan contract verification
- **Utility scripts**: Helper functions for contract interaction

### Frontend (`app/`, `components/`, `context/`)

- **App Router**: Next.js 14 app directory structure
- **Component organization**: One component per file
- **Context providers**: Centralized state management
- **API routes**: Server-side functionality

### Testing (`__tests__/`, `test/`)

- **Frontend tests**: Jest with React Testing Library
- **Contract tests**: Hardhat with Chai assertions
- **Separation**: Frontend and contract tests in different directories

## File Naming Conventions

### Smart Contracts

- **PascalCase**: `TokenFaucet.sol`, `TestToken.sol`
- **Descriptive names**: Indicate contract purpose
- **Version consistency**: Match Solidity version across contracts

### React Components

- **PascalCase**: `WalletConnect.tsx`, `AdDisplay.tsx`
- **Descriptive names**: Indicate component function
- **TypeScript**: Use `.tsx` for JSX components, `.ts` for utilities

### API Routes

- **kebab-case**: `verify-ad/`, `faucet-stats/`
- **RESTful naming**: Follow REST conventions
- **Route files**: Always `route.ts` for App Router

### Test Files

- **Matching names**: `WalletConnect.test.tsx` for `WalletConnect.tsx`
- **Descriptive suites**: Group related tests logically
- **Clear assertions**: Self-documenting test descriptions

## Architecture Patterns

### Smart Contract Layer

- **Separation of concerns**: Token and faucet as separate contracts
- **Security first**: OpenZeppelin patterns and best practices
- **Upgradability**: Consider proxy patterns for future versions
- **Event logging**: Comprehensive event emission for monitoring

### Frontend Layer

- **Context pattern**: Centralized state with React Context
- **Hook composition**: Custom hooks for contract interactions
- **Error boundaries**: Graceful error handling at component level
- **Accessibility**: ARIA labels and semantic HTML throughout

### API Layer

- **Validation**: Input validation on all endpoints
- **Error handling**: Consistent error response format
- **Rate limiting**: Server-side protection mechanisms
- **Logging**: Comprehensive request/response logging

## Best Practices

### Code Organization

- **Single responsibility**: Each file has one clear purpose
- **Dependency injection**: Pass dependencies rather than importing
- **Type safety**: Comprehensive TypeScript coverage
- **Documentation**: README files at appropriate levels

### Security Considerations

- **Input validation**: All user inputs validated
- **Rate limiting**: Multiple layers of protection
- **Error handling**: No sensitive information in error messages
- **Access control**: Proper permission checks throughout

### Performance Optimization

- **Code splitting**: Dynamic imports for large components
- **Memoization**: React.memo and useMemo where appropriate
- **Bundle optimization**: Tree shaking and dead code elimination
- **Caching**: React Query for efficient data fetching
