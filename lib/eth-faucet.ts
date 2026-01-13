import { ethers } from 'ethers'
import NodeCache from 'node-cache'

// Rate limiting cache - stores last request time per address/IP
const requestCache = new NodeCache({ stdTTL: 86400 }) // 24 hours

export interface FaucetConfig {
  privateKey: string
  rpcUrl: string
  ethAmount: string // Amount in ETH (e.g., "0.0005")
  cooldownHours: number
}

export interface RateLimitResult {
  allowed: boolean
  nextAllowedTime?: number
  message?: string
}

export interface TransactionResult {
  success: boolean
  txHash?: string
  error?: string
  message: string
}

export class EthFaucet {
  private wallet: ethers.Wallet
  private provider: ethers.JsonRpcProvider
  private config: FaucetConfig

  constructor(config: FaucetConfig) {
    this.config = config
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl)
    this.wallet = new ethers.Wallet(config.privateKey, this.provider)
  }

  /**
   * Check rate limiting for an address and IP combination
   */
  checkRateLimit(address: string, ip: string): RateLimitResult {
    const now = Date.now()
    const cooldownMs = this.config.cooldownHours * 60 * 60 * 1000

    // Check address-based rate limiting
    const addressKey = `addr_${address.toLowerCase()}`
    const addressLastRequest = requestCache.get<number>(addressKey)
    
    if (addressLastRequest && (now - addressLastRequest) < cooldownMs) {
      const nextAllowed = addressLastRequest + cooldownMs
      return {
        allowed: false,
        nextAllowedTime: nextAllowed,
        message: `Address rate limited. Try again in ${this.formatTimeRemaining(nextAllowed - now)}`
      }
    }

    // Check IP-based rate limiting (more restrictive)
    const ipKey = `ip_${ip}`
    const ipLastRequest = requestCache.get<number>(ipKey)
    
    if (ipLastRequest && (now - ipLastRequest) < cooldownMs) {
      const nextAllowed = ipLastRequest + cooldownMs
      return {
        allowed: false,
        nextAllowedTime: nextAllowed,
        message: `IP rate limited. Try again in ${this.formatTimeRemaining(nextAllowed - now)}`
      }
    }

    return { allowed: true }
  }

  /**
   * Record a successful request for rate limiting
   */
  recordRequest(address: string, ip: string): void {
    const now = Date.now()
    requestCache.set(`addr_${address.toLowerCase()}`, now)
    requestCache.set(`ip_${ip}`, now)
  }

  /**
   * Send ETH to the specified address
   */
  async sendEth(toAddress: string, ip: string): Promise<TransactionResult> {
    try {
      // Validate address
      if (!ethers.isAddress(toAddress)) {
        return {
          success: false,
          error: 'INVALID_ADDRESS',
          message: 'Invalid Ethereum address'
        }
      }

      // Check rate limiting
      const rateLimitResult = this.checkRateLimit(toAddress, ip)
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'RATE_LIMITED',
          message: rateLimitResult.message || 'Rate limited'
        }
      }

      // Check wallet balance
      const balance = await this.wallet.provider.getBalance(this.wallet.address)
      const sendAmount = ethers.parseEther(this.config.ethAmount)
      
      if (balance < sendAmount) {
        return {
          success: false,
          error: 'INSUFFICIENT_BALANCE',
          message: 'Faucet wallet has insufficient balance'
        }
      }

      // Estimate gas
      const gasEstimate = await this.wallet.estimateGas({
        to: toAddress,
        value: sendAmount
      })

      const gasPrice = await this.wallet.provider.getFeeData()
      const totalCost = sendAmount + (gasEstimate * (gasPrice.gasPrice || 0n))

      if (balance < totalCost) {
        return {
          success: false,
          error: 'INSUFFICIENT_BALANCE_FOR_GAS',
          message: 'Faucet wallet has insufficient balance for gas fees'
        }
      }

      // Send transaction
      const tx = await this.wallet.sendTransaction({
        to: toAddress,
        value: sendAmount,
        gasLimit: gasEstimate,
        gasPrice: gasPrice.gasPrice
      })

      // Wait for confirmation
      const receipt = await tx.wait()

      if (receipt?.status === 1) {
        // Record successful request for rate limiting
        this.recordRequest(toAddress, ip)

        return {
          success: true,
          txHash: tx.hash,
          message: `Successfully sent ${this.config.ethAmount} ETH to ${toAddress}`
        }
      } else {
        return {
          success: false,
          error: 'TRANSACTION_FAILED',
          message: 'Transaction failed during execution'
        }
      }

    } catch (error: any) {
      console.error('ETH transfer error:', error)
      
      // Handle specific error types
      if (error.code === 'INSUFFICIENT_FUNDS') {
        return {
          success: false,
          error: 'INSUFFICIENT_FUNDS',
          message: 'Faucet wallet has insufficient funds'
        }
      }

      if (error.code === 'NETWORK_ERROR') {
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Network connection error. Please try again.'
        }
      }

      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again later.'
      }
    }
  }

  /**
   * Get faucet wallet info
   */
  async getWalletInfo() {
    try {
      const balance = await this.wallet.provider.getBalance(this.wallet.address)
      const network = await this.wallet.provider.getNetwork()
      
      return {
        address: this.wallet.address,
        balance: ethers.formatEther(balance),
        network: network.name,
        chainId: network.chainId.toString()
      }
    } catch (error) {
      console.error('Error getting wallet info:', error)
      return null
    }
  }

  /**
   * Format time remaining in human-readable format
   */
  private formatTimeRemaining(ms: number): string {
    const hours = Math.floor(ms / (60 * 60 * 1000))
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
}

// Singleton instance
let faucetInstance: EthFaucet | null = null

export function getFaucetInstance(): EthFaucet {
  if (!faucetInstance) {
    const config: FaucetConfig = {
      privateKey: process.env.FAUCET_PRIVATE_KEY!,
      rpcUrl: process.env.SEPOLIA_RPC_URL!,
      ethAmount: process.env.ETH_AMOUNT || '0.0005',
      cooldownHours: parseInt(process.env.COOLDOWN_HOURS || '24')
    }

    // Validate required environment variables
    if (!config.privateKey) {
      throw new Error('FAUCET_PRIVATE_KEY environment variable is required')
    }
    if (!config.rpcUrl) {
      throw new Error('SEPOLIA_RPC_URL environment variable is required')
    }

    faucetInstance = new EthFaucet(config)
  }

  return faucetInstance
}