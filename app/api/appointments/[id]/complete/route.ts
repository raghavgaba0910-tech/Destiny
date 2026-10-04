import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { isJoinWindowOpen } from '@/lib/session'

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const { id } = await params
  const appointment = await db.appointment.findUnique({ where: { id }, include: { slot: true, professional: true } })
  if (!appointment || (appointment.patientId !== session.user.id && appointment.professional.userId !== session.user.id)) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
  }
  if (appointment.status !== 'UPCOMING' || !isJoinWindowOpen(appointment.slot.startTime)) {
    return NextResponse.json({ error: 'This session cannot be completed outside its join window.' }, { status: 403 })
  }
  await db.appointment.update({ where: { id }, data: { status: 'COMPLETED' } })
  return NextResponse.json({ success: true })
}
