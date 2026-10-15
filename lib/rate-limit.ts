/**
 * In-memory sliding-window rate limiter for Next.js API endpoints and middleware.
 * Prevents credential brute-forcing, spamming, and API denial of service.
 */

type RateLimitRecord = {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean up stale entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  const interval = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((time) => now - time < 600_000)
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    }
  }, 300_000)
  if (interval.unref) interval.unref()
}

export type RateLimitConfig = {
  windowMs: number
  maxRequests: number
}

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  resetMs: number
}

/**
 * Check if an identifier (IP address, user ID, etc.) has exceeded the allowed rate limit.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - config.windowMs

  let record = rateLimitStore.get(identifier)
  if (!record) {
    record = { timestamps: [] }
    rateLimitStore.set(identifier, record)
  }

  // Filter timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((time) => time > windowStart)

  if (record.timestamps.length >= config.maxRequests) {
    const oldest = record.timestamps[0]
    const resetMs = Math.max(0, oldest + config.windowMs - now)
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetMs,
    }
  }

  // Record this request
  record.timestamps.push(now)

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.timestamps.length,
    resetMs: config.windowMs,
  }
}

/**
 * Helper to get a client identifier from Request headers (X-Forwarded-For, X-Real-IP, etc.)
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // The client IP is the first entry in comma-separated list
    const ip = forwardedFor.split(',')[0].trim()
    if (ip) return ip
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  return '127.0.0.1'
}

/**
 * Common preset rate limit configurations
 */
export const RATE_LIMITS = {
  AUTH: { windowMs: 60_000, maxRequests: 10 }, // 10 attempts per minute (login/register)
  SUBMIT: { windowMs: 60_000, maxRequests: 20 }, // 20 requests per minute (forms, bookings, orders)
  GENERAL_API: { windowMs: 60_000, maxRequests: 120 }, // 120 requests per minute (standard API reads)
}
