import { describe, expect, it } from 'vitest'
import type { AssessmentType } from '@prisma/client'
import { scoreAssessment } from '@/lib/scoring'

describe('safety flags', () => {
  it('raises the depression safety flag and recommends a psychiatrist when PHQ-9 item 9 is positive', () => {
    const answers = Array(25).fill(0)
    answers[8] = 1
    const result = scoreAssessment('DEPRESSION' as AssessmentType, answers)
    expect(result.flagged).toBe(true)
    expect(result.recommendation).toBe('PSYCHIATRIST')
  })

  it('flags substantial DAST scores for psychiatric assessment', () => {
    const answers = Array(25).fill(0)
    answers.splice(10, 6, 1, 1, 1, 1, 1, 1)
    const result = scoreAssessment('SUBSTANCE' as AssessmentType, answers)
    expect(result.flagged).toBe(true)
    expect(result.recommendation).toBe('PSYCHIATRIST')
  })
})
