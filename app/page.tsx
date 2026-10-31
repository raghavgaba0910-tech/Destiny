import Link from 'next/link'
import { auth } from '@/auth'
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { HomeInteractiveCare } from '@/components/destiny/HomeInteractiveCare'

const faqs = [
  {
    q: 'Is Destiny online therapy or emergency care?',
    a: 'Destiny is an exploration and support platform designed to make mental wellbeing approachable. It helps you reflect on your feelings, understand your options, and schedule sessions with professionals. Destiny is not a replacement for emergency clinical care. In an emergency in India, call 112 or Tele-MANAS at 14416.',
  },
  {
    q: 'Are the self-assessments free to take?',
    a: 'Yes. All self-reflection assessments (for mood, anxiety, stress, and lifestyle) and their accompanying care reports are completely free and can be taken at your own pace.',
  },
  {
    q: 'How does Destiny protect my privacy?',
    a: 'Your self-reflections are stored securely on your account. Sessions do not record video or audio transcripts. You have full control over whether your assessment report is shared with a professional prior to a session.',
  },
  {
    q: 'What is the difference between a counsellor, therapist, and psychiatrist?',
    a: 'A counsellor provides empathetic guidance for life transitions, relationships, and everyday stress. A therapist provides structured, evidence-based coping tools to change behavioral or thought patterns. A psychiatrist is a medical doctor who can provide clinical evaluations and medication management.',
  },
  {
    q: 'How does appointment booking work?',
    a: 'You can explore verified sample clinician profiles, review their specialties, languages, and session fees, and select an available weekday slot that fits your schedule.',
  },
]

