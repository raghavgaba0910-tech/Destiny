import { describe, expect, it } from 'vitest'
import { canPrescribe } from '@/lib/permissions'

describe('prescription permissions', () => {
  it('allows psychiatrists only', () => {
    expect(canPrescribe('PSYCHIATRIST')).toBe(true)
    expect(canPrescribe('THERAPIST')).toBe(false)
    expect(canPrescribe('COUNSELLOR')).toBe(false)
    expect(canPrescribe('PATIENT')).toBe(false)
  })
})
