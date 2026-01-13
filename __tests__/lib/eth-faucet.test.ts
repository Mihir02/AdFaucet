import { EthFaucet } from '@/lib/eth-faucet'

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getBalance: jest.fn().mockResolvedValue(BigInt('1000000000000000000')), // 1 ETH
      getFeeData: jest.fn().mockResolvedValue({
        gasPrice: BigInt('20000000000') // 20 gwei
      }),
      getNetwork: jest.fn().mockResolvedValue({
        name: 'sepolia',
        chainId: BigInt(11155111)
      })
    })),
    Wallet: jest.fn().mockImplementation(() => ({
      address: '0x1234567890123456789012345678901234567890',
      provider: {
        getBalance: jest.fn().mockResolvedValue(BigInt('1000000000000000000')),
        getFeeData: jest.fn().mockResolvedValue({
          gasPrice: BigInt('20000000000')
        }),
        getNetwork: jest.fn().mockResolvedValue({
          name: 'sepolia',
          chainId: BigInt(11155111)
        })
      },
      estimateGas: jest.fn().mockResolvedValue(BigInt('21000')),
      sendTransaction: jest.fn().mockResolvedValue({
        hash: '0xabcdef1234567890',
        wait: jest.fn().mockResolvedValue({ status: 1 })
      })
    })),
    parseEther: jest.fn().mockImplementation((value) => BigInt(parseFloat(value) * 1e18)),
    formatEther: jest.fn().mockImplementation((value) => (Number(value) / 1e18).toString()),
    isAddress: jest.fn().mockImplementation((address) => /^0x[a-fA-F0-9]{40}$/.test(address))
  }
}))

// Mock NodeCache
jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn()
  }))
})

describe('EthFaucet', () => {
  let faucet: EthFaucet

  beforeEach(() => {
    const config = {
      privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234',
      rpcUrl: 'https://sepolia.infura.io/v3/test',
      ethAmount: '0.0005',
      cooldownHours: 24
    }
    faucet = new EthFaucet(config)
  })

  describe('Rate Limiting', () => {
    it('should allow first request', () => {
      const result = faucet.checkRateLimit('0x1234567890123456789012345678901234567890', '127.0.0.1')
      expect(result.allowed).toBe(true)
    })

    it('should format time remaining correctly', () => {
      // Access private method through any
      const formatTime = (faucet as any).formatTimeRemaining
      expect(formatTime(3600000)).toBe('1h 0m') // 1 hour
      expect(formatTime(1800000)).toBe('30m') // 30 minutes
    })
  })

  describe('Wallet Info', () => {
    it('should return wallet information', async () => {
      const walletInfo = await faucet.getWalletInfo()
      
      expect(walletInfo).toEqual({
        address: '0x1234567890123456789012345678901234567890',
        balance: '1',
        network: 'sepolia',
        chainId: '11155111'
      })
    })
  })

  describe('Send ETH', () => {
    it('should validate address format', async () => {
      const result = await faucet.sendEth('invalid-address', '127.0.0.1')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_ADDRESS')
    })

    it('should send ETH successfully', async () => {
      const result = await faucet.sendEth('0x1234567890123456789012345678901234567890', '127.0.0.1')
      
      expect(result.success).toBe(true)
      expect(result.txHash).toBe('0xabcdef1234567890')
    })
  })
})