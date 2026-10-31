import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { canPrescribe } from '@/lib/permissions'
import { assessmentQuestions, assessmentTitles } from '@/lib/questions'
import { notFound, redirect } from 'next/navigation'
import { CalendarDays, Clock3, FileText, UserRound } from 'lucide-react'
import { PrescriptionForm } from '@/components/destiny/PrescriptionForm'

const roleLabels: Record<string, string> = {
  PSYCHIATRIST: 'Psychiatrist',
  COUNSELLOR: 'Counsellor',
  THERAPIST: 'Therapist',
}

export default async function ProfessionalConsolePage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role === 'PATIENT') notFound()
  if (session.user.role === 'ADMIN') redirect('/admin')

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  })
  if (!professional) notFound()

  const [upcoming, completed, medicines] = await Promise.all([
    db.appointment.findMany({
      where: {
        professionalId: professional.id,
        status: 'UPCOMING',
        slot: { startTime: { gte: new Date() } },
      },
      include: { slot: true, sharedAssessment: true },
      orderBy: { slot: { startTime: 'asc' } },
    }),
    db.appointment.findMany({
      where: { professionalId: professional.id, status: 'COMPLETED' },
      include: { patient: { select: { name: true } }, slot: true },
      orderBy: { slot: { startTime: 'desc' } },
    }),
    canPrescribe(session.user.role)
      ? db.medicine.findMany({
          where: { type: 'PRESCRIPTION' },
          select: { name: true },
          orderBy: { name: 'asc' },
        })
      : Promise.resolve([]),
  ])

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 text-[#221C35]">
      <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">{roleLabels[session.user.role]} workspace</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-[#221C35]">Welcome, {session.user.name}</h1><p className="mt-2 text-sm text-[#554E6B]">Your professional ID: <span className="font-semibold text-[#483D76]">{professional.professionalCode}</span></p></div>
        <Link href="/appointments" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#D3CCE2] bg-white px-4 text-sm font-semibold text-[#221C35] shadow-xs transition hover:bg-[#EAE6F0]"><CalendarDays className="h-4 w-4 text-[#483D76]" /> All sessions</Link>
      </div>

      <section className="mt-7 rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-[#221C35]">Upcoming sessions</h2><p className="mt-1 text-sm text-[#554E6B]">Appointments booked with you.</p></div><span className="rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-3 py-1 text-xs font-semibold text-[#483D76]">{upcoming.length} upcoming</span></div>
        <div className="mt-5 space-y-4">
          {upcoming.map((appointment) => {
            const sharedAssessment = appointment.sharedAssessment
            const answers = sharedAssessment && Array.isArray(sharedAssessment.answers)
              ? sharedAssessment.answers.filter((answer): answer is number => typeof answer === 'number')
              : []
            const questions = sharedAssessment ? assessmentQuestions[sharedAssessment.type] : []

            return (
              <article key={appointment.id} className="rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#221C35]">{appointment.patientName}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#554E6B]"><span>{appointment.patientAge} years</span><span>{appointment.patientGender === 'OTHER' ? 'Other' : appointment.patientGender === 'MALE' ? 'Male' : 'Female'}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-[#BD6999]" />{new Date(appointment.slot.startTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST</span></p>
                  </div>
                  <Link href={`/session/${appointment.id}`} className="rounded-xl bg-[#483D76] px-4 py-2.5 text-center text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]">Open session</Link>
                </div>
                {sharedAssessment ? (
                  <details className="mt-4 rounded-xl border border-[#D3CCE2] bg-white p-4">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[#483D76] [&::-webkit-details-marker]:hidden"><FileText className="h-4 w-4 text-[#BD6999]" /> Shared assessment report · {assessmentTitles[sharedAssessment.type]}</summary>
                    <p className="mt-3 text-xs text-[#554E6B]">Completed {new Date(sharedAssessment.createdAt).toLocaleDateString('en-IN')} · Score {sharedAssessment.score} · {sharedAssessment.severity}{sharedAssessment.flagged ? ' · Safety flag' : ''}. Screening information, not a diagnosis.</p>
                    <ol className="mt-3 max-h-72 space-y-3 overflow-y-auto border-t border-[#D3CCE2] pt-3">
                      {questions.map((question, index) => {
                        const answerIndex = question.scores.indexOf(answers[index])
                        return <li key={question.id} className="text-xs leading-5"><p className="font-medium text-[#221C35]">{index + 1}. {question.text}</p><p className="mt-0.5 text-[#554E6B]">{question.options[answerIndex] ?? 'No response recorded'}</p></li>
                      })}
                    </ol>
                  </details>
                ) : <p className="mt-4 inline-flex items-center gap-2 text-xs text-[#554E6B]"><UserRound className="h-4 w-4 text-[#766F8C]" /> Client details only; no assessment report was shared.</p>}
              </article>
            )
          })}
          {!upcoming.length && <p className="rounded-2xl border border-dashed border-[#D3CCE2] p-6 text-center text-sm text-[#766F8C]">You have no upcoming sessions.</p>}
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-xl font-bold text-[#221C35]">Completed sessions</h2>
        <div className="mt-4 divide-y divide-[#D3CCE2]">{completed.map((appointment) => <div key={appointment.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium text-[#221C35]">{appointment.patientName || appointment.patient.name}</span><span className="text-[#554E6B]">{new Date(appointment.slot.startTime).toLocaleString('en-IN')}</span></div>)}{!completed.length && <p className="py-4 text-sm text-[#766F8C]">No completed sessions yet.</p>}</div>
      </section>

      {completed.length > 0 && <section className="mt-7 rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs sm:p-6"><h2 className="text-xl font-bold text-[#221C35]">{canPrescribe(session.user.role) ? 'Prescription pad' : 'Follow-up session plan'}</h2><p className="mt-1 text-sm text-[#554E6B]">{canPrescribe(session.user.role) ? 'Only psychiatrists can issue medication prescriptions.' : 'Add a suggested next session and follow-up guidance for a completed session.'}</p><div className="mt-4"><PrescriptionForm appointments={completed.map(({ id, patientName }) => ({ id, patientName }))} medicines={medicines} canPrescribe={canPrescribe(session.user.role)} /></div></section>}
    </main>
  )
}
