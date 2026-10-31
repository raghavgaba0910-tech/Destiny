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
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 text-[#221C35]"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">Your care</p><h1 className="mt-3 text-3xl font-bold text-[#221C35]">Appointments</h1><p className="mt-2 text-[#554E6B]">Review your upcoming and past sessions.</p>
    <div className="mt-7 space-y-4">{appointments.map((appointment) => {
      const canJoin = appointment.status === 'UPCOMING' && isJoinWindowOpen(appointment.slot.startTime)
      const otherName = session.user.role === 'PATIENT' ? appointment.professional.user.name : appointment.patientName
      return <article key={appointment.id} className="flex flex-col gap-5 rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between"><div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${appointment.status === 'COMPLETED' ? 'border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]' : appointment.status === 'CANCELLED' ? 'border border-[#D3CCE2] bg-[#F5F3F8] text-[#766F8C]' : 'border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]'}`}>{appointment.status.toLowerCase()}</span><h2 className="mt-3 text-lg font-bold text-[#221C35]">{otherName}</h2>{session.user.role !== 'PATIENT' && <p className="mt-1 text-xs text-[#554E6B]">{appointment.patientAge} years · {appointment.patientGender === 'MALE' ? 'Male' : appointment.patientGender === 'FEMALE' ? 'Female' : 'Other'}</p>}<p className="mt-1 text-sm text-[#554E6B]">{new Date(appointment.slot.startTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST</p></div>
        {canJoin ? <Link href={`/session/${appointment.id}`} className="rounded-xl bg-[#483D76] px-5 py-3 text-center text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]">Join session</Link> : appointment.status === 'UPCOMING' ? <span className="text-sm text-[#766F8C]">Join opens 10 minutes before the session</span> : <span className="text-sm text-[#766F8C]">Session closed</span>}
      </article>
    })}{!appointments.length && <div className="rounded-3xl border border-[#D3CCE2] bg-white p-8 text-center"><h2 className="text-lg font-bold text-[#221C35]">No sessions yet</h2><p className="mt-2 text-sm text-[#554E6B]">Explore the directory to find a support option.</p><Link href="/therapists" className="mt-5 inline-block rounded-xl bg-[#483D76] px-5 py-3 text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]">Find a professional</Link></div>}</div>
  </main>
}
