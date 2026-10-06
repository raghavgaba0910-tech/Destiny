import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { AdminConsole } from '@/components/destiny/AdminConsole'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect(session.user.role === 'PATIENT' ? '/dashboard' : '/pro')

  const [applications, tickets] = await Promise.all([
    db.professionalApplication.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } }),
    db.supportTicket.findMany({
      include: {
        requester: { select: { name: true, email: true, role: true } },
        relatedAppointment: { select: { patientName: true, slot: { select: { startTime: true } }, professional: { include: { user: { select: { name: true } } } } } },
        relatedOrder: { select: { total: true, status: true, createdAt: true } },
        relatedAssessment: { select: { type: true, severity: true, createdAt: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    }),
  ])
  const ticketProps = tickets.map((ticket) => ({
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
    relatedAppointment: ticket.relatedAppointment ? {
      ...ticket.relatedAppointment,
      slot: { startTime: ticket.relatedAppointment.slot.startTime.toISOString() },
    } : null,
    relatedOrder: ticket.relatedOrder ? { ...ticket.relatedOrder, createdAt: ticket.relatedOrder.createdAt.toISOString() } : null,
    relatedAssessment: ticket.relatedAssessment ? { ...ticket.relatedAssessment, createdAt: ticket.relatedAssessment.createdAt.toISOString() } : null,
  }))
  return <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Destiny administration</p>
    <h1 className="mt-3 text-3xl font-bold">Admin workspace</h1>
    <p className="mt-2 text-sm text-slate-500">Review provider applications and respond to patient and professional help desk requests.</p>
    <div className="mt-7"><AdminConsole applications={applications.map((application) => ({ ...application, createdAt: application.createdAt.toISOString() }))} tickets={ticketProps} /></div>
  </main>
}
