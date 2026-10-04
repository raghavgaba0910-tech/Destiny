import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { assessmentQuestions } from '@/lib/questions'
import { scoreAssessment } from '@/lib/scoring'
import { AssessmentType } from '@prisma/client'
import { z } from 'zod'

const schema = z.object({
  type: z.nativeEnum(AssessmentType),
  answers: z.array(z.number().int().min(0).max(4)),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Patient sign-in required.' }, { status: 401 })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Please provide all assessment answers.' }, { status: 400 })
  const questions = assessmentQuestions[parsed.data.type]
  if (parsed.data.answers.length !== questions.length || parsed.data.answers.some((answer, index) => !questions[index].scores.includes(answer))) {
    return NextResponse.json({ error: 'Some answers are incomplete or invalid. Please review the assessment.' }, { status: 400 })
  }
  const result = scoreAssessment(parsed.data.type, parsed.data.answers)
  const assessment = await db.assessment.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      answers: parsed.data.answers,
      score: result.score,
      severity: result.severity,
      flagged: result.flagged,
    },
  })
  return NextResponse.json({ id: assessment.id }, { status: 201 })
}
