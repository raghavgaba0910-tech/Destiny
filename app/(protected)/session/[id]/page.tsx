import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { isJoinWindowOpen } from '@/lib/session'
import { SessionClient } from '@/components/destiny/SessionClient'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  const appointment = await db.appointment.findUnique({ where: { id }, include: { slot: true, professional: true } })
  if (!session?.user?.id || !appointment || (appointment.patientId !== session.user.id && appointment.professional.userId !== session.user.id)) notFound()
  return <SessionClient appointmentId={appointment.id} available={appointment.status === 'UPCOMING' && isJoinWindowOpen(appointment.slot.startTime)} />
}
