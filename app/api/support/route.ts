import { NextResponse } from 'next/server'
import { SupportCategory } from '@prisma/client'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sanitizeText } from '@/lib/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  category: z.nativeEnum(SupportCategory),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(3000),
  activityType: z.enum(['APPOINTMENT', 'ORDER', 'ASSESSMENT']).optional(),
  activityId: z.string().min(1).optional(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !['PATIENT', 'COUNSELLOR', 'THERAPIST', 'PSYCHIATRIST'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Patient or professional sign-in required.' }, { status: 403 })
  }

  // Rate limiting support requests
  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(`support:${session.user.id}:${ip}`, { windowMs: 10 * 60_000, maxRequests: 10 })
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many support requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide valid help desk details.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Add a subject and at least 10 characters describing your issue.' }, { status: 400 })

  const cleanSubject = sanitizeText(parsed.data.subject, 120)
  const cleanMessage = sanitizeText(parsed.data.message, 3000)

  if (cleanSubject.length < 3 || cleanMessage.length < 10) {
    return NextResponse.json({ error: 'Provide a valid subject and message.' }, { status: 400 })
  }

  const patientCategories: SupportCategory[] = [
    'APPOINTMENT_SCHEDULING',
    'LIVE_SESSION',
    'BILLING_REFUND_RECEIPT',
    'PRIVACY_DATA_ACCOUNT',
    'CONTACT_US',
    'OTHER',
  ]
  const professionalCategories: SupportCategory[] = [
    'CLIENT_EHR_PLATFORM',
    'PAYOUTS_CLAIMS_DUES',
    'SESSION_INCONVENIENCE',
    'CLIENT_MANAGEMENT',
    'CONTACT_US',
    'OTHER',
  ]
  const allowedCategories = session.user.role === 'PATIENT' ? patientCategories : professionalCategories
  if (!allowedCategories.includes(parsed.data.category)) {
    return NextResponse.json({ error: 'Choose an issue type available for your account.' }, { status: 400 })
  }

  const { activityType, activityId } = parsed.data
  if (Boolean(activityType) !== Boolean(activityId)) {
    return NextResponse.json({ error: 'Choose a valid activity to include with this request.' }, { status: 400 })
  }
  const related: { relatedAppointmentId?: string; relatedOrderId?: string; relatedAssessmentId?: string } = {}
  if (activityType && activityId) {
    if (activityType === 'APPOINTMENT') {
      const appointment = await db.appointment.findFirst({
        where: {
          id: activityId,
          ...(session.user.role === 'PATIENT' ? { patientId: session.user.id } : { professional: { userId: session.user.id } }),
        },
        select: { id: true },
      })
      if (!appointment) return NextResponse.json({ error: 'That appointment is not available to this account.' }, { status: 404 })
      related.relatedAppointmentId = appointment.id
    } else if (activityType === 'ORDER' && session.user.role === 'PATIENT') {
      const order = await db.order.findFirst({ where: { id: activityId, userId: session.user.id }, select: { id: true } })
      if (!order) return NextResponse.json({ error: 'That order is not available to this account.' }, { status: 404 })
      related.relatedOrderId = order.id
    } else if (activityType === 'ASSESSMENT' && session.user.role === 'PATIENT') {
      const assessment = await db.assessment.findFirst({ where: { id: activityId, userId: session.user.id }, select: { id: true } })
      if (!assessment) return NextResponse.json({ error: 'That report is not available to this account.' }, { status: 404 })
      related.relatedAssessmentId = assessment.id
    } else {
      return NextResponse.json({ error: 'Choose an activity available to your account.' }, { status: 400 })
    }
  }

  const ticket = await db.supportTicket.create({
    data: {
      requesterId: session.user.id,
      category: parsed.data.category,
      subject: cleanSubject,
      message: cleanMessage,
      ...related,
    },
    select: { id: true, status: true },
  })
  return NextResponse.json(ticket, { status: 201 })
}
