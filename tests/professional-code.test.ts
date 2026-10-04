import { describe, expect, it } from 'vitest'
import { formatProfessionalCode } from '@/lib/professional-code'

describe('formatProfessionalCode', () => {
  it('uses a fixed-width number and a role-specific suffix', () => {
    expect(formatProfessionalCode(1, 'THERAPIST')).toBe('DT00001T')
    expect(formatProfessionalCode(42, 'COUNSELLOR')).toBe('DT00042C')
    expect(formatProfessionalCode(99_999, 'PSYCHIATRIST')).toBe('DT99999P')
  })

  it('rejects sequence numbers outside the available ID range', () => {
    expect(() => formatProfessionalCode(0, 'THERAPIST')).toThrow(RangeError)
    expect(() => formatProfessionalCode(100_000, 'THERAPIST')).toThrow(RangeError)
  })
})
