import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowRight, ArrowUpRight, BadgeCheck, Brain, CalendarDays, Check, Clock3, Compass, Heart, HeartHandshake, Sparkles, Video } from 'lucide-react'

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const timeFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
})

const steps = [
  { label: 'Check in', href: '/assessment', icon: Brain, detail: 'A private moment to reflect' },
  { label: 'Find support', href: '/therapists', icon: HeartHandshake, detail: 'Explore people who can help' },
  { label: 'Your sessions', href: '/appointments', icon: Video, detail: 'Keep your care in one place' },
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'PATIENT') redirect('/pro')

  const [appointments, latestAssessment, checkins, completedCount, professionals] = await Promise.all([
    db.appointment.findMany({
      where: { patientId: session.user.id, status: 'UPCOMING', slot: { startTime: { gte: new Date() } } },
      include: { slot: true, professional: { include: { user: { select: { name: true } } } } },
      orderBy: { slot: { startTime: 'asc' } },
      take: 2,
    }),
    db.assessment.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, severity: true, score: true, createdAt: true },
    }),
    db.checkIn.findMany({ where: { userId: session.user.id }, orderBy: { date: 'desc' }, take: 7 }),
    db.appointment.count({ where: { patientId: session.user.id, status: 'COMPLETED' } }),
    db.professional.findMany({
      where: { type: { in: ['THERAPIST', 'PSYCHIATRIST'] } },
      include: { user: { select: { name: true } } },
      orderBy: [{ rating: 'desc' }, { pricePerSession: 'asc' }],
      take: 3,
    }),
  ])

  const displayName = session.user.name?.trim().split(/\s+/)[0] || 'there'
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23' }).format(new Date()))
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const checkinByDate = new Map(checkins.map((checkin) => [format(checkin.date, 'yyyy-MM-dd'), checkin]))
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = format(date, 'yyyy-MM-dd')
    const item = checkinByDate.get(key)
    const completeHabits = item ? [item.medication, item.exercise, item.meditation, item.supplements].filter(Boolean).length : 0
    return { label: format(date, 'EEEEE'), value: completeHabits, today: index === 6 }
  })
  const wellnessDays = checkins.filter((item) => item.medication || item.exercise || item.meditation || item.supplements).length
  const assessmentTitle: Record<string, string> = {
    DEPRESSION: 'Low mood',
    ANXIETY: 'Anxiety',
    SUBSTANCE: 'Substance use',
    STRESS: 'Stress & burnout',
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-7 md:px-8 md:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">{dateFormat.format(new Date())}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{greeting}, {displayName}<span className="text-violet">.</span></h1>
            <p className="mt-1.5 text-sm text-slate-500">You’re here. That’s a good place to start.</p>
          </div>
          <Link href="/assessment" className="hidden min-h-11 items-center gap-2 rounded-xl bg-[#171a32] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo sm:inline-flex">
            <Sparkles className="h-4 w-4 text-teal" /> Take a check-in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="relative mt-7 overflow-hidden rounded-[1.75rem] bg-[#15172f] text-white shadow-[0_24px_60px_-35px_rgba(25,26,60,.65)]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-36 h-[25rem] w-[25rem] rounded-full bg-violet/30 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
          <div className="relative grid gap-8 px-6 py-7 sm:px-9 sm:py-9 lg:grid-cols-[1fr_300px] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-teal-100"><span className="h-1.5 w-1.5 rounded-full bg-teal" /> Your care, your pace</span>
              <h2 className="mt-4 max-w-xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">You don’t need all the answers to take one small step.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Start with a gentle check-in. Get a clearer picture of what you might need, with no pressure to have it figured out.</p>
              <Link href="/assessment" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#171a32] transition hover:bg-teal-50">Start a free check-in <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="hidden rounded-[1.4rem] border border-white/10 bg-white/[.06] p-5 lg:block">
              <div className="flex items-center justify-between"><p className="text-xs font-semibold text-white/80">A little progress</p><Sparkles className="h-4 w-4 text-teal" /></div>
              <div className="mt-5 flex h-16 items-end gap-2">
                {week.map((day, index) => <div key={`${index}-${day.label}`} className="flex flex-1 flex-col items-center gap-2"><div className={`w-full rounded-t-md transition ${day.today ? 'bg-teal' : day.value ? 'bg-violet/90' : 'bg-white/15'}`} style={{ height: `${Math.max(10, day.value * 17)}px` }} /><span className="text-[9px] text-white/45">{day.label}</span></div>)}
              </div>
              <p className="mt-4 text-xs leading-5 text-white/55">{wellnessDays ? `${wellnessDays} of your recent days include a check-in.` : 'Small moments add up. Your check-ins will appear here.'}</p>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-3" aria-label="Your care shortcuts">
          {steps.map(({ label, href, icon: Icon, detail }, index) => (
            <Link key={href} href={href} className="group flex items-center gap-4 rounded-2xl border border-[#e9e7e2] bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet/25 hover:shadow-[0_16px_35px_-28px_rgba(70,60,130,.5)] sm:p-5">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${index === 0 ? 'bg-violet/10 text-violet' : index === 1 ? 'bg-teal/10 text-teal' : 'bg-indigo/10 text-indigo'}`}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">{label}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-violet" />
            </Link>
          ))}
        </section>

        <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.85fr)]">
          <section className="rounded-[1.5rem] border border-[#e9e7e2] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet">Coming up</p><h2 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">Your sessions</h2></div>
              <Link href="/appointments" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo hover:underline">All sessions <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {appointments.length ? (
              <div className="mt-5 space-y-3">
                {appointments.map((appointment) => (
                  <article key={appointment.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-[#fbfaf8] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-center shadow-sm"><span className="text-[9px] font-bold uppercase text-violet">{format(appointment.slot.startTime, 'MMM')}</span><span className="text-lg font-semibold leading-5 text-ink">{format(appointment.slot.startTime, 'd')}</span></div>
                      <div><p className="text-sm font-semibold text-ink">{appointment.professional.user.name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{dateFormat.format(appointment.slot.startTime)} · {timeFormat.format(appointment.slot.startTime)} IST</p></div>
                    </div>
                    <Link href="/appointments" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-indigo/30 hover:text-indigo">View details <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-dashed border-slate-200 bg-[#fbfaf8] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400"><CalendarDays className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-ink">No upcoming sessions</p><p className="mt-1 text-xs leading-5 text-slate-500">When you’re ready, explore support that feels right for you.</p></div></div>
                <Link href="/therapists" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo px-3 text-xs font-semibold text-white transition hover:bg-indigo/90">Explore providers <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            )}
          </section>

          <div className="space-y-5">
            <section className="rounded-[1.5rem] border border-[#e9e7e2] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal">Reflection</p><h2 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">Your latest check-in</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/10 text-teal"><Brain className="h-4 w-4" /></span></div>
              {latestAssessment ? (
                <div className="mt-4 rounded-xl bg-[#f6faf8] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-ink">{assessmentTitle[latestAssessment.type]}</p><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-teal">{latestAssessment.severity}</span></div><p className="mt-2 text-xs text-slate-500">Completed {format(latestAssessment.createdAt, 'd MMM yyyy')} · score {latestAssessment.score}</p><p className="mt-2 text-[10px] leading-4 text-slate-400">A screening reflection, not a diagnosis.</p><Link href={`/assessment/result/${latestAssessment.id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo">View care report <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              ) : <div className="mt-4 rounded-xl bg-[#f6faf8] p-4"><p className="text-sm font-semibold text-ink">A few questions can be a helpful first step.</p><p className="mt-1 text-xs leading-5 text-slate-500">Your care report stays here so you can revisit it whenever you want.</p><Link href="/assessment" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo">Start a check-in <ArrowRight className="h-3.5 w-3.5" /></Link></div>}
            </section>

            <section className="rounded-[1.5rem] border border-[#e9e7e2] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet">A kind habit</p><h2 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">Your week, gently</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/10 text-violet"><Heart className="h-4 w-4" /></span></div>
              <div className="mt-4 flex items-end justify-between gap-1.5">{week.map((day, index) => <div key={`${index}-${day.label}`} className="flex flex-1 flex-col items-center gap-2"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${day.value ? 'bg-teal/10 text-teal' : day.today ? 'border border-dashed border-violet/30 text-violet' : 'bg-slate-50 text-slate-300'}`}>{day.value ? <Check className="h-4 w-4" /> : <span className="text-[10px]">{day.label}</span>}</div>{day.value > 0 && <span className="text-[9px] font-medium text-slate-400">{day.value}/4</span>}</div>)}</div>
              {completedCount > 0 ? <Link href="/checkin" className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#f7f6fa] text-xs font-semibold text-indigo transition hover:bg-violet/10">Open daily check-in <ArrowRight className="h-3.5 w-3.5" /></Link> : <p className="mt-4 text-[10px] leading-5 text-slate-400">Daily check-ins unlock after a completed session. There’s no streak to lose.</p>}
            </section>
          </div>
        </div>

        <section className="mt-7 rounded-[1.5rem] border border-[#e9e7e2] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet">A place to begin</p><h2 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">People who can support you</h2><p className="mt-1 text-xs text-slate-500">Sample profiles to help you explore what a good fit can look like.</p></div><Link href="/therapists" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo hover:underline">Explore all <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{professionals.map((person) => <Link key={person.id} href={`/professionals/${person.id}`} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-violet/25 hover:bg-violet/[.02]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-indigo text-xs font-semibold text-white">{person.user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-ink">{person.user.name}</span><span className="mt-1 block text-[10px] text-slate-500">{person.type.toLowerCase()} · ₹{new Intl.NumberFormat('en-IN').format(person.pricePerSession)}</span></span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-violet" /></Link>)}</div>
          {!professionals.length && <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-500"><Compass className="h-4 w-4" />The directory is getting ready. Check back soon.</div>}
        </section>

        <footer className="mt-7 flex flex-col gap-2 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold text-rose-950">Need urgent support?</p><p className="mt-1 text-[11px] leading-5 text-rose-900/70">If you’re in immediate danger in India, call <a href="tel:112" className="font-semibold underline">112</a>. Tele-MANAS: <a href="tel:14416" className="font-semibold underline">14416</a>.</p></div>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-rose-900/55"><BadgeCheck className="h-3.5 w-3.5" /> Demo product · not emergency care</span>
        </footer>
      </div>
    </div>
  )
}
