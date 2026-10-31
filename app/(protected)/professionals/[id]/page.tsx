import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, BriefcaseBusiness, CalendarDays, Clock3, Globe2, HeartHandshake, ShieldCheck, Star, Video } from 'lucide-react'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { BookingSection } from '@/components/destiny/BookingSection'
import { GradientAvatar } from '@/components/destiny/GradientAvatar'

const priceFormat = new Intl.NumberFormat('en-IN')

export default async function ProfessionalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const professional = await db.professional.findFirst({ where: { id, isApproved: true }, include: { user: { select: { name: true } } } })
  if (!professional) notFound()
  const latestAssessment = session?.user?.role === 'PATIENT'
    ? await db.assessment.findFirst({ where: { userId: session.user.id }, select: { id: true } })
    : null

  const typeLabel = professional.type === 'PSYCHIATRIST' ? 'Psychiatrist' : professional.type === 'THERAPIST' ? 'Therapist' : 'Counsellor'

  return (
    <main className="min-h-screen bg-[#F5F3F8] text-[#221C35]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#19152B] via-[#2A214C] to-[#372E5A] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-36 h-96 w-96 rounded-full bg-[#BD6999]/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-1/3 h-80 w-80 rounded-full bg-[#483D76]/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-8 md:px-8 md:pb-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#D5CEEC]/70">
            <Link href="/dashboard" className="transition hover:text-white">Your space</Link><span aria-hidden="true">/</span>
            <Link href={professional.type === 'COUNSELLOR' ? '/counsellors' : '/therapists'} className="transition hover:text-white">{professional.type === 'COUNSELLOR' ? 'Counsellors' : 'Therapists'}</Link><span aria-hidden="true">/</span>
            <span className="text-white font-medium">{professional.user.name}</span>
          </nav>
          <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="rounded-full bg-white p-1.5 shadow-xl shadow-black/10"><GradientAvatar name={professional.user.name} size="lg" /></div>
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#D5CEEC]">{typeLabel}</span>
                <span className="rounded-full border border-white/15 bg-white/[.07] px-3 py-1 text-[10px] font-medium text-white/80">Tier {professional.tier === 'A' ? '1' : professional.tier === 'B' ? '2' : '3'}</span>
                <span className="rounded-full border border-white/15 bg-white/[.07] px-3 py-1 text-[10px] font-medium text-[#D5CEEC]/70">{professional.professionalCode}</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{professional.user.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#D5CEEC]/80 md:text-base">{professional.specialties.slice(0, 3).join(' · ')}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#D5CEEC]">
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-[#BD6999] text-[#BD6999]" />{professional.rating.toFixed(1)} rating</span>
                <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4 text-[#BD6999]" />{professional.experience} years experience</span>
                <span className="inline-flex items-center gap-1.5"><Video className="h-4 w-4 text-[#BD6999]" />Online sessions</span>
              </div>
            </div>
          </div>
          <div className="mt-9 grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><Globe2 className="h-4 w-4 text-[#BD6999]" /><p className="mt-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#D5CEEC]/60">Languages</p><p className="mt-1 text-sm font-medium text-white">{professional.languages.join(', ')}</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><CalendarDays className="h-4 w-4 text-[#BD6999]" /><p className="mt-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#D5CEEC]/60">Availability</p><p className="mt-1 text-sm font-medium text-white">Weekday appointments</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><Clock3 className="h-4 w-4 text-[#BD6999]" /><p className="mt-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#D5CEEC]/60">Session length</p><p className="mt-1 text-sm font-medium text-white">50 minutes</p></div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl items-start gap-6 px-5 pb-16 pt-7 md:px-8 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-8">
        <div className="space-y-5">
          <section className="rounded-[1.65rem] border border-[#D3CCE2] bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]"><HeartHandshake className="h-5 w-5 text-[#BD6999]" /></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#766F8C]">A little about their approach</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#221C35]">A space to feel heard</h2></div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#554E6B]">{professional.bio}</p>
          </section>

          <section className="rounded-[1.65rem] border border-[#D3CCE2] bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]"><BadgeCheck className="h-5 w-5 text-[#BD6999]" /></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#766F8C]">Care that meets you where you are</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#221C35]">Areas of support</h2></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">{professional.specialties.map((specialty) => <span key={specialty} className="rounded-full border border-[#D3CCE2] bg-[#F5F3F8] px-3.5 py-2 text-xs font-medium text-[#554E6B]">{specialty}</span>)}</div>
          </section>

          <section className="rounded-[1.65rem] border border-[#D3CCE2] bg-[#EAE6F0] p-5 sm:p-6">
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#483D76]" /><div><h2 className="text-sm font-semibold text-[#221C35]">Please note</h2><p className="mt-1 text-xs leading-5 text-[#554E6B]">Destiny does not provide emergency care or replace a qualified professional.</p></div></div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6">
          {session?.user?.role === 'PATIENT'
            ? <BookingSection professionalId={professional.id} professionalName={professional.user.name} patientName={session.user.name} hasAssessment={Boolean(latestAssessment)} pricePerSession={professional.pricePerSession} />
            : <div className="rounded-2xl border border-[#D3CCE2] bg-white p-5 text-sm leading-6 text-[#554E6B]">Appointments can be booked from a client account.</div>}
          <p className="mt-3 text-center text-[10px] leading-4 text-[#766F8C]">Session fee: ₹{priceFormat.format(professional.pricePerSession)}. Payment is not collected here.</p>
        </aside>
      </div>
    </main>
  )
}
