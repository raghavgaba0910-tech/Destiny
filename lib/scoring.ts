import type { AssessmentType } from '@prisma/client'

export interface ScoringResult {
  score: number
  severity: string
  band: string
  flagged: boolean
  recommendation: 'COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST'
  subScores?: Record<string, number>
}

export function scoreAssessment(type: AssessmentType, answers: number[]): ScoringResult {
  switch (type) {
    case 'DEPRESSION': return scoreDepression(answers)
    case 'ANXIETY': return scoreAnxiety(answers)
    case 'SUBSTANCE': return scoreSubstance(answers)
    case 'STRESS': return scoreStress(answers)
  }
  throw new Error(`Unsupported assessment type: ${type}`)
}

function scoreDepression(answers: number[]): ScoringResult {
  // PHQ-9: first 9 questions, scores 0-3
  const phq9Score = answers.slice(0, 9).reduce((a, b) => a + b, 0)
  // Original items: questions 10-25, scores 0-2
  const originalScore = answers.slice(9, 25).reduce((a, b) => a + b, 0)
  const score = phq9Score
  const flagged = answers[8] > 0 // PHQ-9 Q9
  
  let severity: string
  let recommendation: 'COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST'
  
  if (score <= 4) { severity = 'Minimal'; recommendation = 'COUNSELLOR' }
  else if (score <= 9) { severity = 'Mild'; recommendation = 'COUNSELLOR' }
  else if (score <= 14) { severity = 'Moderate'; recommendation = 'THERAPIST' }
  else if (score <= 19) { severity = 'Moderately severe'; recommendation = 'PSYCHIATRIST' }
  else { severity = 'Severe'; recommendation = 'PSYCHIATRIST' }
  
  if (flagged) recommendation = 'PSYCHIATRIST'
  
  return { score: phq9Score, severity, band: severity, flagged, recommendation, subScores: { phq9: phq9Score, original: originalScore } }
}

function scoreAnxiety(answers: number[]): ScoringResult {
  const gad7Score = answers.slice(0, 7).reduce((a, b) => a + b, 0)
  const originalScore = answers.slice(7, 25).reduce((a, b) => a + b, 0)
  const flagged = false
  
  let severity: string
  let recommendation: 'COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST'
  
  if (gad7Score <= 4) { severity = 'Minimal'; recommendation = 'COUNSELLOR' }
  else if (gad7Score <= 9) { severity = 'Mild'; recommendation = 'COUNSELLOR' }
  else if (gad7Score <= 14) { severity = 'Moderate'; recommendation = 'THERAPIST' }
  else { severity = 'Severe'; recommendation = 'PSYCHIATRIST' }
  
  return { score: gad7Score, severity, band: severity, flagged, recommendation, subScores: { gad7: gad7Score, original: originalScore } }
}

function scoreSubstance(answers: number[]): ScoringResult {
  const auditScore = answers.slice(0, 10).reduce((a, b) => a + b, 0)
  const dastScore = answers.slice(10, 20).reduce((a, b) => a + b, 0)
  const flagged = dastScore >= 6
  const severity = auditScore <= 7 ? 'Low risk' : auditScore <= 15 ? 'Hazardous' : auditScore <= 19 ? 'Harmful' : 'Dependence risk'
  const recommendation = flagged || auditScore >= 16 ? 'PSYCHIATRIST' : auditScore >= 8 ? 'THERAPIST' : 'COUNSELLOR'
  return { score: auditScore, severity, band: severity, flagged, recommendation, subScores: { audit: auditScore, dast: dastScore } }
}

function scoreStress(answers: number[]): ScoringResult {
  const reversedItems = new Set([3, 4, 6, 7])
  const pssScore = answers.slice(0, 10).reduce((total, answer, index) => {
    return total + (reversedItems.has(index) ? 4 - answer : answer)
  }, 0)
  const originalScore = answers.slice(10, 25).reduce((a, b) => a + b, 0)
  const severity = pssScore <= 13 ? 'Low stress' : pssScore <= 26 ? 'Moderate stress' : 'High stress'
  const recommendation = pssScore >= 27 ? 'THERAPIST' : 'COUNSELLOR'
  return { score: pssScore, severity, band: severity, flagged: false, recommendation, subScores: { pss10: pssScore, original: originalScore } }
}
