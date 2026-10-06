import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { generateMailPreview, MailDeliveryError } from '@/lib/mail'
import { PatientGender } from '@prisma/client'
import { z } from 'zod'

const bookingSchema = z.object({
  slotId: z.string().min(1),
  professionalId: z.string().min(1),
  patientName: z.string().trim().min(2).max(100),
  patientAge: z.number().int().min(1).max(120),
  patientGender: z.nativeEnum(PatientGender),
  shareAssessment: z.boolean(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const where = session.user.role === 'PATIENT' ? { patientId: session.user.id } : { professional: { userId: session.user.id } }
  const appointments = await db.appointment.findMany({
    where,
    include: {
      slot: true,
      patient: { select: { id: true, name: true } },
      professional: { include: { user: { select: { name: true } } } },
      sharedAssessment: { select: { type: true, answers: true, score: true, severity: true, flagged: true, createdAt: true } },
    },
    orderBy: { slot: { startTime: 'asc' } },
  })
  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Patient sign-in required.' }, { status: 401 })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide valid appointment details.' }, { status: 400 })
  }
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Choose a valid session slot.' }, { status: 400 })

  try {
    const appointment = await db.$transaction(async (tx) => {
      const slot = await tx.slot.findUnique({
        where: { id: parsed.data.slotId },
        include: { professional: true },
      })
      if (!slot || !slot.professional.isApproved || slot.isBooked || slot.professionalId !== parsed.data.professionalId || slot.startTime <= new Date()) {
        throw new Error('SLOT_UNAVAILABLE')
      }
      const locked = await tx.slot.updateMany({
        where: { id: slot.id, isBooked: false },
        data: { isBooked: true },
      })
      if (locked.count !== 1) throw new Error('SLOT_UNAVAILABLE')
      const latestAssessment = parsed.data.shareAssessment
        ? await tx.assessment.findFirst({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
          })
        : null
      return tx.appointment.create({
        data: {
          patientId: session.user.id,
          patientName: parsed.data.patientName,
          patientAge: parsed.data.patientAge,
          patientGender: parsed.data.patientGender,
          professionalId: slot.professionalId,
          slotId: slot.id,
          sharedAssessmentId: latestAssessment?.id,
        },
        include: { patient: true, professional: { include: { user: true } }, slot: true },
      })
    })
    let emailDelivery: 'sent' | 'preview' | 'failed' = 'failed'
    let emailMessage: string
    try {
      const email = await generateMailPreview({
        id: appointment.id,
        patientEmail: appointment.patient.email,
        patientName: appointment.patientName,
        professionalName: appointment.professional.user.name,
        startTime: appointment.slot.startTime,
        pricePerSession: appointment.professional.pricePerSession,
      })
      emailDelivery = email.delivery
      emailMessage = email.message
    } catch (error) {
      console.error('Appointment confirmation email could not be delivered:', error)
      emailMessage = error instanceof MailDeliveryError && error.previewSaved
        ? 'Appointment booked, but email delivery failed. An HTML email preview was saved locally.'
        : 'Appointment booked, but its email could not be sent or saved as a preview.'
    }
    return NextResponse.json({ id: appointment.id, emailDelivery, emailMessage }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
      return NextResponse.json({ error: 'That slot was just booked or is no longer available. Please choose another.' }, { status: 409 })
    }
    console.error('Appointment booking failed:', error)
    return NextResponse.json({ error: 'We could not complete your booking. Please try again.' }, { status: 500 })
  }
}
