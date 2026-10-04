import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { canPrescribe } from '@/lib/permissions'
import { z } from 'zod'

const schema = z.object({ appointmentId: z.string().min(1), medicines: z.array(z.string().min(1)).min(1).max(10) })

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || !canPrescribe(session.user.role)) return NextResponse.json({ error: 'Only psychiatrists can issue prescriptions.' }, { status: 403 })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Provide a completed session and at least one medicine.' }, { status: 400 })
  const appointment = await db.appointment.findFirst({
    where: { id: parsed.data.appointmentId, status: 'COMPLETED', professional: { userId: session.user.id } },
  })
  if (!appointment) return NextResponse.json({ error: 'Completed session not found for this psychiatrist.' }, { status: 404 })
  const medicines = await db.medicine.findMany({
    where: { name: { in: parsed.data.medicines }, type: 'PRESCRIPTION' },
    select: { name: true },
  })
  if (medicines.length !== new Set(parsed.data.medicines).size) return NextResponse.json({ error: 'Choose only available prescription medicines.' }, { status: 400 })
  const prescription = await db.prescription.create({
    data: { appointmentId: appointment.id, patientId: appointment.patientId, medicines: medicines.map((medicine) => medicine.name) },
  })
  return NextResponse.json({ id: prescription.id }, { status: 201 })
}
