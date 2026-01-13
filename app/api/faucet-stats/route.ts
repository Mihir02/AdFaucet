import { NextResponse } from 'next/server'
import { getFaucetInstance } from '@/lib/eth-faucet'

export async function GET() {
  try {
    const faucet = getFaucetInstance()
    const walletInfo = await faucet.getWalletInfo()

    if (!walletInfo) {
      return NextResponse.json(
        { 
          success: false,
          error: 'WALLET_INFO_ERROR',
          message: 'Failed to fetch wallet information' 
        },
        { status: 500 }
      )
    }

    const stats = {
      faucetAddress: walletInfo.address,
      balance: walletInfo.balance,
      network: walletInfo.network,
      chainId: walletInfo.chainId,
      ethAmount: process.env.ETH_AMOUNT || '0.0005',
      cooldownHours: parseInt(process.env.COOLDOWN_HOURS || '24'),
      isOperational: parseFloat(walletInfo.balance) > 0.001 // Minimum operational balance
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error('Faucet stats error:', error)
    
    // Handle configuration errors
    if (error.message.includes('FAUCET_PRIVATE_KEY') || error.message.includes('SEPOLIA_RPC_URL')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'CONFIGURATION_ERROR',
          message: 'Faucet configuration error' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to fetch faucet stats' 
      },
      { status: 500 }
    )
  }
}