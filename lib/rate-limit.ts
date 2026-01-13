interface RateLimitEntry {
  lastRequest: number
  count: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 hours
const MAX_REQUESTS_PER_DAY = 1

export function checkRateLimit(address: string): { allowed: boolean; nextAllowedTime?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(address)

  if (!entry) {
    rateLimitMap.set(address, { lastRequest: now, count: 1 })
    return { allowed: true }
  }

  const timeSinceLastRequest = now - entry.lastRequest

  if (timeSinceLastRequest >= RATE_LIMIT_WINDOW) {
    // Reset the counter
    rateLimitMap.set(address, { lastRequest: now, count: 1 })
    return { allowed: true }
  }

  if (entry.count >= MAX_REQUESTS_PER_DAY) {
    const nextAllowedTime = entry.lastRequest + RATE_LIMIT_WINDOW
    return { allowed: false, nextAllowedTime }
  }

  // Increment counter
  entry.count += 1
  entry.lastRequest = now
  return { allowed: true }
}

export function formatTimeRemaining(nextAllowedTime: number): string {
  const now = Date.now()
  const remaining = nextAllowedTime - now
  
  if (remaining <= 0) return '0 minutes'
  
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}