import { describe, expect, it } from 'vitest'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  it('allows requests within limit', () => {
    const id = `test-user-${Date.now()}`
    const result1 = checkRateLimit(id, { windowMs: 10_000, maxRequests: 2 })
    expect(result1.success).toBe(true)
    expect(result1.remaining).toBe(1)

    const result2 = checkRateLimit(id, { windowMs: 10_000, maxRequests: 2 })
    expect(result2.success).toBe(true)
    expect(result2.remaining).toBe(0)
  })

  it('blocks requests exceeding limit', () => {
    const id = `test-blocked-${Date.now()}`
    checkRateLimit(id, { windowMs: 10_000, maxRequests: 2 })
    checkRateLimit(id, { windowMs: 10_000, maxRequests: 2 })
    
    const blocked = checkRateLimit(id, { windowMs: 10_000, maxRequests: 2 })
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetMs).toBeGreaterThan(0)
  })
})

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' }
    })
    expect(getClientIp(req)).toBe('203.0.113.195')
  })

  it('falls back to 127.0.0.1 when no headers present', () => {
    const req = new Request('http://localhost')
    expect(getClientIp(req)).toBe('127.0.0.1')
  })
})
