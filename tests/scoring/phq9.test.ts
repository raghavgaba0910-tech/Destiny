import { describe, expect, it } from 'vitest'
import type { AssessmentType } from '@prisma/client'
import { scoreAssessment } from '@/lib/scoring'

describe('PHQ-9 scoring bands', () => {
  it.each([
    [4, 'Minimal'],
    [5, 'Mild'],
    [9, 'Mild'],
    [10, 'Moderate'],
    [14, 'Moderate'],
    [15, 'Moderately severe'],
    [19, 'Moderately severe'],
    [20, 'Severe'],
  ])('scores %i as %s', (score, severity) => {
    const answers = Array(25).fill(0)
    let remaining = score
    for (let index = 0; index < 9 && remaining > 0; index++) {
      answers[index] = Math.min(3, remaining)
      remaining -= answers[index]
    }
    expect(scoreAssessment('DEPRESSION' as AssessmentType, answers).severity).toBe(severity)
  })
})
