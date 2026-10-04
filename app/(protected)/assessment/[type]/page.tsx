import { notFound } from 'next/navigation'
import { AssessmentRunner } from '@/components/destiny/AssessmentRunner'
import { assessmentTitles } from '@/lib/questions'
import type { AssessmentType } from '@prisma/client'

const supported = ['depression', 'anxiety', 'substance', 'stress'] as const

export default async function AssessmentRunnerPage({ params }: { params: Promise<{ type: string }> }) {
  const { type: rawType } = await params
  const type = rawType.toUpperCase()
  if (!supported.includes(rawType.toLowerCase() as typeof supported[number])) notFound()
  return <AssessmentRunner type={type as AssessmentType} />
}
