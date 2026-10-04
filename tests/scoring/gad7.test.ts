import { describe, expect, it } from 'vitest'
import type { AssessmentType } from '@prisma/client'
import { scoreAssessment } from '@/lib/scoring'

describe('GAD-7 scoring bands', () => {
  it.each([
    [4, 'Minimal'],
    [5, 'Mild'],
    [9, 'Mild'],
    [10, 'Moderate'],
    [14, 'Moderate'],
    [15, 'Severe'],
    [21, 'Severe'],
  ])('scores %i as %s', (score, severity) => {
    const answers = Array(25).fill(0)
    for (let i = 0; i < 7 && answers.slice(0, 7).reduce((sum: number, value: number) => sum + value, 0) < score; i++) {
      answers[i] = Math.min(3, score - answers.slice(0, 7).reduce((sum: number, value: number) => sum + value, 0))
    }
    expect(scoreAssessment('ANXIETY' as AssessmentType, answers).severity).toBe(severity)
  })
})
