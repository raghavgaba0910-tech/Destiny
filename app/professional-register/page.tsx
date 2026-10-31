'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, BadgeCheck, Upload } from 'lucide-react'

const initialForm = { name: '', gender: '', type: 'PSYCHIATRIST', experience: '', email: '', phoneNumber: '' }

export default function ProfessionalRegistrationPage() {
  const [form, setForm] = useState(initialForm)
  const [licenseImage, setLicenseImage] = useState('')
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function onFileChange(file?: File) {
    setError('')
    if (!file) {
      setLicenseImage('')
      setFileName('')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP license image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('License images must be 2 MB or smaller.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLicenseImage(reader.result)
        setFileName(file.name)
      }
    }
    reader.onerror = () => setError('We could not read that image. Choose another file.')
    reader.readAsDataURL(file)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!licenseImage) {
      setError('Upload a valid professional license image.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/professional-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, experience: Number(form.experience), licenseImage }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error || 'We could not submit your application.')
        return
      }
      setMessage('Application submitted for admin review. No account is created until approval. If approved, your Destiny professional ID and temporary password will be sent to your registered email address.')
      setForm(initialForm)
      setLicenseImage('')
      setFileName('')
    } catch {
      setError('Application submission is unavailable. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="min-h-screen bg-[#F5F3F8] px-5 py-10 text-[#221C35]">
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#554E6B] transition hover:text-[#483D76]"><ArrowLeft className="h-4 w-4" /> Back to Destiny</Link>
      <section className="mt-6 rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-sm sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]"><BadgeCheck className="h-6 w-6 text-[#BD6999]" /></div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.16em] text-[#766F8C]">Professional onboarding</p>
        <h1 className="mt-2 text-3xl font-bold text-[#221C35]">Apply to join Destiny</h1>
        <p className="mt-2 text-sm leading-6 text-[#554E6B]">This is an application, not instant account registration. An admin reviews your details and license. If approved, your Destiny ID and temporary password will be emailed to you. Use fictional information for this application.</p>
        <form onSubmit={(event) => void submit(event)} className="mt-7 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#221C35]">Full name<input required maxLength={100} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" /></label>
          <label className="text-sm font-medium text-[#221C35]">Gender<select required value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20"><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label>
          <label className="text-sm font-medium text-[#221C35]">Professional type<select required value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20"><option value="PSYCHIATRIST">Psychiatrist</option><option value="THERAPIST">Therapist</option><option value="COUNSELLOR">Counsellor</option></select></label>
          <label className="text-sm font-medium text-[#221C35]">Years of experience<input required type="number" min={0} max={60} value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" /></label>
          <label className="text-sm font-medium text-[#221C35]">Email address<input required type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" /></label>
          <label className="text-sm font-medium text-[#221C35]">Contact number<input required type="tel" autoComplete="tel" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" /></label>
          <label className="sm:col-span-2 text-sm font-medium text-[#221C35]">Valid professional license image<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onFileChange(event.target.files?.[0])} className="sr-only" /><span className="mt-1 flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#D3CCE2] bg-[#F5F3F8] px-3 text-sm text-[#554E6B] transition hover:border-[#BD6999] hover:bg-white"><Upload className="h-4 w-4 text-[#483D76]" />{fileName || 'Choose an image (JPEG, PNG, WebP · max 2 MB)'}</span></label>
          {message && <p role="status" className="sm:col-span-2 rounded-xl border border-[#C8BCE0] bg-[#EBE4F2] p-3 text-sm text-[#483D76]">{message}</p>}
          {error && <p role="alert" className="sm:col-span-2 rounded-xl border border-[#E8C8D2] bg-[#FBECEF] p-3 text-sm text-[#6B3346]">{error}</p>}
          <button disabled={busy} className="sm:col-span-2 rounded-xl bg-[#483D76] px-4 py-3 font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A] disabled:opacity-50">{busy ? 'Submitting…' : 'Submit for review'}</button>
        </form>
        <p className="mt-5 text-xs text-[#554E6B]">Already approved? <Link href="/professional-login" className="font-semibold text-[#483D76] hover:underline">Sign in to your professional account</Link>.</p>
      </section>
    </div>
  </main>
}
