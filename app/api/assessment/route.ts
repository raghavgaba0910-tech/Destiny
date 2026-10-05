import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { assessmentQuestions, assessmentTitles } from '@/lib/questions'
import { scoreAssessment } from '@/lib/scoring'
import { AssessmentType } from '@prisma/client'
import { z } from 'zod'
import { MailDeliveryError, sendAssessmentConfirmation } from '@/lib/mail'

const schema = z.object({
  type: z.nativeEnum(AssessmentType),
  answers: z.array(z.number().int().min(0).max(4)),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Patient sign-in required.' }, { status: 401 })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide valid assessment answers.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
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
  let emailDelivery: 'sent' | 'preview' | 'failed' = 'failed'
  let emailMessage: string
  try {
    const email = await sendAssessmentConfirmation({
      id: assessment.id,
      to: session.user.email,
      patientName: session.user.name,
      title: assessmentTitles[assessment.type],
    })
    emailDelivery = email.delivery
    emailMessage = email.message
  } catch (error) {
    console.error('Assessment confirmation email could not be delivered:', error)
    emailMessage = error instanceof MailDeliveryError && error.previewSaved
      ? 'Your report was saved, but email delivery failed. An HTML email preview was saved locally.'
      : 'Your report was saved, but its email could not be sent or saved as a preview.'
  }
  return NextResponse.json({ id: assessment.id, emailDelivery, emailMessage }, { status: 201 })
}
