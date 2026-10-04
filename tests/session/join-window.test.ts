import { describe, expect, it } from 'vitest'
import { isJoinWindowOpen } from '@/lib/session'

describe('session join window', () => {
  const now = new Date('2026-10-03T12:00:00.000Z')
  const slot = (minutesFromNow: number) => new Date(now.getTime() + minutesFromNow * 60_000)

  it('opens 10 minutes before and closes 15 minutes after the start time', () => {
    expect(isJoinWindowOpen(slot(11), now)).toBe(false)
    expect(isJoinWindowOpen(slot(10), now)).toBe(true)
    expect(isJoinWindowOpen(slot(0), now)).toBe(true)
    expect(isJoinWindowOpen(slot(-15), now)).toBe(true)
    expect(isJoinWindowOpen(slot(-16), now)).toBe(false)
  })
})
