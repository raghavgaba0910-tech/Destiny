import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { scoreAssessment } from '@/lib/scoring'
import { getRecommendedProfessionals } from '@/lib/recommendations'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const { id } = await params
  const assessment = await db.assessment.findFirst({ where: { id, userId: session.user.id } })
  if (!assessment) return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 })
  const result = scoreAssessment(assessment.type, assessment.answers as number[])
  const professionals = await getRecommendedProfessionals(result.recommendation)
  return NextResponse.json({
    assessment: { id: assessment.id, type: assessment.type, score: assessment.score, severity: assessment.severity, flagged: assessment.flagged, createdAt: assessment.createdAt },
    result,
    professionals,
  })
}
