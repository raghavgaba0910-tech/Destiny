import { describe, expect, it } from 'vitest'
import type { AssessmentType } from '@prisma/client'
import { scoreAssessment } from '@/lib/scoring'

describe('PSS-10 reverse scoring', () => {
  it('reverse scores items 4, 5, 7, and 8', () => {
    const answers = Array(25).fill(0)
    answers[3] = 4
    answers[4] = 4
    answers[6] = 4
    answers[7] = 4
    expect(scoreAssessment('STRESS' as AssessmentType, answers).score).toBe(0)
  })

  it('returns standard low, moderate, and high score bands', () => {
    const score = (value: number) => {
      const answers = Array(25).fill(0)
      for (const index of [3, 4, 6, 7]) answers[index] = 4
      for (let i = 0; i < 10 && value > 0; i++) {
        const amount = Math.min(4, value)
        answers[i] = [3, 4, 6, 7].includes(i) ? 4 - amount : amount
        value -= amount
      }
      return scoreAssessment('STRESS' as AssessmentType, answers).severity
    }
    expect(score(13)).toBe('Low stress')
    expect(score(14)).toBe('Moderate stress')
    expect(score(27)).toBe('High stress')
  })
})
