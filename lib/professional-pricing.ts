import type { Tier } from '@prisma/client'

const TIER_PRICES: Record<Tier, readonly [number, number, number]> = {
  A: [999, 1199, 1499],
  B: [1999, 2199, 2499],
  C: [2999, 3199, 3500],
}

export function getTierPrice(tier: Tier, experience: number, rating: number): number {
  const score = rating + Math.min(experience, 12) * 0.08
  const band = score < 8.5 ? 0 : score < 9.2 ? 1 : 2
  return TIER_PRICES[tier][band]
}
