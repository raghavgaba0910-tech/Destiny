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

  return <main className="flex min-h-screen items-center justify-center bg-[#fbfaf8] px-5 py-10">
    <form onSubmit={(event) => void submit(event)} className="w-full max-w-md rounded-3xl border bg-white p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet">Account security</p>
      <h1 className="mt-2 text-2xl font-bold">Change your temporary password</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Choose a new password before entering your professional workspace.</p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium">Temporary password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3" /></label>
        <label className="block text-sm font-medium">New password<input required type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3" /><span className="mt-1 block text-xs text-slate-500">At least 8 characters, an uppercase letter, and a number.</span></label>
        <label className="block text-sm font-medium">Confirm new password<input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3" /></label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <button disabled={busy} className="mt-5 w-full rounded-xl bg-[#171a32] px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Updating…' : 'Change password'}</button>
    </form>
  </main>
}
