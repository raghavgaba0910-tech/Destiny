import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { scoreAssessment } from '@/lib/scoring'
import { getRecommendedProfessionals } from '@/lib/recommendations'
import { assessmentQuestions, assessmentTitles } from '@/lib/questions'
import { PrintButton } from '@/components/destiny/PrintButton'

export default async function AssessmentResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) notFound()
  const [{ id }, query] = await Promise.all([params, searchParams])
  const emailStatus = query.email === 'sent' || query.email === 'preview' || query.email === 'failed'
    ? query.email
    : null
  const assessment = await db.assessment.findFirst({ where: { id, userId: session.user.id } })
  if (!assessment) notFound()
  const answers = Array.isArray(assessment.answers)
    ? assessment.answers.filter((answer): answer is number => typeof answer === 'number')
    : []
  const result = scoreAssessment(assessment.type, answers)
  const questions = assessmentQuestions[assessment.type]
  const professionals = await getRecommendedProfessionals(result.recommendation)
  const maximum = assessment.type === 'DEPRESSION' ? 27 : assessment.type === 'ANXIETY' ? 21 : assessment.type === 'STRESS' ? 40 : 40
  const progress = Math.min(100, Math.round((result.score / maximum) * 100))
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 text-[#221C35] print:max-w-none print:px-0 print:py-0">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">Your care report</p><h1 className="mt-3 text-3xl font-bold text-[#221C35]">A moment to understand how you’re feeling</h1>
    {emailStatus && <p role="status" className={`mt-5 rounded-2xl border p-4 text-sm ${emailStatus === 'sent' ? 'border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]' : emailStatus === 'preview' ? 'border-[#D3CCE2] bg-[#F5F3F8] text-[#554E6B]' : 'border-[#E8C8D2] bg-[#FBECEF] text-[#6B3346]'}`}>
      {emailStatus === 'sent' ? 'A confirmation email was sent to your registered email address.' : emailStatus === 'preview' ? 'Your report is saved. Email delivery is not configured; a local email preview was created.' : 'Your report is saved, but its email could not be delivered or saved as a preview.'}
    </p>}
    <section className="mt-7 grid gap-7 rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-xs md:grid-cols-[230px_1fr] md:p-9">
      <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-full" style={{ background: `conic-gradient(#483D76 ${progress}%, #EAE6F0 ${progress}% 100%)` }}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-[#221C35] shadow-xs"><span className="text-4xl font-bold">{result.score}</span><span className="text-xs text-[#766F8C]">screening score</span></div></div>
      <div><span className="rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-3 py-1 text-sm font-semibold text-[#483D76]">Risk / screening level: {result.severity}</span><h2 className="mt-4 text-2xl font-bold text-[#221C35]">{assessmentTitles[assessment.type]}</h2><p className="mt-3 leading-7 text-[#554E6B]">Your answers suggest {result.severity.toLowerCase()} right now. This result is a starting point for reflection, not a diagnosis. A qualified professional can help you understand what support may fit.</p>
        <p className="mt-3 text-sm leading-6 text-[#554E6B]">Suggested next step: consider talking with a {result.recommendation.toLowerCase()}. You can decide whether that feels right for you; this screening is not a diagnosis.</p>
        <p className="mt-2 text-xs text-[#766F8C]">Report date: {new Date(assessment.createdAt).toLocaleString('en-IN')} · Score {result.score} · Assessment: {assessmentTitles[assessment.type]}</p>
        {result.flagged && <div role="alert" className="mt-5 rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] p-4 text-sm leading-6 text-[#6B3346]"><strong>Please reach out for support.</strong> Your response suggests you may benefit from speaking with a professional soon. If you are in immediate danger, call India emergency services <a href="tel:112" className="font-bold underline text-[#BD6999]">112</a> or Tele-MANAS <a href="tel:14416" className="font-bold underline text-[#BD6999]">14416</a>.</div>}
        <div className="mt-6 flex flex-wrap gap-3"><PrintButton /><Link href="/assessment" className="rounded-xl bg-[#483D76] px-4 py-2.5 text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]">Take another assessment</Link></div>
      </div>
    </section>
    <section className="mt-8 rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-xs print:break-before-page">
      <h2 className="text-xl font-bold text-[#221C35]">Your responses</h2>
      <p className="mt-1 text-xs text-[#766F8C]">These answers are shown exactly as saved for this assessment.</p>
      <ol className="mt-4 space-y-4">{questions.map((question, index) => {
        const answerIndex = question.scores.indexOf(answers[index])
        return <li key={question.id} className="border-t border-[#D3CCE2] pt-3 text-sm"><p className="font-medium text-[#221C35]">{index + 1}. {question.text}</p><p className="mt-1 text-[#554E6B]">{question.options[answerIndex] ?? 'No response recorded'}</p></li>
      })}</ol>
    </section>
    <section className="mt-10 print:hidden"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">A possible next step</p><h2 className="mt-2 text-2xl font-bold text-[#221C35]">People who may be a fit</h2></div><Link className="text-sm font-semibold text-[#483D76] hover:underline" href="/therapists">Browse all</Link></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{professionals.slice(0, 4).map((person) => <article key={person.id} className="rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs"><div className="text-xs font-semibold uppercase text-[#483D76]">{person.type.toLowerCase()}</div><h3 className="mt-2 text-lg font-bold text-[#221C35]">{person.user.name}</h3><p className="mt-2 text-sm text-[#554E6B]">⭐ {person.rating.toFixed(1)} · {person.experience} years · ₹{person.pricePerSession}</p><p className="mt-3 text-sm text-[#766F8C]">{person.specialties.slice(0, 3).join(' · ')}</p><Link href={`/professionals/${person.id}`} className="mt-4 inline-block rounded-xl bg-[#483D76] px-4 py-2.5 text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]">View profile</Link></article>)}</div>
    </section>
    <p className="mt-8 text-center text-xs text-[#766F8C]">Screening is not a diagnosis. Destiny does not replace emergency or professional care.</p>
  </main>
}
