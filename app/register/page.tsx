'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Check, Heart, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters').regex(/[A-Z]/, 'Add at least one uppercase letter').regex(/[0-9]/, 'Add at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: 'The passwords don’t match', path: ['confirmPassword'] })

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setServerError('')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setServerError('')
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      parsed.error.errors.forEach((item) => {
        if (item.path[0]) nextErrors[String(item.path[0])] = item.message
      })
      setErrors(nextErrors)
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: parsed.data.name, email: parsed.data.email, password: parsed.data.password }),
      })
      const body = await response.json()
      if (!response.ok) {
        setServerError(body.error || 'We couldn’t create your account. Please try again.')
        return
      }
      router.push('/login?registered=true')
    } catch {
      setServerError('Account creation is temporarily unavailable. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields: { id: keyof typeof form; label: string; type: string; placeholder: string; autoComplete: string }[] = [
    { id: 'name', label: 'Your name', type: 'text', placeholder: 'How should we address you?', autoComplete: 'name' },
    { id: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { id: 'password', label: 'Create a password', type: 'password', placeholder: 'At least 8 characters', autoComplete: 'new-password' },
    { id: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: 'Type it once more', autoComplete: 'new-password' },
  ]

  return (
    <main className="grid min-h-screen bg-[#fbfaf8] lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden overflow-hidden bg-[#171a32] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-violet/30 blur-3xl" />
        <Link href="/" className="relative flex w-fit items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[.08]"><Sparkles className="h-5 w-5 text-teal" /></span><span className="text-lg font-semibold">destiny<span className="text-teal">.</span></span></Link>
        <div className="relative max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-teal-100"><Heart className="h-3.5 w-3.5" /> A softer place to begin</span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">A little space to <span className="text-teal">start again.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">Make an account to save your check-ins, revisit your care report, and explore next steps whenever it feels right.</p>
          <div className="mt-9 grid grid-cols-2 gap-3">{[['01', 'Check in privately'], ['02', 'Understand your options'], ['03', 'Explore sample providers'], ['04', 'Go at your pace']].map(([number, text]) => <div key={number} className="rounded-2xl border border-white/10 bg-white/[.05] p-3"><span className="text-[9px] font-bold text-teal">{number}</span><p className="mt-1.5 text-[11px] font-medium text-white/75">{text}</p></div>)}</div>
        </div>
        <p className="relative text-[10px] leading-5 text-white/40">MVP demo only. Not a clinical, pharmacy, or emergency service.</p>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-5 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end"><Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-indigo lg:hidden"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link><span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> Your account, your space</span></div>
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-10">
          <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal"><Sparkles className="h-5 w-5" /></div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal">Begin when you’re ready</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Create your account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Just a few details to make this space yours.</p>
          <form onSubmit={(event) => void handleSubmit(event)} className="mt-7 space-y-4">
            {fields.map((field) => <div key={field.id} className="space-y-2"><Label htmlFor={field.id} className="text-xs font-semibold text-slate-700">{field.label}</Label><Input id={field.id} type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} value={form[field.id]} onChange={(event) => setField(field.id, event.target.value)} aria-invalid={Boolean(errors[field.id])} aria-describedby={errors[field.id] ? `${field.id}-error` : undefined} className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus-visible:ring-violet/20" required />{errors[field.id] && <p id={`${field.id}-error`} className="text-xs text-rose-700">{errors[field.id]}</p>}</div>)}
            {serverError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-800">{serverError}</p>}
            <Button type="submit" className="h-12 w-full rounded-xl bg-[#171a32] text-sm font-semibold text-white hover:bg-indigo" disabled={loading}>{loading ? 'Creating your account…' : <>Create your account <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          </form>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-teal/15 bg-teal/[.04] p-3.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" /><p className="text-[10px] leading-5 text-slate-500">Use this MVP with demo information only. Do not enter sensitive health details.</p></div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Check className="h-3.5 w-3.5 text-teal" /> Already have an account? <Link href="/login" className="font-semibold text-indigo hover:underline">Sign in</Link></div>
        </div>
        <p className="pb-2 text-center text-[10px] text-slate-400">Need urgent support in India? Call <a href="tel:112" className="font-semibold underline">112</a> · Tele-MANAS <a href="tel:14416" className="font-semibold underline">14416</a></p>
      </section>
    </main>
  )
}
