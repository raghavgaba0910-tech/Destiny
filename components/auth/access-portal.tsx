import Link from 'next/link'
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Sparkles, UserRound } from 'lucide-react'

type AccessPortalProps = {
  audience: 'patient' | 'professional'
}

const portalContent = {
  patient: {
    eyebrow: 'Patient portal',
    title: 'Your next step starts here.',
    description: 'Sign in to return to your space, or create a patient account to save check-ins and revisit your care journey.',
    icon: UserRound,
    actions: [
      {
        title: 'Patient sign in',
        description: 'Continue to your check-ins, appointments, and saved reports.',
        label: 'Sign in',
        href: '/login',
      },
      {
        title: 'Create a patient account',
        description: 'Get started with a free account and make this space your own.',
        label: 'Create account',
        href: '/register',
      },
    ],
  },
  professional: {
    eyebrow: 'Professional portal',
    title: 'A dedicated space for your work.',
    description: 'Professional access starts with an application. An admin reviews it, and approved professionals receive their Destiny ID and temporary password by email.',
    icon: BriefcaseBusiness,
    actions: [
      {
        title: 'Professional & admin sign in',
        description: 'Approved professionals sign in with the Destiny ID or registered email and temporary password sent after approval. Admins can also sign in here.',
        label: 'Sign in',
        href: '/professional-login',
      },
      {
        title: 'Professional application',
        description: 'Submit your details and license for admin review. This is an application, not instant account creation.',
        label: 'Apply to join',
        href: '/professional-register',
      },
    ],
  },
} satisfies Record<string, {
  eyebrow: string
  title: string
  description: string
  icon: typeof UserRound
  actions: { title: string; description: string; label: string; href: string }[]
}>

export default function AccessPortal({ audience }: AccessPortalProps) {
  const content = portalContent[audience]
  const Icon = content.icon

  return (
    <main className="min-h-screen bg-[#fbfaf8] px-5 py-8 text-[#17182a] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo">
          <ArrowLeft className="h-4 w-4" /> Back to Destiny
        </Link>
        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_-48px_rgba(23,26,50,.32)]">
          <div className="bg-[#171a32] px-6 py-9 text-white sm:px-10 sm:py-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><Sparkles className="h-4 w-4 text-teal" /></span>
              Destiny<span className="text-teal">.</span>
            </Link>
            <div className="mt-10 flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal"><Icon className="h-6 w-6" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-teal">{content.eyebrow}</p>
                <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{content.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">{content.description}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
            {content.actions.map((action) => (
              <Link key={action.href} href={action.href} className="group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-[#fbfaf8] p-5 transition hover:-translate-y-0.5 hover:border-violet/30 hover:bg-white hover:shadow-lg sm:p-6">
                <h2 className="text-lg font-semibold tracking-tight">{action.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-indigo">
                  {action.label}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
          <p className="px-6 pb-6 text-center text-[10px] leading-5 text-slate-400 sm:px-8">Destiny is not a clinical or emergency service. If you need urgent support in India, call 112 or Tele-MANAS at 14416.</p>
        </section>
      </div>
    </main>
  )
}
