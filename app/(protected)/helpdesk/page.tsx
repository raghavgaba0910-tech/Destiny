import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { assessmentTitles } from '@/lib/questions'
import { SupportDesk } from '@/components/destiny/SupportDesk'

export default async function HelpdeskPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role === 'ADMIN') redirect('/admin')
  const isPatient = session.user.role === 'PATIENT'
  const [appointments, orders, assessments, tickets, completedSessionCount] = await Promise.all([
    db.appointment.findMany({
      where: isPatient ? { patientId: session.user.id } : { professional: { userId: session.user.id } },
      include: { slot: true, professional: { include: { user: { select: { name: true } } } } },
      orderBy: { slot: { startTime: 'desc' } },
      take: 50,
    }),
    isPatient ? db.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50 }) : Promise.resolve([]),
    isPatient ? db.assessment.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50 }) : Promise.resolve([]),
    db.supportTicket.findMany({ where: { requesterId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    isPatient ? Promise.resolve(0) : db.appointment.count({ where: { professional: { userId: session.user.id }, status: 'COMPLETED' } }),
  ])
  const activities = [
    ...appointments.map((appointment) => ({
      id: appointment.id,
      type: 'APPOINTMENT' as const,
      label: `Session · ${isPatient ? appointment.professional.user.name : appointment.patientName} · ${new Date(appointment.slot.startTime).toLocaleDateString('en-IN')}`,
    })),
    ...orders.map((order) => ({ id: order.id, type: 'ORDER' as const, label: `Pharmacy order · ${order.status.toLowerCase()} · ${new Date(order.createdAt).toLocaleDateString('en-IN')}` })),
    ...assessments.map((assessment) => ({ id: assessment.id, type: 'ASSESSMENT' as const, label: `Assessment report · ${assessmentTitles[assessment.type]} · ${new Date(assessment.createdAt).toLocaleDateString('en-IN')}` })),
  ]
  return <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">{isPatient ? 'Patient support' : 'Professional support'}</p>
    <h1 className="mt-3 text-3xl font-bold">Help desk</h1>
    <p className="mt-2 text-sm text-slate-500">File a request about your Destiny account or an activity.</p>
    <div className="mt-7"><SupportDesk
      professional={!isPatient}
      activities={activities}
      tickets={tickets.map((ticket) => ({ ...ticket, createdAt: ticket.createdAt.toISOString() }))}
      supportEmail={process.env.SUPPORT_EMAIL?.trim() || null}
      supportPhone={process.env.SUPPORT_PHONE?.trim() || null}
      completedSessionCount={completedSessionCount}
    /></div>
  </main>
}
