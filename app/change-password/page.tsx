'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error || 'Could not change the password.')
        return
      }
      await signOut({ redirect: false })
      router.replace('/login?passwordChanged=true')
      router.refresh()
    } catch {
      setError('Could not change your password. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#F5F3F8] px-5 py-10 text-[#221C35]">
    <form onSubmit={(event) => void submit(event)} className="w-full max-w-md rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#766F8C]">Account security</p>
      <h1 className="mt-2 text-2xl font-bold text-[#221C35]">Change your temporary password</h1>
      <p className="mt-2 text-sm leading-6 text-[#554E6B]">Choose a new password before entering your professional workspace.</p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-[#221C35]">Temporary password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" /></label>
        <label className="block text-sm font-medium text-[#221C35]">New password<input required type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" /><span className="mt-1 block text-xs text-[#766F8C]">At least 8 characters, an uppercase letter, and a number.</span></label>
        <label className="block text-sm font-medium text-[#221C35]">Confirm new password<input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" /></label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-[#E8C8D2] bg-[#FBECEF] p-3 text-sm text-[#6B3346]">{error}</p>}
      <button disabled={busy} className="mt-5 w-full rounded-xl bg-[#483D76] px-4 py-3 font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A] disabled:opacity-50">{busy ? 'Updating…' : 'Change password'}</button>
    </form>
  </main>
}
