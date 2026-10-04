import Link from 'next/link'
import { ArrowRight, Brain, Flame, HeartPulse, Sparkles } from 'lucide-react'

const options = [
  { type: 'DEPRESSION', title: 'Low mood', copy: 'Explore energy, mood, and enjoyment.', icon: HeartPulse, tone: 'bg-coral/10 text-coral' },
  { type: 'ANXIETY', title: 'Anxiety', copy: 'Reflect on worry and feeling on edge.', icon: Brain, tone: 'bg-violet/10 text-violet' },
  { type: 'STRESS', title: 'Stress & burnout', copy: 'Notice your stress and recovery patterns.', icon: Flame, tone: 'bg-amber-100 text-amber-700' },
  { type: 'SUBSTANCE', title: 'Substance use', copy: 'Consider how alcohol or other substances affect you.', icon: Sparkles, tone: 'bg-teal/10 text-teal' },
]

export default function AssessmentPage() {
  return <main className="mx-auto max-w-5xl px-5 py-12 md:px-8"><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Check in with yourself</p><h1 className="mt-3 text-3xl font-bold md:text-4xl">What’s been on your mind?</h1><p className="mt-3 max-w-2xl text-muted-foreground">Choose a topic to begin. Your results are for reflection and are not a diagnosis.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">{options.map(({ type, title, copy, icon: Icon, tone }) => <Link key={type} href={`/assessment/${type.toLowerCase()}`} className="group rounded-3xl border bg-white p-6 transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-lg"><span className={`inline-flex rounded-2xl p-3 ${tone}`}><Icon className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{copy}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo">Start check-in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div>
    <p className="mt-8 rounded-2xl border border-coral/30 bg-coral/5 p-4 text-sm leading-6">If you are in immediate danger in India, call 112. For mental health support call Tele-MANAS at 14416. Destiny does not provide emergency care.</p>
  </main>
}
