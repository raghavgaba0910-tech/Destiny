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
    <div className="min-h-screen bg-[#F5F3F8]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#766F8C]">
              <CalendarDays className="h-3.5 w-3.5 text-[#483D76]" />
              <span>{dateFormat.format(new Date())}</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#221C35] sm:text-4xl">
              {greeting}, {displayName}
              <span className="text-[#BD6999]">.</span>
            </h1>
            <p className="mt-1.5 text-sm text-[#554E6B]">
              You are here, and that is a meaningful step forward today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assessment"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#483D76] px-5 text-xs font-bold text-[#F5F3F8] shadow-sm transition hover:bg-[#372E5A]"
            >
              <Sparkles className="h-4 w-4 text-[#EBE4F2]" />
              Take an Assessment
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Sanctuary Encouragement Banner */}
        <section className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#19152B] to-[#2A214C] px-7 py-8 text-[#F5F3F8] shadow-xl shadow-[#19152B]/15 sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#BD6999]/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-[#483D76]/30 blur-3xl"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#BD6999]/40 bg-[#BD6999]/20 px-3.5 py-1 text-xs font-semibold text-[#EBE4F2]">
                <Heart className="h-3.5 w-3.5 text-[#EBE4F2]" /> A gentle pace is still progress
              </span>
              <h2 className="mt-4 text-2xl font-bold leading-snug text-[#F5F3F8] sm:text-3xl">
                Notice how you feel, with no pressure to have it all figured out.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#D5CEEC] sm:text-base">
                Whether you want to reflect in private, speak to a supportive therapist, or just take
                a deep breath today, Destiny is here for you.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/assessment"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F5F3F8] px-4 text-xs font-bold text-[#221C35] shadow-sm transition hover:bg-[#EAE6F0]"
                >
                  Start a Reflection <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/therapists"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-[#F5F3F8] transition hover:bg-white/20"
                >
                  Browse Therapists
                </Link>
              </div>
            </div>

            {/* Weekly Habits Micro Bar */}
            <div className="rounded-2xl border border-white/[0.16] bg-white/[0.08] p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#EAE6F0]">
                <span>Recent Daily Care</span>
                <span className="text-[#EBE4F2] font-bold">
                  {wellnessDays} of 7 days logged
                </span>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-2">
                {week.map((day) => (
                  <div key={day.shortDay} className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition ${
                        day.value > 0
                          ? 'border-2 border-[#BD6999] bg-[#483D76] text-[#F5F3F8] shadow-sm'
                          : day.today
                          ? 'border border-dashed border-[#BD6999] text-[#EBE4F2]'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {day.value > 0 ? (
                        <Check className="h-4 w-4 stroke-[3] text-[#F5F3F8]" />
                      ) : (
                        <span>{day.dateNum}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#D5CEEC]/70">{day.label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[#D5CEEC]/80">
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
              tint: 'bg-[#EBE4F2] text-[#483D76]',
            },
            {
              title: 'Find Support',
              subtitle: 'Therapists & psychiatrists',
              href: '/therapists',
              icon: HeartHandshake,
              tint: 'bg-[#EBE4F2] text-[#483D76]',
            },
            {
              title: 'My Sessions',
              subtitle: 'Review & join appointments',
              href: '/appointments',
              icon: Video,
              tint: 'bg-[#EBE4F2] text-[#483D76]',
            },
            {
              title: 'E-Pharmacy',
              subtitle: 'Prescriptions & wellness catalogue',
              href: '/pharmacy',
              icon: ShoppingBag,
              tint: 'bg-[#EBE4F2] text-[#483D76]',
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center justify-between rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-[#BD6999] hover:bg-[#EAE6F0] hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tint}`}>
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#221C35]">{item.title}</h3>
                  <p className="text-xs text-[#554E6B]">{item.subtitle}</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#766F8C] transition group-hover:text-[#483D76]" />
            </Link>
          ))}
        </section>

        {/* Main Content Grid: Upcoming Sessions & Reflection Status */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Left Column: Upcoming Sessions */}
          <section className="rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-6 shadow-xs sm:p-7">
            <div className="flex items-center justify-between border-b border-[#D3CCE2] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                  Your Appointments
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#221C35]">Upcoming Sessions</h2>
              </div>
              <Link
                href="/appointments"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#483D76] hover:underline"
              >
                All Sessions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="mt-5 space-y-4">
                {appointments.map((app) => (
                  <article
                    key={app.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#D3CCE2] bg-[#EAE6F0] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] text-center shadow-xs">
                        <span className="text-[10px] font-bold uppercase text-[#483D76]">
                          {format(app.slot.startTime, 'MMM')}
                        </span>
                        <span className="text-base font-bold text-[#221C35]">
                          {format(app.slot.startTime, 'd')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#221C35]">
                          {app.professional.user.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#554E6B]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {dateFormat.format(app.slot.startTime)} ·{' '}
                          {timeFormat.format(app.slot.startTime)} IST
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/appointments"
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3.5 text-xs font-bold text-[#221C35] transition hover:border-[#C8BCE0] hover:text-[#483D76]"
                    >
                      View Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-[#D3CCE2] bg-[#EAE6F0] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5F3F8] text-[#766F8C] shadow-xs">
                    <CalendarDays className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#221C35]">No upcoming sessions</h3>
                    <p className="mt-0.5 text-xs text-[#554E6B]">
                      When you’re ready, explore licensed providers whose approach fits your needs.
                    </p>
                  </div>
                </div>
                <Link
                  href="/therapists"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#483D76] px-4 text-xs font-bold text-[#F5F3F8] transition hover:bg-[#372E5A]"
                >
                  Find a Provider <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </section>

          {/* Right Column: Latest Self-Reflection & Care Habit */}
          <div className="space-y-6">
            {/* Latest Assessment */}
            <section className="rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-6 shadow-xs sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                    Clinical Assessment
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-[#221C35]">Latest Assessment</h2>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBE4F2] text-[#483D76]">
                  <Brain className="h-4 w-4" />
                </span>
              </div>

              {latestAssessment ? (
                <div className="mt-4 rounded-2xl border border-[#D3CCE2] bg-[#EAE6F0] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#221C35]">
                      {assessmentTitle[latestAssessment.type] ?? latestAssessment.type}
                    </p>
                    <span className="rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-2.5 py-1 text-xs font-bold text-[#483D76]">
                      {latestAssessment.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#554E6B]">
                    Completed {format(latestAssessment.createdAt, 'd MMM yyyy')} · Score{' '}
                    {latestAssessment.score}
                  </p>
                  <Link
                    href={`/assessment/result/${latestAssessment.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#483D76] hover:underline"
                  >
                    View Care Report <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-[#D3CCE2] bg-[#EAE6F0] p-4">
                  <p className="text-xs font-semibold text-[#221C35]">
                    A few questions can bring sudden clarity.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#554E6B]">
                    Take a 3-minute assessment anytime to understand your emotional patterns.
                  </p>
                  <Link
                    href="/assessment"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#483D76] hover:underline"
                  >
                    Start an Assessment <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </section>

            {/* Daily Wellbeing Action */}
            <section className="rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-6 shadow-xs sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                    Gentle Care
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-[#221C35]">Daily Wellbeing</h2>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBE4F2] text-[#483D76]">
                  <Heart className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#554E6B]">
                Small mindful moments add up. Log simple daily routines like movement, rest, and
                medication without streak pressure.
              </p>

              {completedCount > 0 ? (
                <Link
                  href="/checkin"
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#483D76] text-xs font-bold text-[#F5F3F8] transition hover:bg-[#372E5A]"
                >
                  Open Daily Check-in <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <p className="mt-4 rounded-xl border border-[#D3CCE2] bg-[#EAE6F0] p-3 text-[11px] leading-relaxed text-[#554E6B]">
                  Daily habits unlock following your first completed session.
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Featured Providers Section */}
        <section className="mt-8 rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                Verified Support
              </span>
              <h2 className="mt-1 text-xl font-bold text-[#221C35]">
                People Who Can Support You
              </h2>
              <p className="mt-1 text-xs text-[#554E6B]">
                Browse sample profiles to find someone whose background and approach feel right.
              </p>
            </div>
            <Link
              href="/therapists"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#483D76] hover:underline"
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
                  className="group flex flex-col justify-between rounded-2xl border border-[#D3CCE2] bg-[#EAE6F0] p-5 transition hover:-translate-y-0.5 hover:border-[#BD6999] hover:bg-[#F5F3F8] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#483D76] text-sm font-bold text-[#F5F3F8] shadow-sm">
                        {initials}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#221C35] group-hover:text-[#483D76]">
                          {person.user.name}
                        </h3>
                        <p className="mt-0.5 text-xs capitalize text-[#554E6B]">
                          {person.type.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 rounded-lg border border-[#C8BCE0] bg-[#EBE4F2] px-2 py-1 text-xs font-bold text-[#483D76]">
                      <Star className="h-3 w-3 fill-[#BD6999] text-[#BD6999]" />
                      {person.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#D3CCE2] pt-3 text-xs">
                    <span className="font-semibold text-[#221C35]">
                      ₹{new Intl.NumberFormat('en-IN').format(person.pricePerSession)} / session
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#483D76]">
                      Book Slot <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {!professionals.length && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#D3CCE2] bg-[#EAE6F0] p-5 text-xs text-[#554E6B]">
              <Compass className="h-5 w-5 text-[#483D76]" />
              The professional directory is updating. Check back shortly.
            </div>
          )}
        </section>

        {/* Emergency Reassurance Footer */}
        <footer className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] p-5 sm:flex-row sm:items-center sm:justify-between text-[#6B3346]">
          <div>
            <p className="text-xs font-bold text-[#6B3346]">Immediate Help in India</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[#6B3346]/90">
              If you or someone you know is in immediate crisis, call{' '}
              <a href="tel:112" className="font-bold underline text-[#BD6999]">
                112
              </a>{' '}
              or Tele-MANAS at{' '}
              <a href="tel:14416" className="font-bold underline text-[#BD6999]">
                14416
              </a>
              . Destiny does not replace clinical emergency care.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E8C8D2] bg-[#FBECEF] px-3 py-1.5 text-xs font-semibold text-[#6B3346]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#6B3346]" /> 24/7 National Helplines
          </span>
        </footer>
      </div>
    </div>
  )
}
