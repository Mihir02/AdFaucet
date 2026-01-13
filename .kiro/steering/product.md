# Product Overview

A Next.js web application that provides Sepolia ETH directly from a backend wallet through an interactive faucet system with ad verification.

## Purpose

- Provide free Sepolia ETH for Ethereum developers and testers
- Demonstrate secure backend wallet integration with frontend Web3 apps
- Implement multi-layer rate limiting and ad-based ETH distribution
- Serve as a production-ready ETH faucet with industry security standards

## Key Features

- **Direct ETH Transfers**: Backend wallet sends ETH directly to users
- **Secure Backend**: Private key management with environment variables
- **Ad Verification**: 10-second ad viewing with server-side verification
- **Multi-Layer Rate Limiting**: IP and address-based protection
- **Real-time Balance**: Live faucet wallet balance monitoring
- **Transaction Tracking**: Etherscan integration for transaction verification

## Architecture

- **Frontend**: Next.js with Wagmi for wallet connections
- **Backend**: API routes with ethers.js for ETH transfers
- **Security**: Rate limiting, input validation, error boundaries
- **Deployment**: Vercel serverless with secure environment variables

## Target Users

- Ethereum developers needing Sepolia ETH for testing
- DApp developers requiring testnet funds
- Students learning blockchain development
- Projects needing reliable testnet ETH distribution
