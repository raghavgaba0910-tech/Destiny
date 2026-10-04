import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { isJoinWindowOpen } from '@/lib/session'

export default async function AppointmentsPage() {
  const session = await auth()
  if (!session?.user?.id) return null
  const where = session.user.role === 'PATIENT' ? { patientId: session.user.id } : { professional: { userId: session.user.id } }
  const appointments = await db.appointment.findMany({
    where,
    include: { slot: true, patient: { select: { name: true } }, professional: { include: { user: { select: { name: true } } } } },
    orderBy: { slot: { startTime: 'asc' } },
  })
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-8"><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Your care</p><h1 className="mt-3 text-3xl font-bold">Appointments</h1><p className="mt-2 text-muted-foreground">All listed sessions are demo appointments.</p>
    <div className="mt-7 space-y-4">{appointments.map((appointment) => {
      const canJoin = appointment.status === 'UPCOMING' && isJoinWindowOpen(appointment.slot.startTime)
      const otherName = session.user.role === 'PATIENT' ? appointment.professional.user.name : appointment.patient.name
      return <article key={appointment.id} className="flex flex-col gap-5 rounded-3xl border bg-white p-6 sm:flex-row sm:items-center sm:justify-between"><div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${appointment.status === 'COMPLETED' ? 'bg-teal/10 text-teal' : appointment.status === 'CANCELLED' ? 'bg-muted text-muted-foreground' : 'bg-violet/10 text-violet'}`}>{appointment.status.toLowerCase()}</span><h2 className="mt-3 text-lg font-bold">{otherName}</h2><p className="mt-1 text-sm text-muted-foreground">{new Date(appointment.slot.startTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST</p></div>
        {canJoin ? <Link href={`/session/${appointment.id}`} className="rounded-xl bg-indigo px-5 py-3 text-center text-sm font-semibold text-white">Join session</Link> : appointment.status === 'UPCOMING' ? <span className="text-sm text-muted-foreground">Join opens 10 minutes before the session</span> : <span className="text-sm text-muted-foreground">Session closed</span>}
      </article>
    })}{!appointments.length && <div className="rounded-3xl border bg-white p-8 text-center"><h2 className="text-lg font-bold">No sessions yet</h2><p className="mt-2 text-sm text-muted-foreground">Explore the directory to find a support option.</p><Link href="/therapists" className="mt-5 inline-block rounded-xl bg-indigo px-5 py-3 text-sm font-semibold text-white">Find a professional</Link></div>}</div>
  </main>
}
