import { ANXIETY_QUESTIONS } from '@/lib/questions/anxiety'
import { DEPRESSION_QUESTIONS } from '@/lib/questions/depression'
import { STRESS_QUESTIONS } from '@/lib/questions/stress'
import { SUBSTANCE_QUESTIONS } from '@/lib/questions/substance'
import type { AssessmentType } from '@prisma/client'

export const assessmentQuestions = {
  DEPRESSION: DEPRESSION_QUESTIONS,
  ANXIETY: ANXIETY_QUESTIONS,
  SUBSTANCE: SUBSTANCE_QUESTIONS,
  STRESS: STRESS_QUESTIONS,
} satisfies Record<AssessmentType, readonly { id: string; text: string; options: readonly string[]; scores: readonly number[] }[]>

export const assessmentTitles: Record<AssessmentType, string> = {
  DEPRESSION: 'Low mood',
  ANXIETY: 'Anxiety',
  SUBSTANCE: 'Substance use',
  STRESS: 'Stress & burnout',
}
