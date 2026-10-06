import { describe, expect, it } from 'vitest'
import { getTierPrice } from '@/lib/professional-pricing'

describe('getTierPrice', () => {
  it.each([
    ['A', 999, 1199, 1499],
    ['B', 1999, 2199, 2499],
    ['C', 2999, 3199, 3500],
  ] as const)('uses the requested prices for tier %s', (tier, low, middle, high) => {
    expect(getTierPrice(tier, 0, 7)).toBe(low)
    expect(getTierPrice(tier, 8, 8.2)).toBe(middle)
    expect(getTierPrice(tier, 12, 9.5)).toBe(high)
  })
})
