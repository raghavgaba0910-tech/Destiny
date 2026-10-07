'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Heart, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email or professional ID'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormProps = {
  professional: boolean
  registered: boolean
}

const professionalRoles = [
  { value: 'PSYCHIATRIST', label: 'Psychiatrist' },
  { value: 'COUNSELLOR', label: 'Counsellor' },
  { value: 'THERAPIST', label: 'Therapist' },
  { value: 'ADMIN', label: 'Admin' },
]

export default function LoginForm({ professional, registered }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(professional ? 'PSYCHIATRIST' : 'PATIENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0].message)
      return
    }
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        expectedRole: role,
        redirect: false,
      })
      if (result?.error) {
        setError('We couldn’t sign you in with those details. Check your email and password, then try again.')
        return
      }
      router.replace(role === 'PATIENT' ? '/dashboard' : role === 'ADMIN' ? '/admin' : '/pro')
      router.refresh()
    } catch {
      setError('Sign-in is temporarily unavailable. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (professional) {
    return (
      <main className="min-h-screen bg-[#f1f4fb] px-5 py-8 text-slate-900 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <Link href="/professional-register" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo">
            <ArrowLeft className="h-4 w-4" /> Professional application
          </Link>
          <div className="mt-8 grid min-h-[650px] overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_100px_-50px_rgba(35,43,92,.45)] lg:grid-cols-[.9fr_1.1fr]">
            <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#24244b] via-[#34356f] to-[#51439a] p-7 text-white sm:p-10 lg:p-12">
              <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-violet/40 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
              <Link href="/" className="relative inline-flex w-fit items-center gap-2 text-sm font-semibold">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10"><Sparkles className="h-4 w-4 text-teal" /></span>
                Destiny<span className="text-teal">.</span>
              </Link>
              <div className="relative py-12">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-teal"><BriefcaseBusiness className="h-7 w-7" /></span>
                <p className="mt-7 text-[10px] font-bold uppercase tracking-[.18em] text-teal-100">Professional workspace</p>
                <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Welcome to your practice space.</h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/70">Manage your Destiny workspace, appointments, and professional care workflows from one secure place.</p>
              </div>
              <p className="relative text-xs leading-5 text-white/50">Professional access is provided after your application is reviewed and approved.</p>
            </section>

            <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
              <div className="w-full max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-indigo">Professional &amp; admin access</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to Destiny</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Use the credentials for your approved account.</p>
                <div className="mt-6 rounded-2xl border border-indigo/15 bg-indigo/[.04] p-4">
                  <p className="text-xs font-semibold text-indigo">For approved professionals</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600">Enter the Destiny ID (for example, DT00001P) or email address, plus the temporary password sent to your registered email after admin approval. You’ll be asked to change the temporary password at first sign-in.</p>
                </div>
                <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">{role === 'ADMIN' ? 'Admin email address' : 'Destiny ID or registered email'}</Label>
                    <Input id="email" type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={role === 'ADMIN' ? 'admin@example.com' : 'DT00001P or you@example.com'} className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus-visible:ring-violet/20" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-role" className="text-xs font-semibold text-slate-700">Sign in as</Label>
                    <select id="login-role" value={role} onChange={(event) => setRole(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet/20">
                      {professionalRoles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">{role === 'ADMIN' ? 'Password' : 'Password or temporary password'}</Label>
                    <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus-visible:ring-violet/20" required />
                  </div>
                  {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-800">{error}</p>}
                  <Button type="submit" className="h-12 w-full rounded-xl bg-indigo text-sm font-semibold text-white hover:bg-[#393879]" disabled={loading}>{loading ? 'Signing you in…' : <>Continue to workspace <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
                </form>
                <p className="mt-6 text-center text-xs text-slate-500">Not registered yet? <Link href="/professional-register" className="font-semibold text-indigo hover:underline">Submit an application for admin review</Link>.</p>
                <p className="mt-6 border-t border-slate-100 pt-5 text-center text-[10px] leading-5 text-slate-400">If you need urgent support in India, call 112 or Tele-MANAS at 14416.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="grid min-h-screen bg-[#fbfaf8] lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden overflow-hidden bg-[#171a32] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-violet/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
        <Link href="/" className="relative flex w-fit items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[.08]"><Sparkles className="h-5 w-5 text-teal" /></span><span className="text-lg font-semibold">Destiny<span className="text-teal">.</span></span></Link>
        <div className="relative max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-teal-100"><Heart className="h-3.5 w-3.5" /> Your space is here</span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">Welcome back to <span className="text-teal">your pace.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">Pick up where you left off. No rush to have everything figured out — just one small step at a time.</p>
          <div className="mt-10 space-y-4">{['Your check-ins and care reports', 'Appointments and people you’ve explored', 'A private place to notice your progress'].map((text) => <p key={text} className="flex items-center gap-3 text-xs text-white/75"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal/15 text-teal"><Check className="h-3.5 w-3.5" /></span>{text}</p>)}</div>
        </div>
        <p className="relative text-[10px] leading-5 text-white/40">Destiny is not a clinical or emergency service.</p>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-5 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end"><Link href="/for-patients" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-indigo lg:hidden"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link><span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> A private space</span></div>
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/10 text-violet"><Sparkles className="h-5 w-5" /></div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet">Patient portal</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Patient sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue your journey with Destiny.</p>
          {registered && <p role="status" className="mt-5 rounded-xl border border-teal/20 bg-teal/[.06] px-3.5 py-3 text-xs leading-5 text-teal">Your patient account is ready. Sign in to continue.</p>}
          <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-5">
            <div className="space-y-2"><Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email address</Label><Input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus-visible:ring-violet/20" required /></div>
            <div className="space-y-2"><Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus-visible:ring-violet/20" required /></div>
            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-800">{error}</p>}
            <Button type="submit" className="h-12 w-full rounded-xl bg-[#171a32] text-sm font-semibold text-white hover:bg-indigo" disabled={loading}>{loading ? 'Signing you in…' : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          </form>
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-indigo/10 bg-indigo/[.035] p-3.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo" /><p className="text-[10px] leading-5 text-slate-500">Please don’t enter real or sensitive health information.</p></div>
          <p className="mt-7 text-center text-xs text-slate-500">New to Destiny? <Link href="/register" className="font-semibold text-indigo hover:underline">Create your patient account</Link></p>
        </div>
        <p className="pb-2 text-center text-[10px] text-slate-400">If you need urgent support in India, call <a href="tel:112" className="font-semibold underline">112</a> · Tele-MANAS <a href="tel:14416" className="font-semibold underline">14416</a></p>
      </section>
    </main>
  )
}
