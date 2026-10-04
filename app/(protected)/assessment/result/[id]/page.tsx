import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { scoreAssessment } from '@/lib/scoring'
import { getRecommendedProfessionals } from '@/lib/recommendations'
import { assessmentTitles } from '@/lib/questions'
import { PrintButton } from '@/components/destiny/PrintButton'

export default async function AssessmentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) notFound()
  const { id } = await params
  const assessment = await db.assessment.findFirst({ where: { id, userId: session.user.id } })
  if (!assessment) notFound()
  const result = scoreAssessment(assessment.type, assessment.answers as number[])
  const professionals = await getRecommendedProfessionals(result.recommendation)
  const maximum = assessment.type === 'DEPRESSION' ? 27 : assessment.type === 'ANXIETY' ? 21 : assessment.type === 'STRESS' ? 40 : 40
  const progress = Math.min(100, Math.round((result.score / maximum) * 100))
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Your care report</p><h1 className="mt-3 text-3xl font-bold">A moment to understand how you’re feeling</h1>
    <section className="mt-7 grid gap-7 rounded-3xl border bg-white p-6 md:grid-cols-[230px_1fr] md:p-9">
      <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-full" style={{ background: `conic-gradient(#8B5CF6 ${progress}%, #ede9fe ${progress}% 100%)` }}><div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white"><span className="text-4xl font-bold">{result.score}</span><span className="text-xs text-muted-foreground">screening score</span></div></div>
      <div><span className="rounded-full bg-violet/10 px-3 py-1 text-sm font-semibold text-violet">{result.severity}</span><h2 className="mt-4 text-2xl font-bold">{assessmentTitles[assessment.type]}</h2><p className="mt-3 leading-7 text-muted-foreground">Your answers suggest {result.severity.toLowerCase()} right now. This result is a starting point for reflection, not a diagnosis. A qualified professional can help you understand what support may fit.</p>
        {result.flagged && <div role="alert" className="mt-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm leading-6"><strong>Please reach out for support.</strong> Your response suggests you may benefit from speaking with a professional soon. If you are in immediate danger, call India emergency services <a href="tel:112" className="font-bold underline">112</a> or Tele-MANAS <a href="tel:14416" className="font-bold underline">14416</a>.</div>}
        <div className="mt-6 flex flex-wrap gap-3"><PrintButton /><Link href="/assessment" className="rounded-xl bg-indigo px-4 py-2.5 text-sm font-semibold text-white">Another check-in</Link></div>
      </div>
    </section>
    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">A possible next step</p><h2 className="mt-2 text-2xl font-bold">People who may be a fit</h2></div><Link className="text-sm font-semibold text-indigo" href="/therapists">Browse all</Link></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{professionals.slice(0, 4).map((person) => <article key={person.id} className="rounded-3xl border bg-white p-5"><div className="text-xs font-semibold uppercase text-violet">{person.type.toLowerCase()}</div><h3 className="mt-2 text-lg font-bold">{person.user.name}</h3><p className="mt-2 text-sm text-muted-foreground">⭐ {person.rating.toFixed(1)} · {person.experience} years · ₹{person.pricePerSession}</p><p className="mt-3 text-sm text-muted-foreground">{person.specialties.slice(0, 3).join(' · ')}</p><Link href={`/professionals/${person.id}`} className="mt-4 inline-block rounded-xl bg-indigo px-4 py-2.5 text-sm font-semibold text-white">View profile</Link></article>)}</div>
    </section>
    <p className="mt-8 text-center text-xs text-muted-foreground">Screening is not a diagnosis. Destiny does not replace emergency or professional care.</p>
  </main>
}
