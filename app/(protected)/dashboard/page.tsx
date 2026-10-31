import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Brain,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  Heart,
  HeartHandshake,
  MessageCircleHeart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Video,
} from 'lucide-react'

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

const assessmentTitle: Record<string, string> = {
  DEPRESSION: 'Low Mood & Energy',
  ANXIETY: 'Anxiety & Worry',
  SUBSTANCE: 'Substance & Habits',
  STRESS: 'Stress & Burnout',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'PATIENT') {
    redirect(session.user.role === 'ADMIN' ? '/admin' : '/pro')
  }

  const [appointments, latestAssessment, checkins, completedCount, professionals] =
    await Promise.all([
      db.appointment.findMany({
        where: {
          patientId: session.user.id,
          status: 'UPCOMING',
          slot: { startTime: { gte: new Date() } },
        },
        include: {
          slot: true,
          professional: { include: { user: { select: { name: true } } } },
        },
        orderBy: { slot: { startTime: 'asc' } },
        take: 2,
      }),
      db.assessment.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, severity: true, score: true, createdAt: true },
      }),
      db.checkIn.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
        take: 7,
      }),
      db.appointment.count({
        where: { patientId: session.user.id, status: 'COMPLETED' },
      }),
      db.professional.findMany({
        where: { type: { in: ['THERAPIST', 'PSYCHIATRIST'] }, isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: [{ rating: 'desc' }, { pricePerSession: 'asc' }],
        take: 3,
      }),
    ])

  const displayName = session.user.name?.trim().split(/\s+/)[0] || 'there'
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(new Date())
  )
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const checkinByDate = new Map(
    checkins.map((checkin) => [format(checkin.date, 'yyyy-MM-dd'), checkin])
  )
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = format(date, 'yyyy-MM-dd')
    const item = checkinByDate.get(key)
    const completeHabits = item
      ? [item.medication, item.exercise, item.meditation, item.supplements].filter(Boolean).length
      : 0
    return {
      label: format(date, 'EEEEE'),
      shortDay: format(date, 'EEE'),
      dateNum: format(date, 'd'),
      value: completeHabits,
      today: index === 6,
    }
  })

  const wellnessDays = checkins.filter(
    (item) => item.medication || item.exercise || item.meditation || item.supplements
  ).length

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
              <span>{dateFormat.format(new Date())}</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {greeting}, {displayName}
              <span className="text-violet-600">.</span>
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              You are here, and that is a meaningful step forward today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assessment"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-600"
            >
              <Sparkles className="h-4 w-4 text-teal-400" />
              Take an Assessment
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Sanctuary Encouragement Banner */}
        <section className="relative mt-8 overflow-hidden rounded-3xl bg-slate-900 px-7 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
                <Heart className="h-3.5 w-3.5" /> A gentle pace is still progress
              </span>
              <h2 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
                Notice how you feel, with no pressure to have it all figured out.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                Whether you want to reflect in private, speak to a supportive therapist, or just take
                a deep breath today, Destiny is here for you.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/assessment"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
                >
                  Start a Reflection <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/therapists"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Browse Therapists
                </Link>
              </div>
            </div>

            {/* Weekly Habits Micro Bar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Recent Daily Care</span>
                <span className="text-teal-300">
                  {wellnessDays} of 7 days logged
                </span>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-2">
                {week.map((day) => (
                  <div key={day.shortDay} className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition ${
                        day.value > 0
                          ? 'bg-teal-500 text-slate-950 shadow-sm'
                          : day.today
                          ? 'border border-dashed border-teal-400 text-teal-300'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {day.value > 0 ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <span>{day.dateNum}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{day.label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                {completedCount > 0
                  ? 'Daily check-ins are active. Log your mindful moments anytime.'
                  : 'Daily care routines unlock after your first completed session. No streak to lose.'}
              </p>
            </div>
          </div>
        </section>

        {/* 4 Quick Action Shortcuts */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quick shortcuts">
          {[
            {
              title: 'Assessments',
              subtitle: 'Mood, anxiety & stress assessments',
              href: '/assessment',
              icon: Brain,
              tint: 'bg-indigo-50 text-indigo-700',
            },
            {
              title: 'Find Support',
              subtitle: 'Therapists & psychiatrists',
              href: '/therapists',
              icon: HeartHandshake,
              tint: 'bg-teal-50 text-teal-700',
            },
            {
              title: 'My Sessions',
              subtitle: 'Review & join appointments',
              href: '/appointments',
              icon: Video,
              tint: 'bg-violet-50 text-violet-700',
            },
            {
              title: 'E-Pharmacy',
              subtitle: 'Prescriptions & wellness catalogue',
              href: '/pharmacy',
              icon: ShoppingBag,
              tint: 'bg-rose-50 text-rose-700',
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tint}`}>
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-600" />
            </Link>
          ))}
        </section>

        {/* Main Content Grid: Upcoming Sessions & Reflection Status */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Left Column: Upcoming Sessions */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Your Appointments
                </span>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Upcoming Sessions</h2>
              </div>
              <Link
                href="/appointments"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                All Sessions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="mt-5 space-y-4">
                {appointments.map((app) => (
                  <article
                    key={app.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-[#FAF9F6] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-center shadow-xs">
                        <span className="text-[10px] font-bold uppercase text-indigo-600">
                          {format(app.slot.startTime, 'MMM')}
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {format(app.slot.startTime, 'd')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {app.professional.user.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {dateFormat.format(app.slot.startTime)} ·{' '}
                          {timeFormat.format(app.slot.startTime)} IST
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/appointments"
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                      View Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-slate-200 bg-[#FAF9F6] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-xs">
                    <CalendarDays className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">No upcoming sessions</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      When you’re ready, explore licensed providers whose approach fits your needs.
                    </p>
                  </div>
                </div>
                <Link
                  href="/therapists"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-indigo-600"
                >
                  Find a Provider <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </section>

          {/* Right Column: Latest Self-Reflection & Care Habit */}
          <div className="space-y-6">
            {/* Latest Assessment */}
            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                    Clinical Assessment
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Latest Assessment</h2>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Brain className="h-4 w-4" />
                </span>
              </div>

              {latestAssessment ? (
                <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">
                      {assessmentTitle[latestAssessment.type] ?? latestAssessment.type}
                    </p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-teal-700 shadow-2xs">
                      {latestAssessment.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Completed {format(latestAssessment.createdAt, 'd MMM yyyy')} · Score{' '}
                    {latestAssessment.score}
                  </p>
                  <Link
                    href={`/assessment/result/${latestAssessment.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View Care Report <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-[#FAF9F6] p-4">
                  <p className="text-xs font-semibold text-slate-700">
                    A few questions can bring sudden clarity.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Take a 3-minute assessment anytime to understand your emotional patterns.
                  </p>
                  <Link
                    href="/assessment"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Start an Assessment <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </section>

            {/* Daily Wellbeing Action */}
            <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                    Gentle Care
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Daily Wellbeing</h2>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Heart className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Small mindful moments add up. Log simple daily routines like movement, rest, and
                medication without streak pressure.
              </p>

              {completedCount > 0 ? (
                <Link
                  href="/checkin"
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-50 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                >
                  Open Daily Check-in <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
                  Daily habits unlock following your first completed session.
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Featured Providers Section */}
        <section className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Verified Support
              </span>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                People Who Can Support You
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Browse sample profiles to find someone whose background and approach feel right.
              </p>
            </div>
            <Link
              href="/therapists"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
            >
              Explore Full Directory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((person) => {
              const initials = person.user.name
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
              return (
                <Link
                  key={person.id}
                  href={`/professionals/${person.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#FAF9F6] p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
                        {initials}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                          {person.user.name}
                        </h3>
                        <p className="mt-0.5 text-xs capitalize text-slate-500">
                          {person.type.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {person.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs">
                    <span className="font-semibold text-slate-700">
                      ₹{new Intl.NumberFormat('en-IN').format(person.pricePerSession)} / session
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600">
                      Book Slot <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {!professionals.length && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-5 text-xs text-slate-500">
              <Compass className="h-5 w-5 text-indigo-600" />
              The professional directory is updating. Check back shortly.
            </div>
          )}
        </section>

        {/* Emergency Reassurance Footer */}
        <footer className="mt-8 flex flex-col gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-rose-950">Immediate Help in India</p>
            <p className="mt-0.5 text-xs leading-relaxed text-rose-900/80">
              If you or someone you know is in immediate crisis, call{' '}
              <a href="tel:112" className="font-bold underline">
                112
              </a>{' '}
              or Tele-MANAS at{' '}
              <a href="tel:14416" className="font-bold underline">
                14416
              </a>
              . Destiny does not replace clinical emergency care.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-rose-600" /> 24/7 National Helplines
          </span>
        </footer>
      </div>
    </div>
  )
}