export default async function HomePage() {
  const session = await auth()
  const homeHref =
    session?.user?.role === 'ADMIN'
      ? '/admin'
      : session?.user?.role === 'PATIENT'
      ? '/dashboard'
      : '/pro'
  const isLoggedIn = !!session?.user
  const startHref = isLoggedIn ? homeHref : '/for-patients'

  return (
    <div className="min-h-screen bg-[#F5F3F8] text-[#221C35]">
      {/* Header */}
      <PublicHeader isLoggedIn={isLoggedIn} homeHref={homeHref} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24">
        {/* Soothing background auras */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(72,61,118,0.12)_0%,rgba(34,28,53,0.06)_40%,transparent_70%)]"
        />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* Left Column: Reassuring Hero Pitch */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-4 py-1.5 text-xs font-semibold text-[#483D76] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#483D76] animate-pulse" />
                A softer, clearer start to feeling better
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#221C35] sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                You don’t have to carry it{' '}
                <span className="text-[#BD6999]">all figured </span>
                <span className="text-[#483D76]">out.</span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-[#554E6B] sm:text-lg sm:leading-8">
                A calm, private space designed for young adults. Start with how you’re feeling
                today — get a human-language care report, gentle daily routines, and connect with
                licensed professionals at your own pace.
              </p>

              {/* Primary Actions */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Link
                  href={startHref}
                  className="inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-[#483D76] px-6 text-sm font-bold text-[#F5F3F8] shadow-lg shadow-[#483D76]/15 transition hover:-translate-y-0.5 hover:bg-[#372E5A]"
                >
                  Take a Free Assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={isLoggedIn ? '/therapists' : '/for-patients'}
                  className="inline-flex h-13 items-center justify-center rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] px-6 text-sm font-semibold text-[#221C35] shadow-sm transition hover:border-[#C8BCE0] hover:bg-[#EAE6F0]"
                >
                  Explore Support Providers
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#D3CCE2] pt-6 text-xs text-[#766F8C]">
                <span className="inline-flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-[#483D76]" /> 100% Private reflection
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#483D76]" /> Takes under 5 minutes
                </span>
                <span className="inline-flex items-center gap-2">
                  <Heart className="h-4 w-4 text-[#BD6999]" /> No pressure or judgment
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Mood & Care Selector */}
            <div className="w-full">
              <HomeInteractiveCare isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Path Forward Section */}
      <section id="how-it-works" className="border-t border-[#D3CCE2] bg-[#F5F3F8] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
              A clear, predictable journey
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#221C35] sm:text-4xl">
              One gentle step at a time.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#554E6B]">
              Navigating mental health can feel confusing. We made the steps straightforward,
              accessible, and always in your control.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="group rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#483D76] hover:bg-[#EAE6F0] hover:shadow-xl hover:shadow-[#221C35]/5">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]">
                  <Brain className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold text-[#766F8C]">01</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#221C35]">1. Clinical Assessment</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#554E6B]">
                Answer a few short, guided questions tailored to what you are experiencing — whether
                it’s mood, anxiety, or stress. No time limits, no judgment.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#483D76]">
                <Check className="h-4 w-4" /> Based on clinically recognized screening
              </div>
            </div>

            {/* Step 2 */}
            <div className="group rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#483D76] hover:bg-[#EAE6F0] hover:shadow-xl hover:shadow-[#221C35]/5">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]">
                  <Sparkles className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold text-[#766F8C]">02</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#221C35]">2. Clear Care Report</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#554E6B]">
                Receive an immediate summary written in plain, human language. See what patterns
                might be affecting you and what kind of support is recommended.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#483D76]">
                <Check className="h-4 w-4" /> Downloadable and easy to review
              </div>
            </div>

            {/* Step 3 */}
            <div className="group rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#483D76] hover:bg-[#EAE6F0] hover:shadow-xl hover:shadow-[#221C35]/5">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]">
                  <HeartHandshake className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold text-[#766F8C]">03</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-[#221C35]">3. Connect When Ready</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#554E6B]">
                If and when you want to speak with someone, browse accredited counsellors,
                therapists, or psychiatrists. Choose someone whose style fits your needs.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#483D76]">
                <Check className="h-4 w-4" /> Transparent pricing &amp; verified profiles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Might I Talk To Section */}
      <section id="care-options" className="border-t border-[#D3CCE2] bg-[#EAE6F0] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
              Understanding your options
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#221C35] sm:text-4xl">
              Who might you talk to?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#554E6B]">
              There is no single path for everyone. Here is an easy-to-understand breakdown of the
              different mental health professionals available on Destiny.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Counsellor Card */}
            <article className="flex flex-col rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-7 shadow-sm transition hover:border-[#483D76] hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]">
                <MessageCircleHeart className="h-6 w-6" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                Talk it through
              </p>
              <h3 className="mt-1 text-2xl font-bold text-[#221C35]">Counsellor</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#554E6B]">
                A warm, compassionate sounding board. Ideal for navigating relationship challenges,
                career stress, family expectations, and everyday emotional crossroads.
              </p>
              <div className="my-6 border-t border-[#D3CCE2] pt-4 text-xs text-[#554E6B]">
                <p className="font-semibold text-[#221C35]">Best suited for:</p>
                <p className="mt-1">Everyday stress · Burnout · Life transitions</p>
              </div>
              <Link
                href={isLoggedIn ? '/counsellors' : '/counsellors'}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#483D76] transition hover:text-[#372E5A]"
              >
                Explore Counsellors <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            {/* Therapist Card */}
            <article className="flex flex-col rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-7 shadow-sm transition hover:border-[#483D76] hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]">
                <HeartHandshake className="h-6 w-6" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                Build new tools
              </p>
              <h3 className="mt-1 text-2xl font-bold text-[#221C35]">Therapist</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#554E6B]">
                Structured conversations using proven methodologies (such as CBT or mindfulness).
                Helps you understand deep-seated patterns, manage recurring anxiety, and develop lasting coping mechanisms.
              </p>
              <div className="my-6 border-t border-[#D3CCE2] pt-4 text-xs text-[#554E6B]">
                <p className="font-semibold text-[#221C35]">Best suited for:</p>
                <p className="mt-1">Recurring anxiety · Low mood · Behavioral habits</p>
              </div>
              <Link
                href={isLoggedIn ? '/therapists' : '/therapists'}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#483D76] transition hover:text-[#372E5A]"
              >
                Explore Therapists <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            {/* Psychiatrist Card */}
            <article className="flex flex-col rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-7 shadow-sm transition hover:border-[#483D76] hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]">
                <Stethoscope className="h-6 w-6" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                Medical perspective
              </p>
              <h3 className="mt-1 text-2xl font-bold text-[#221C35]">Psychiatrist</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#554E6B]">
                A licensed medical doctor specializing in mental health. They can evaluate clinical
                symptoms, discuss physiological factors, and provide clinical diagnosis or medication guidance when appropriate.
              </p>
              <div className="my-6 border-t border-[#D3CCE2] pt-4 text-xs text-[#554E6B]">
                <p className="font-semibold text-[#221C35]">Best suited for:</p>
                <p className="mt-1">Clinical assessments · Medical care plans · Complex symptoms</p>
              </div>
              <Link
                href={isLoggedIn ? '/therapists' : '/therapists'}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#483D76] transition hover:text-[#372E5A]"
              >
                Explore Psychiatrists <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Clinical Self-Assessments Feature Grid */}
      <section id="assessments" className="border-t border-[#D3CCE2] bg-[#F5F3F8] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                Private &amp; self-paced
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#221C35] sm:text-4xl">
                Clinical Self-Assessments
              </h2>
              <p className="mt-3 text-base text-[#554E6B]">
                Select an area for your self-assessment. Takes 3–5 minutes.
              </p>
            </div>
            <Link
              href={startHref}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#483D76] px-5 text-xs font-bold text-[#F5F3F8] transition hover:bg-[#372E5A]"
            >
              Explore All Assessments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Low Mood & Energy',
                desc: 'Reflect on energy levels, sleep patterns, and pleasure in everyday activities.',
                time: '4 mins',
                type: 'depression',
                badge: 'PHQ-9 screening',
              },
              {
                title: 'Anxiety & Worry',
                desc: 'Assess restlessness, racing thoughts, and feelings of nervousness or panic.',
                time: '3 mins',
                type: 'anxiety',
                badge: 'GAD-7 screening',
              },
              {
                title: 'Stress & Burnout',
                desc: 'Understand academic, workplace, or relationship pressures and recovery capacity.',
                time: '5 mins',
                type: 'stress',
                badge: 'Stress index',
              },
              {
                title: 'Habit & Substance Use',
                desc: 'Evaluate habits, alcohol, or substance reliance with compassionate objectivity.',
                time: '3 mins',
                type: 'substance',
                badge: 'Awareness reflection',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-3xl border border-[#D3CCE2] bg-[#F5F3F8] p-6 transition hover:border-[#483D76] hover:bg-[#EAE6F0] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#766F8C]">
                    <span className="rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-2.5 py-1 font-semibold text-[#483D76] shadow-xs">
                      {item.badge}
                    </span>
                    <span>{item.time}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#221C35]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#554E6B]">{item.desc}</p>
                </div>
                <Link
                  href={isLoggedIn ? `/assessment/${item.type}` : '/for-patients'}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#483D76] hover:text-[#372E5A]"
                >
                  Start Assessment <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Peace of Mind Banner */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#19152B] to-[#2A214C] px-7 py-12 text-[#F5F3F8] shadow-xl sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#BD6999]/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#483D76]/30 blur-3xl"
            />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#C8BCE0]/30 bg-[#483D76]/30 px-3.5 py-1.5 text-xs font-semibold text-[#EBE4F2]">
                  <ShieldCheck className="h-4 w-4 text-[#EBE4F2]" /> Built around your comfort &amp; dignity
                </div>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#F5F3F8] sm:text-4xl">
                  Your story. Your comfort. Always your choice.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#D5CEEC] sm:text-base">
                  Mental health support should never feel intrusive or overwhelming. You are always
                  in the driver’s seat of your information, your pacing, and whom you choose to speak with.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/[0.16] bg-white/[0.08] p-6 backdrop-blur-sm text-sm text-[#F5F3F8]">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#483D76]/50 text-[#EBE4F2]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>Zero audio or video recordings stored from your sessions.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#483D76]/50 text-[#EBE4F2]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>You decide whether to share assessment notes with your provider.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#483D76]/50 text-[#EBE4F2]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>Screenings offer reflection points, never a mandatory label.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="border-t border-[#D3CCE2] bg-[#F5F3F8] py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#766F8C]">
              Clear &amp; straightforward
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#221C35] sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-[#554E6B]">
              Clear, compassionate answers to help you feel completely informed.
            </p>
          </div>

          <div className="mt-12 divide-y divide-[#D3CCE2] rounded-3xl border border-[#D3CCE2] bg-[#EAE6F0] p-6 sm:p-8">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-5 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-[#221C35] [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#766F8C] transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#554E6B]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Calming Emergency Footer & Legal Bar */}
      <footer className="border-t border-[#D3CCE2] bg-[#EAE6F0]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-6 rounded-3xl border border-[#E8C8D2] bg-[#FBECEF] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 text-[#6B3346]">
            <div>
              <p className="text-sm font-bold text-[#6B3346]">
                Need immediate emergency support in India?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B3346]/90">
                If you are in distress or experiencing thoughts of harm, call National Emergency{' '}
                <a href="tel:112" className="font-bold underline text-[#BD6999]">
                  112
                </a>{' '}
                or Tele-MANAS at{' '}
                <a href="tel:14416" className="font-bold underline text-[#BD6999]">
                  14416
                </a>{' '}
                (toll-free, available 24/7 in multiple languages).
              </p>
            </div>
            <Link
              href={startHref}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#483D76] px-5 text-xs font-bold text-[#F5F3F8] transition hover:bg-[#372E5A]"
            >
              Take a Gentle Step <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-[#D3CCE2] pt-8 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#221C35] text-[#BD6999]">
                <Sparkles className="h-4 w-4 text-[#BD6999]" />
              </span>
              <div>
                <span className="text-base font-bold text-[#221C35]">
                  Destiny<span className="text-[#BD6999]">.</span>
                </span>
                <span className="block text-[11px] text-[#766F8C]">Care on your terms</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#554E6B]">
              <Link href="/for-patients" className="transition hover:text-[#483D76]">
                For Clients
              </Link>
              <Link href="/for-professionals" className="transition hover:text-[#483D76]">
                For Professionals
              </Link>
              <Link href="/login" className="transition hover:text-[#483D76]">
                Client Sign In
              </Link>
              <Link href="/professional-login" className="transition hover:text-[#483D76]">
                Professional Sign In
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-[#766F8C]">
            Destiny is a supportive exploration prototype. Provider profiles are illustrative and
            not verified clinicians. Do not enter real or sensitive health information.
          </p>
        </div>
      </footer>
    </div>
  )
}
