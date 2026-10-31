import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { scoreAssessment } from '@/lib/scoring'
import { getRecommendedProfessionals } from '@/lib/recommendations'
import { assessmentQuestions, assessmentTitles } from '@/lib/questions'
import { DownloadReportButton, type ReportData } from '@/components/destiny/DownloadReportButton'
import { ShieldCheck, Heart, AlertCircle, ArrowRight, Clock, User, Calendar } from 'lucide-react'

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
  const emailStatus =
    query.email === 'sent' || query.email === 'preview' || query.email === 'failed'
      ? query.email
      : null

  const [assessment, latestAppointment] = await Promise.all([
    db.assessment.findFirst({ where: { id, userId: session.user.id } }),
    db.appointment.findFirst({
      where: { patientId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { patientAge: true },
    }),
  ])

  if (!assessment) notFound()

  const answers = Array.isArray(assessment.answers)
    ? assessment.answers.filter((answer): answer is number => typeof answer === 'number')
    : []
  const result = scoreAssessment(assessment.type, answers)
  const questions = assessmentQuestions[assessment.type]
  const maximum =
    assessment.type === 'DEPRESSION' ? 27 : assessment.type === 'ANXIETY' ? 21 : assessment.type === 'STRESS' ? 40 : 40
  const progress = Math.min(100, Math.round((result.score / maximum) * 100))

  // Determine if user score is lower than moderate state
  const isLowerThanModerate =
    assessment.type === 'DEPRESSION'
      ? result.score < 10
      : assessment.type === 'ANXIETY'
      ? result.score < 10
      : assessment.type === 'STRESS'
      ? result.score <= 13
      : result.score <= 7

  const safeStatus = result.flagged
    ? 'Attention Required (High Risk)'
    : isLowerThanModerate
    ? 'Safe (Low Clinical Risk)'
    : 'Moderate (Clinical Review Recommended)'

  const recommendationType: 'COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST' = isLowerThanModerate
    ? 'COUNSELLOR'
    : result.recommendation

  const professionals = await getRecommendedProfessionals(recommendationType)

  const patientAge = latestAppointment?.patientAge ?? null
  const formattedDateTime = new Date(assessment.createdAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' IST'

  const reportData: ReportData = {
    userName: session.user.name ?? 'Member',
    userAge: patientAge,
    createdAt: assessment.createdAt,
    title: assessmentTitles[assessment.type],
    score: result.score,
    maximumScore: maximum,
    severity: result.severity,
    flagged: result.flagged,
    recommendation: recommendationType,
    isLowerThanModerate,
    safeStatus,
    questions: questions.map((q, i) => {
      const answerIndex = q.scores.indexOf(answers[i])
      return {
        questionText: q.text,
        answerText: q.options[answerIndex] ?? 'No response recorded',
      }
    }),
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 text-[#221C35]">
      {/* Page Title & Category */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">Your Care Report</p>
          <h1 className="mt-1 text-3xl font-bold text-[#221C35]">A moment to understand how you’re feeling</h1>
        </div>
        <div className="mt-2 sm:mt-0">
          <DownloadReportButton data={reportData} />
        </div>
      </div>

      {emailStatus && (
        <p
          role="status"
          className={`mt-5 rounded-2xl border p-4 text-sm ${
            emailStatus === 'sent'
              ? 'border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]'
              : emailStatus === 'preview'
              ? 'border-[#D3CCE2] bg-[#F5F3F8] text-[#554E6B]'
              : 'border-[#E8C8D2] bg-[#FBECEF] text-[#6B3346]'
          }`}
        >
          {emailStatus === 'sent'
            ? 'A confirmation email was sent to your registered email address.'
            : emailStatus === 'preview'
            ? 'Your report is saved. Email delivery is not configured; a local email preview was created.'
            : 'Your report is saved, but its email could not be delivered or saved as a preview.'}
        </p>
      )}

      {/* Patient Overview Details Strip */}
      <section className="mt-6 rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] p-4 text-xs">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="block font-bold text-[#766F8C] uppercase tracking-wider text-[10px]">Patient Name</span>
            <span className="mt-1 block font-semibold text-[#221C35] text-sm">{session.user.name ?? 'Member'}</span>
          </div>
          <div>
            <span className="block font-bold text-[#766F8C] uppercase tracking-wider text-[10px]">Patient Age</span>
            <span className="mt-1 block font-semibold text-[#221C35] text-sm">{patientAge ? `${patientAge} years` : 'Confirmed on download'}</span>
          </div>
          <div>
            <span className="block font-bold text-[#766F8C] uppercase tracking-wider text-[10px]">Date &amp; Time</span>
            <span className="mt-1 block font-semibold text-[#221C35] text-sm">{formattedDateTime}</span>
          </div>
          <div>
            <span className="block font-bold text-[#766F8C] uppercase tracking-wider text-[10px]">Safe Status</span>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-bold text-xs ${
                result.flagged
                  ? 'bg-[#FBECEF] text-[#6B3346] border border-[#E8C8D2]'
                  : isLowerThanModerate
                  ? 'bg-[#D8E6DF] text-[#1F473D] border border-[#BBD1C6]'
                  : 'bg-[#EBE4F2] text-[#483D76] border border-[#C8BCE0]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {safeStatus}
            </span>
          </div>
        </div>
      </section>

      {/* Main Score & Recommendation Card */}
      <section className="mt-6 grid gap-7 rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-xs md:grid-cols-[230px_1fr] md:p-9">
        {/* Circular Progress Gauge */}
        <div
          className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-full"
          style={{ background: `conic-gradient(#483D76 ${progress}%, #EAE6F0 ${progress}% 100%)` }}
        >
          <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white text-[#221C35] shadow-xs">
            <span className="text-4xl font-bold">{result.score}</span>
            <span className="text-xs text-[#766F8C]">of {maximum} max score</span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-3 py-1 text-sm font-semibold text-[#483D76]">
              Screening level: {result.severity}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                result.flagged
                  ? 'border border-[#E8C8D2] bg-[#FBECEF] text-[#6B3346]'
                  : isLowerThanModerate
                  ? 'border border-[#BBD1C6] bg-[#D8E6DF] text-[#1F473D]'
                  : 'border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]'
              }`}
            >
              Safe Status: {safeStatus}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-[#221C35]">{assessmentTitles[assessment.type]}</h2>

          {/* Conditional Guidance: Lower than Moderate vs Moderate+ */}
          {isLowerThanModerate ? (
            <div className="mt-4 rounded-2xl border border-[#BBD1C6] bg-[#D8E6DF] p-4.5 text-sm leading-relaxed text-[#1F473D]">
              <div className="flex items-center gap-2 font-bold text-[#162620]">
                <ShieldCheck className="h-5 w-5 text-[#1F473D]" />
                <span>Therapy Not Required · Gentle Counselling Offered for Wellbeing</span>
              </div>
              <p className="mt-2 text-[#1F473D]/95">
                Your screening score falls below the moderate threshold. <strong>You do not actually need clinical therapy or psychiatric treatment at this time.</strong>
              </p>
              <p className="mt-2 text-[#1F473D]/90">
                Instead, we offer and recommend gentle <strong>counselling for smooth mental wellbeing</strong> if you are feeling lost in your life, overwhelmed by everyday transitions, or simply wish to talk things through with a compassionate sounding board.
              </p>
            </div>
          ) : result.flagged ? (
            <div role="alert" className="mt-4 rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] p-4 text-sm leading-6 text-[#6B3346]">
              <strong>Please reach out for support.</strong> Your response suggests you may benefit from speaking with a clinical professional soon. If you are in immediate danger in India, call emergency services <a href="tel:112" className="font-bold underline text-[#BD6999]">112</a> or Tele-MANAS <a href="tel:14416" className="font-bold underline text-[#BD6999]">14416</a>.
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-[#C8BCE0] bg-[#EBE4F2] p-4.5 text-sm leading-relaxed text-[#483D76]">
              <p>
                Your score suggests moderate symptoms right now. A qualified professional or therapist can help you build structured, evidence-based coping tools to navigate these patterns.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <DownloadReportButton data={reportData} />
            <Link
              href="/assessment"
              className="rounded-xl border border-[#D3CCE2] bg-white px-4 py-2.5 text-sm font-semibold text-[#221C35] transition hover:bg-[#F5F3F8]"
            >
              Take Another Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Recorded Responses Section */}
      <section className="mt-8 rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-xs">
        <h2 className="text-xl font-bold text-[#221C35]">Your Responses</h2>
        <p className="mt-1 text-xs text-[#766F8C]">These answers are shown exactly as saved for this assessment record.</p>
        <ol className="mt-4 space-y-4">
          {questions.map((question, index) => {
            const answerIndex = question.scores.indexOf(answers[index])
            return (
              <li key={question.id} className="border-t border-[#D3CCE2] pt-3 text-sm">
                <p className="font-medium text-[#221C35]">
                  {index + 1}. {question.text}
                </p>
                <p className="mt-1 text-[#554E6B] font-semibold">{question.options[answerIndex] ?? 'No response recorded'}</p>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Recommended Professionals Section */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">
              {isLowerThanModerate ? 'Support for Smooth Wellbeing' : 'A Possible Next Step'}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#221C35]">
              {isLowerThanModerate ? 'Counsellors to Talk Things Through' : 'Professionals Who May Be a Fit'}
            </h2>
            {isLowerThanModerate && (
              <p className="mt-1 text-xs text-[#554E6B]">
                Since you do not need therapy, connect with an empathetic counsellor if you feel lost or wish to reflect on your life goals.
              </p>
            )}
          </div>
          <Link
            className="text-sm font-semibold text-[#483D76] hover:underline"
            href={isLowerThanModerate ? '/counsellors' : '/therapists'}
          >
            Browse all {isLowerThanModerate ? 'counsellors' : 'professionals'}
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {professionals.slice(0, 4).map((person) => (
            <article key={person.id} className="rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs">
              <div className="text-xs font-semibold uppercase text-[#483D76]">{person.type.toLowerCase()}</div>
              <h3 className="mt-2 text-lg font-bold text-[#221C35]">{person.user.name}</h3>
              <p className="mt-2 text-sm text-[#554E6B]">
                ⭐ {person.rating.toFixed(1)} · {person.experience} years · ₹{person.pricePerSession}
              </p>
              <p className="mt-3 text-sm text-[#766F8C]">{person.specialties.slice(0, 3).join(' · ')}</p>
              <Link
                href={`/professionals/${person.id}`}
                className="mt-4 inline-block rounded-xl bg-[#483D76] px-4 py-2.5 text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]"
              >
                View Profile &amp; Book
              </Link>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-[#766F8C]">
        Screening is not a clinical diagnosis. Destiny does not replace emergency or medical care.
      </p>
    </main>
  )
}
