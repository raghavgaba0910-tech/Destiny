'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Check, Heart, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        redirect: false,
      })
      if (result?.error) {
        setError('We couldn’t sign you in with those details. Check your email and password, then try again.')
        return
      }
      router.replace('/dashboard')
      router.refresh()
    } catch {
      setError('Sign-in is temporarily unavailable. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#fbfaf8] lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden overflow-hidden bg-[#171a32] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-violet/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
        <Link href="/" className="relative flex w-fit items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[.08]"><Sparkles className="h-5 w-5 text-teal" /></span><span className="text-lg font-semibold">destiny<span className="text-teal">.</span></span></Link>
        <div className="relative max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-teal-100"><Heart className="h-3.5 w-3.5" /> Your space is here</span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">Welcome back to <span className="text-teal">your pace.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">Pick up where you left off. No rush to have everything figured out — just one small step at a time.</p>
          <div className="mt-10 space-y-4">{['Your check-ins and care reports', 'Appointments and people you’ve explored', 'A private place to notice your progress'].map((text) => <p key={text} className="flex items-center gap-3 text-xs text-white/75"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal/15 text-teal"><Check className="h-3.5 w-3.5" /></span>{text}</p>)}</div>
        </div>
        <p className="relative text-[10px] leading-5 text-white/40">Destiny is a demonstration MVP, not a clinical or emergency service.</p>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-5 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end"><Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-indigo lg:hidden"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link><span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> A demo, private space</span></div>
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/10 text-violet"><Sparkles className="h-5 w-5" /></div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet">Your space is waiting</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue your journey with Destiny.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2"><Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email address</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus-visible:ring-violet/20" required /></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label></div><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus-visible:ring-violet/20" required /></div>
            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-800">{error}</p>}
            <Button type="submit" className="h-12 w-full rounded-xl bg-[#171a32] text-sm font-semibold text-white hover:bg-indigo" disabled={loading}>{loading ? 'Signing you in…' : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          </form>
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-indigo/10 bg-indigo/[.035] p-3.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo" /><p className="text-[10px] leading-5 text-slate-500">This MVP is for demonstration only. Please don’t enter real or sensitive health information.</p></div>
          <p className="mt-7 text-center text-xs text-slate-500">New to Destiny? <Link href="/register" className="font-semibold text-indigo hover:underline">Create your free account</Link></p>
        </div>
        <p className="pb-2 text-center text-[10px] text-slate-400">If you need urgent support in India, call <a href="tel:112" className="font-semibold underline">112</a> · Tele-MANAS <a href="tel:14416" className="font-semibold underline">14416</a></p>
      </section>
    </main>
  )
}
