import { describe, expect, it } from 'vitest'
import { createProfessionalSchedule, isProfessionalScheduleTime } from '@/lib/professional-schedule'

describe('createProfessionalSchedule', () => {
  it('creates the four requested times in India Standard Time', () => {
    const from = new Date('2026-10-08T00:00:00.000Z')
    const slots = createProfessionalSchedule('professional-1', from, 1)

    expect(slots.map(({ startTime }) => startTime.toISOString())).toEqual([
      '2026-10-08T04:30:00.000Z',
      '2026-10-08T06:30:00.000Z',
      '2026-10-08T09:30:00.000Z',
      '2026-10-08T11:30:00.000Z',
    ])
    expect(slots.every(({ professionalId }) => professionalId === 'professional-1')).toBe(true)
  })

  it('uses the India calendar day and skips past times and weekends', () => {
    const from = new Date('2026-10-09T06:00:00.000Z')
    const slots = createProfessionalSchedule('professional-1', from, 1)

    expect(slots.map(({ startTime }) => startTime.toISOString())).toEqual([
      '2026-10-09T06:30:00.000Z',
      '2026-10-09T09:30:00.000Z',
      '2026-10-09T11:30:00.000Z',
    ])

    const mondaySlots = createProfessionalSchedule('professional-1', new Date('2026-10-10T00:00:00.000Z'), 1)
    expect(mondaySlots.map(({ startTime }) => startTime.toISOString())).toEqual([
      '2026-10-12T04:30:00.000Z',
      '2026-10-12T06:30:00.000Z',
      '2026-10-12T09:30:00.000Z',
      '2026-10-12T11:30:00.000Z',
    ])
  })

  it('recognizes only the standard hour marks in India Standard Time', () => {
    expect(isProfessionalScheduleTime(new Date('2026-10-08T04:30:00.000Z'))).toBe(true)
    expect(isProfessionalScheduleTime(new Date('2026-10-08T06:00:00.000Z'))).toBe(false)
  })

  it('rejects a non-positive weekday count', () => {
    expect(() => createProfessionalSchedule('professional-1', new Date(), 0)).toThrow(RangeError)
  })
})
