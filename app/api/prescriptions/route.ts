import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { canPrescribe } from '@/lib/permissions'
import { z } from 'zod'

const medicineSchema = z.object({
  name: z.string().trim().min(1).max(120),
  dose: z.string().trim().min(1).max(100),
  frequency: z.enum(['ONCE_DAILY', 'TWICE_DAILY', 'THRICE_DAILY', 'AS_NEEDED']),
  duration: z.string().trim().min(1).max(100),
})
const schema = z.object({
  appointmentId: z.string().min(1),
  medicines: z.array(medicineSchema).max(10),
  nextSessionAt: z.string().datetime().optional().or(z.literal('')),
  followUpRequired: z.boolean(),
  followUpNotes: z.string().trim().max(1000).optional(),
}).refine((data) => !data.nextSessionAt || !data.nextSessionAt.length || data.nextSessionAt.slice(0, 10) >= new Date().toISOString().slice(0, 10), {
  message: 'Suggested next-session date cannot be in the past.',
  path: ['nextSessionAt'],
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !['COUNSELLOR', 'THERAPIST', 'PSYCHIATRIST'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Professional sign-in required.' }, { status: 403 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide valid prescription details.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Provide a completed session and at least one medicine.' }, { status: 400 })
  if (new Set(parsed.data.medicines.map(({ name }) => name)).size !== parsed.data.medicines.length) {
    return NextResponse.json({ error: 'Each medicine can appear only once on a prescription.' }, { status: 400 })
  }
  if (parsed.data.medicines.length && !canPrescribe(session.user.role)) {
    return NextResponse.json({ error: 'Only psychiatrists can prescribe medication. You can still add a follow-up plan.' }, { status: 403 })
  }
  const appointment = await db.appointment.findFirst({
    where: { id: parsed.data.appointmentId, status: 'COMPLETED', professional: { userId: session.user.id } },
  })
  if (!appointment) return NextResponse.json({ error: 'Completed session not found for this psychiatrist.' }, { status: 404 })
  const medicines = await db.medicine.findMany({
    where: { name: { in: parsed.data.medicines.map(({ name }) => name) }, type: 'PRESCRIPTION' },
    select: { name: true },
  })
  if (medicines.length !== parsed.data.medicines.length) return NextResponse.json({ error: 'Choose only available prescription medicines.' }, { status: 400 })
  const prescription = await db.prescription.create({
    data: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      medicines: parsed.data.medicines,
      nextSessionAt: parsed.data.nextSessionAt ? new Date(parsed.data.nextSessionAt) : null,
      followUpRequired: parsed.data.followUpRequired,
      followUpNotes: parsed.data.followUpNotes || null,
    },
  })
  return NextResponse.json({ id: prescription.id }, { status: 201 })
}
