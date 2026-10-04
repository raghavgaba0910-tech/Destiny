import { auth } from '@/auth'
import { db } from '@/lib/db'
import { canPrescribe } from '@/lib/permissions'
import { notFound } from 'next/navigation'
import { PrescriptionForm } from '@/components/destiny/PrescriptionForm'

export default async function ProfessionalConsolePage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role === 'PATIENT') notFound()
  const appointments = await db.appointment.findMany({
    where: { professional: { userId: session.user.id }, status: 'COMPLETED' },
    include: { patient: { select: { name: true } }, slot: true },
    orderBy: { slot: { startTime: 'desc' } },
  })
  const medicines = canPrescribe(session.user.role)
    ? await db.medicine.findMany({ where: { type: 'PRESCRIPTION' }, select: { name: true }, orderBy: { name: 'asc' } })
    : []
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-8"><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Professional workspace</p><h1 className="mt-3 text-3xl font-bold">Pro console</h1>
    <section className="mt-7 rounded-3xl border bg-white p-6"><h2 className="text-xl font-bold">Completed sessions</h2><div className="mt-4 divide-y">{appointments.map((appointment) => <div key={appointment.id} className="flex flex-wrap justify-between gap-2 py-3"><span className="font-medium">{appointment.patient.name}</span><span className="text-sm text-muted-foreground">{new Date(appointment.slot.startTime).toLocaleString('en-IN')}</span></div>)}{!appointments.length && <p className="py-4 text-sm text-muted-foreground">No completed sessions yet.</p>}</div></section>
    <section className="mt-7 rounded-3xl border bg-white p-6"><h2 className="text-xl font-bold">Prescription pad</h2>{canPrescribe(session.user.role) ? <div className="mt-4"><PrescriptionForm appointments={appointments.map(({ id, patient }) => ({ id, patient }))} medicines={medicines} /></div> : <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Prescription access is limited to psychiatrists. Your current demo role is {session.user.role.toLowerCase()}.</p>}</section>
  </main>
}
