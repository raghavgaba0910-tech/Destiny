import type { ProfType } from '@prisma/client'

export function formatProfessionalCode(sequence: number, type: ProfType): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 99_999) {
    throw new RangeError('Professional ID sequence must be between 1 and 99,999.')
  }
  const suffix = type === 'THERAPIST' ? 'T' : type === 'COUNSELLOR' ? 'C' : 'P'
  return `DT${String(sequence).padStart(5, '0')}${suffix}`
}
