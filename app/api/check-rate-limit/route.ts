import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, formatTimeRemaining } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const result = checkRateLimit(address)
    
    if (!result.allowed && result.nextAllowedTime) {
      return NextResponse.json({
        allowed: false,
        message: `Rate limit exceeded. Try again in ${formatTimeRemaining(result.nextAllowedTime)}`,
        nextAllowedTime: result.nextAllowedTime
      })
    }

    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error('Rate limit check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}