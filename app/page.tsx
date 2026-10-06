import Link from 'next/link'
import { auth } from '@/auth'
import { ArrowRight, ArrowUpRight, AudioLines, Brain, Check, ChevronDown, CircleHelp, Clock3, Compass, Heart, HeartHandshake, LockKeyhole, MessageCircleHeart, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'

const faqs = [
  ['Is Destiny therapy?', 'No. Destiny helps you explore possible next steps. It cannot diagnose, treat, or replace a qualified clinician.'],
  ['Are the check-ins free?', 'Yes. The check-in flows and care reports are available without charge.'],
  ['Are the professionals real?', 'Provider profiles and appointment availability are illustrative and have not been independently verified.'],
  ['What happens to my information?', 'Information is stored in this app’s configured database. Please do not enter real or sensitive health details.'],
  ['Can I get help in an emergency?', 'If you are in immediate danger in India, call emergency services on 112. Tele-MANAS support is available at 14416.'],
]

const moods = [
  { emoji: '◎', text: 'A little anxious', tone: 'text-indigo' },
  { emoji: '☁', text: 'Feeling low', tone: 'text-violet' },
  { emoji: '✳', text: 'Running on empty', tone: 'text-teal' },
  { emoji: '↗', text: 'Not sure yet', tone: 'text-rose-500' },
]

export default async function HomePage() {
  const session = await auth()
  const homeHref = session?.user?.role === 'ADMIN' ? '/admin' : session?.user?.role === 'PATIENT' ? '/dashboard' : '/pro'
  const startHref = session?.user ? homeHref : '/register'

  return (
    <main className="overflow-hidden bg-[#fbfaf8] text-[#17182a]">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#fbfaf8]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Destiny home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171a32] text-white shadow-sm"><Sparkles className="h-[18px] w-[18px] text-teal" /></span>
            <span className="text-lg font-semibold tracking-tight">Destiny<span className="text-violet">.</span></span>
          </Link>
          <div className="hidden items-center gap-8 text-[13px] font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-violet">How it works</a>
            <a href="#care" className="transition hover:text-violet">Find support</a>
            <a href="#faq" className="transition hover:text-violet">FAQs</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/professional-register" className="inline-flex min-h-10 items-center rounded-xl px-2 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-3 sm:text-xs">For professionals</Link>
            {session?.user ? <Link href={homeHref} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#171a32] px-4 text-xs font-semibold text-white transition hover:bg-indigo">My space <ArrowRight className="h-3.5 w-3.5" /></Link> : <>
              <Link href="/login" className="hidden min-h-10 items-center rounded-xl px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex">Log in</Link>
              <Link href="/register" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#171a32] px-4 text-xs font-semibold text-white transition hover:bg-indigo">Create account <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </>}
          </div>
        </nav>
      </header>

      <section className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_76%_30%,rgba(119,101,221,.13),transparent_38%),radial-gradient(ellipse_at_8%_86%,rgba(32,174,157,.08),transparent_32%)]" />
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-8">
          <div className="max-w-2xl pb-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet/15 bg-white/80 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.15em] text-violet shadow-sm"><span className="h-1.5 w-1.5 rounded-full bg-teal" /> A softer start to feeling better</div>
            <h1 className="mt-7 max-w-[680px] text-[2.7rem] font-semibold leading-[1.08] tracking-[-.045em] text-[#17182a] sm:text-6xl lg:text-[4.25rem]">You don’t have to have it <span className="bg-gradient-to-r from-violet via-indigo to-teal bg-clip-text text-transparent">all figured out.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Start with how you’re feeling. Find a small, clear next step toward support that feels right for you.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={startHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#171a32] px-5 text-sm font-semibold text-white shadow-[0_12px_25px_-14px_rgba(40,40,90,.65)] transition hover:-translate-y-0.5 hover:bg-indigo">Start a free check-in <ArrowRight className="h-4 w-4" /></Link>
              <Link href={session?.user ? '/therapists' : '/login'} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-700 transition hover:border-violet/30 hover:bg-white">{session?.user ? 'Explore professionals' : 'I already have an account'}</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-teal" />Private reflection</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-violet" />About 5 minutes</span>
              <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-rose-400" />No pressure, no judgement</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[550px] lg:ml-auto">
            <div aria-hidden="true" className="absolute -left-7 top-[18%] h-48 w-48 rounded-full bg-violet/20 blur-[75px]" />
            <div aria-hidden="true" className="absolute -right-3 bottom-[8%] h-48 w-48 rounded-full bg-teal/20 blur-[75px]" />
            <div className="relative rounded-[2rem] border border-white/80 bg-gradient-to-br from-violet/70 via-indigo/50 to-teal/50 p-[1px] shadow-[0_35px_90px_-45px_rgba(55,48,110,.5)]">
              <div className="overflow-hidden rounded-[1.95rem] bg-white/95 p-5 sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/10 text-violet"><MessageCircleHeart className="h-4 w-4" /></span><div><p className="text-xs font-semibold text-ink">A moment for you</p><p className="mt-0.5 text-[10px] text-slate-400">Start wherever you are</p></div></div>
                  <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-teal">Your space</span>
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400">How are things feeling lately?</p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {moods.map((mood, index) => <Link key={mood.text} href={startHref} className="group flex min-h-[4.2rem] items-center gap-3 rounded-2xl border border-slate-100 bg-[#fbfaf8] px-3.5 transition hover:border-violet/25 hover:bg-violet/[.035]"><span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xl shadow-sm ${mood.tone}`}>{mood.emoji}</span><span className="text-xs font-medium text-slate-700">{mood.text}</span><ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-300 transition group-hover:text-violet" /></Link>)}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#171a32] p-4 text-white">
                  <div><p className="text-[10px] font-semibold text-white/55">ONE SMALL STEP</p><p className="mt-1 text-sm font-semibold">Let’s find a way forward.</p></div>
                  <Link href={startHref} aria-label="Begin a check-in" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo transition hover:bg-teal-50"><ArrowRight className="h-4 w-4" /></Link>
                </div>
                <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100">
                  {[['01', 'Check in'], ['02', 'Understand'], ['03', 'Connect']].map(([number, label]) => <div key={number} className="px-2 text-center"><span className="text-[9px] font-bold text-violet">{number}</span><p className="mt-1 text-[10px] font-medium text-slate-500">{label}</p></div>)}
                </div>
              </div>
            </div>
            <div className="absolute -left-5 top-[42%] hidden -translate-x-1/2 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[0_16px_35px_-20px_rgba(30,30,60,.35)] sm:block">
              <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/10 text-teal"><ShieldCheck className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold text-ink">A private first step</p><p className="mt-0.5 text-[9px] text-slate-400">At your own pace</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/75">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:grid-cols-3 sm:gap-8 md:px-8">
          {[['Start with yourself', 'No special words needed.'], ['Understand your options', 'Clear, compassionate guidance.'], ['Choose what feels right', 'Take each step in your own time.']].map(([title, copy], index) => <div key={title} className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${index === 1 ? 'bg-teal/10 text-teal' : 'bg-violet/10 text-violet'}`}>{index === 0 ? <Heart className="h-4 w-4" /> : index === 1 ? <Compass className="h-4 w-4" /> : <Check className="h-4 w-4" />}</span><div><p className="text-xs font-semibold text-ink">{title}</p><p className="mt-1 text-[10px] text-slate-500">{copy}</p></div></div>)}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-violet">A simple path forward</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">One step at a time.<br />That’s enough.</h2></div><p className="max-w-xl text-sm leading-7 text-slate-500">Whether you know exactly what you need or are just beginning to wonder, Destiny helps make the next step feel a little clearer.</p></div>
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
          { number: '01', icon: Brain, title: 'Check in', copy: 'Answer a few guided questions in your own time.' },
          { number: '02', icon: Sparkles, title: 'Get a care report', copy: 'See your responses in straightforward, human language.' },
          { number: '03', icon: HeartHandshake, title: 'Explore support', copy: 'Browse sample profiles and appointment times.' },
          { number: '04', icon: AudioLines, title: 'Keep noticing', copy: 'Use gentle daily check-ins to reflect on your routines.' },
        ].map(({ number, icon: Icon, title, copy }) => <article key={number} className="group rounded-[1.5rem] border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-violet/25 hover:shadow-[0_18px_40px_-28px_rgba(60,50,120,.3)]"><div className="flex items-center justify-between"><span className="text-[10px] font-bold tracking-[.15em] text-slate-400">{number} / 04</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/[.07] text-violet transition group-hover:bg-violet group-hover:text-white"><Icon className="h-4 w-4" /></span></div><h3 className="mt-5 text-base font-semibold text-ink">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{copy}</p></article>)}</div>
      </section>

      <section id="care" className="bg-[#f1f0fa]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-indigo">Different kinds of care</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Who might I talk to?</h2><p className="mt-3 text-sm leading-7 text-slate-600">There isn’t one right answer. Here’s a simple overview to help you get oriented.</p></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{[
            { title: 'Counsellor', icon: MessageCircleHeart, label: 'Talk it through', copy: 'A supportive space for life changes, relationships, everyday stress, and making sense of how you feel.', href: '/counsellors', tint: 'bg-teal/10 text-teal' },
            { title: 'Therapist', icon: HeartHandshake, label: 'Build new tools', copy: 'Structured conversations to explore patterns, practise coping skills, and work toward your goals.', href: '/therapists', tint: 'bg-violet/10 text-violet' },
            { title: 'Psychiatrist', icon: Stethoscope, label: 'Medical perspective', copy: 'A medical professional who can assess mental health and discuss clinical treatment options.', href: '/therapists', tint: 'bg-indigo/10 text-indigo' },
          ].map(({ title, icon: Icon, label, copy, href, tint }) => <article key={title} className="flex flex-col rounded-[1.5rem] border border-white/90 bg-white p-6 shadow-[0_14px_45px_-35px_rgba(30,30,70,.35)]"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{label}</p><h3 className="mt-1.5 text-lg font-semibold text-ink">{title}</h3><p className="mt-2 flex-1 text-xs leading-6 text-slate-500">{copy}</p><Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo hover:underline">Explore sample profiles <ArrowRight className="h-3.5 w-3.5" /></Link></article>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#171a32] px-6 py-9 text-white sm:px-10 sm:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-40 h-80 w-80 rounded-full bg-violet/30 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-[28%] h-40 w-40 rounded-full bg-teal/20 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-teal"><ShieldCheck className="h-5 w-5" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-teal">Built around your comfort</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your story. Your pace. Your choice.</h2><p className="mt-3 text-sm leading-7 text-white/60">This prototype is a place to explore how a care journey might work. Your check-in should never feel like a test you have to pass.</p></div>
            <div className="space-y-3 text-xs text-white/75">{['No recordings or session transcripts', 'You choose when to take the next step', 'Screening is not a diagnosis'].map((item) => <p key={item} className="flex items-center gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal/15 text-teal"><Check className="h-3 w-3" /></span>{item}</p>)}</div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-[.7fr_1.3fr] md:px-8 md:py-24">
          <div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-violet">A few useful things</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Questions, answered.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Clear answers about the care and tools available here.</p><span className="mt-6 inline-flex items-center gap-2 text-xs text-slate-400"><CircleHelp className="h-4 w-4" /> We’re here to make things clearer.</span></div>
          <div className="divide-y divide-slate-100">{faqs.map(([question, answer]) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">{question}<ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><p className="max-w-2xl pr-8 pt-3 text-xs leading-6 text-slate-500">{answer}</p></details>)}</div>
        </div>
      </section>

      <footer className="bg-[#f4f1ee]">
        <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
          <div className="flex flex-col gap-5 rounded-[1.5rem] border border-rose-200/70 bg-rose-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-semibold text-rose-950">Need immediate support in India?</p><p className="mt-1 text-xs leading-5 text-rose-950/70">Call emergency services <a href="tel:112" className="font-bold underline">112</a> or contact Tele-MANAS at <a href="tel:14416" className="font-bold underline">14416</a>.</p><p className="mt-1 text-[10px] text-rose-950/55">Destiny does not replace emergency care.</p></div>
            <Link href={startHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#171a32] px-4 text-xs font-semibold text-white transition hover:bg-indigo">Take a small first step <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171a32] text-white"><Sparkles className="h-3.5 w-3.5 text-teal" /></span> Destiny.</Link><p className="text-[10px] leading-5 text-slate-500">Provider profiles are illustrative and not verified. Destiny is not a clinical service. Please do not enter real health information.</p><div className="flex gap-4 text-[10px] font-medium text-slate-500"><Link href="/login" className="hover:text-indigo">Log in</Link><Link href="/register" className="hover:text-indigo">Create account</Link></div></div>
        </div>
      </footer>
    </main>
  )
}
