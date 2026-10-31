import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ArrowRight, Brain, Flame, HeartPulse, Sparkles } from 'lucide-react'

const options = [
  { type: 'DEPRESSION', title: 'Low mood', copy: 'Explore energy, mood, and enjoyment.', icon: HeartPulse, tone: 'border border-[#E8C8D2] bg-[#FBECEF] text-[#6B3346]' },
  { type: 'ANXIETY', title: 'Anxiety', copy: 'Reflect on worry and feeling on edge.', icon: Brain, tone: 'border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]' },
  { type: 'STRESS', title: 'Stress & burnout', copy: 'Notice your stress and recovery patterns.', icon: Flame, tone: 'border border-[#DFC7BE] bg-[#F5EAE6] text-[#5A2E22]' },
  { type: 'SUBSTANCE', title: 'Substance use', copy: 'Consider how alcohol or other substances affect you.', icon: Sparkles, tone: 'border border-[#BBD1C6] bg-[#D8E6DF] text-[#1F473D]' },
]

export default async function AssessmentPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'PATIENT') {
    redirect(session.user.role === 'ADMIN' ? '/admin' : '/pro')
  }

  return <main className="mx-auto max-w-5xl px-5 py-12 md:px-8 text-[#221C35]"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">Clinical Self-Assessments</p><h1 className="mt-3 text-3xl font-bold text-[#221C35] md:text-4xl">What’s been on your mind?</h1><p className="mt-3 max-w-2xl text-[#554E6B]">Choose a topic to begin. Your results are for reflection and are not a diagnosis.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">{options.map(({ type, title, copy, icon: Icon, tone }) => <Link key={type} href={`/assessment/${type.toLowerCase()}`} className="group rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-xs transition hover:-translate-y-0.5 hover:border-[#BD6999] hover:shadow-lg"><span className={`inline-flex rounded-2xl p-3 ${tone}`}><Icon className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-bold text-[#221C35]">{title}</h2><p className="mt-2 text-sm text-[#554E6B]">{copy}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#483D76] group-hover:text-[#372E5A]">Start Assessment <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div>
    <p className="mt-8 rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] p-4 text-sm leading-6 text-[#6B3346]">If you are in immediate danger in India, call <a href="tel:112" className="underline font-bold text-[#BD6999]">112</a>. For mental health support call Tele-MANAS at <a href="tel:14416" className="underline font-bold text-[#BD6999]">14416</a>. Destiny does not provide emergency care.</p>
  </main>
}
