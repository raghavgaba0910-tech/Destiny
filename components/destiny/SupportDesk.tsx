'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Activity = { id: string; label: string; type: 'APPOINTMENT' | 'ORDER' | 'ASSESSMENT' }
type Ticket = {
  id: string
  category: string
  subject: string
  message: string
  status: string
  adminResponse: string | null
  createdAt: string
}
type CategoryOption = {
  value: string
  label: string
  description: string
  activityTypes: Activity['type'][]
}

const categories: Record<'patient' | 'professional', CategoryOption[]> = {
  patient: [
    { value: 'APPOINTMENT_SCHEDULING', label: 'Appointment scheduling', description: 'Booking, changing, or finding an appointment.', activityTypes: ['APPOINTMENT'] },
    { value: 'LIVE_SESSION', label: 'Live session / troubleshoot', description: 'Report trouble joining or using your session.', activityTypes: ['APPOINTMENT'] },
    { value: 'BILLING_REFUND_RECEIPT', label: 'Billing / refund / receipt', description: 'Ask about a session, pharmacy order, or receipt.', activityTypes: ['APPOINTMENT', 'ORDER'] },
    { value: 'PRIVACY_DATA_ACCOUNT', label: 'Privacy / data / account', description: 'Ask about account access, your data, or an assessment report.', activityTypes: ['ASSESSMENT'] },
    { value: 'CONTACT_US', label: 'Contact us', description: 'Ask the Destiny team a general question.', activityTypes: [] },
    { value: 'OTHER', label: 'Other', description: 'Something not listed above.', activityTypes: ['APPOINTMENT', 'ORDER', 'ASSESSMENT'] },
  ],
  professional: [
    { value: 'CLIENT_EHR_PLATFORM', label: 'Client EHR / platform', description: 'Report a problem with client records or Destiny tools.', activityTypes: ['APPOINTMENT'] },
    { value: 'PAYOUTS_CLAIMS_DUES', label: 'Payouts / claims / dues', description: 'Ask about session fees or payment status.', activityTypes: ['APPOINTMENT'] },
    { value: 'SESSION_INCONVENIENCE', label: 'Session inconvenience', description: 'Report a scheduling or session issue.', activityTypes: ['APPOINTMENT'] },
    { value: 'CLIENT_MANAGEMENT', label: 'Client management', description: 'Ask about a client or one of your sessions.', activityTypes: ['APPOINTMENT'] },
    { value: 'CONTACT_US', label: 'Contact us', description: 'Ask the Destiny team a general question.', activityTypes: [] },
    { value: 'OTHER', label: 'Other', description: 'Something not listed above.', activityTypes: ['APPOINTMENT'] },
  ],
}

const allCategories = [...categories.patient, ...categories.professional]
const labels: Record<string, string> = Object.fromEntries(allCategories.map(({ value, label }) => [value, label]))

export function SupportDesk({
  professional,
  activities,
  tickets,
  supportEmail,
  supportPhone,
  completedSessionCount = 0,
}: {
  professional: boolean
  activities: Activity[]
  tickets: Ticket[]
  supportEmail: string | null
  supportPhone: string | null
  completedSessionCount?: number
}) {
  const router = useRouter()
  const options = categories[professional ? 'professional' : 'patient']
  const [category, setCategory] = useState(options[0].value)
  const [activity, setActivity] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const selectedCategory = options.find((option) => option.value === category) ?? options[0]
  const relevantActivities = activities.filter((item) => selectedCategory.activityTypes.includes(item.type))
  const selectedActivity = relevantActivities.find(({ id, type }) => `${type}:${id}` === activity)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject,
          message,
          ...(selectedActivity ? { activityType: selectedActivity.type, activityId: selectedActivity.id } : {}),
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error || 'Could not submit your request.')
        return
      }
      setNotice('Your issue will be resolved as soon as possible. You can follow its status below.')
      setSubject('')
      setMessage('')
      setActivity('')
      router.refresh()
    } catch {
      setError('Your request could not be submitted. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="rounded-2xl border border-[#294f7a] bg-[#4f80b8] p-5 text-white">
        <h2 className="text-lg font-bold">{professional ? 'Professional help desk' : 'Patient help desk'}</h2>
        <p className="mt-2 text-sm leading-6">Select the issue that best matches your question. You can attach a session or pharmacy activity so the admin team knows what you’re asking about.</p>
        <p className="mt-3 text-sm font-semibold">Your issue will be resolved as soon as possible.</p>
      </section>
      {professional && <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Session fees and payouts</h2>
        <p className="mt-2 text-sm text-slate-600">{completedSessionCount} completed session(s) are recorded for your account.</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">Session payments, payouts, claims, and dues are not processed or recorded. Select a session below to ask about its listed fee.</p>
      </section>}
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">{professional ? 'Contact Destiny' : 'Refund and contact information'}</h2>
        {!professional && <p className="mt-2 text-sm leading-6 text-slate-600">Session fees are not refundable. Session and pharmacy payments are not collected.</p>}
        <div className="mt-3 space-y-1 text-sm text-slate-600">
          {supportEmail ? <p>Email: <a className="font-semibold text-indigo underline" href={`mailto:${supportEmail}`}>{supportEmail}</a></p> : <p>Email contact is not configured; send a request using this form.</p>}
          {supportPhone && <p>Phone: <a className="font-semibold text-indigo underline" href={`tel:${supportPhone}`}>{supportPhone}</a></p>}
        </div>
      </section>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-3xl border bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold">File a support request</h2>
        <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
          <fieldset>
            <legend className="text-sm font-medium">What do you need help with?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {options.map((option) => <label key={option.value} className={`cursor-pointer rounded-xl border p-3 transition ${category === option.value ? 'border-indigo bg-indigo/[.04] ring-2 ring-indigo/10' : 'hover:border-indigo/30'}`}>
                <input type="radio" name="support-category" value={option.value} checked={category === option.value} onChange={() => { setCategory(option.value); setActivity('') }} className="sr-only" />
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
              </label>)}
            </div>
          </fieldset>
          {selectedCategory.value === 'BILLING_REFUND_RECEIPT' && <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Session fees are non-refundable. No payments are collected and pharmacy orders are not fulfilled.</p>}
          {relevantActivities.length > 0 && <label className="block text-sm font-medium">Which {professional ? 'session' : selectedCategory.value === 'BILLING_REFUND_RECEIPT' ? 'session or pharmacy order' : 'activity or report'} is this about?
            <select value={activity} onChange={(event) => setActivity(event.target.value)} className="mt-1 h-11 w-full rounded-xl border bg-white px-3">
              <option value="">Not about a specific activity</option>
              {relevantActivities.map((item) => <option key={`${item.type}:${item.id}`} value={`${item.type}:${item.id}`}>{item.label}</option>)}
            </select>
          </label>}
          <label className="block text-sm font-medium">Subject<input required minLength={3} maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 h-11 w-full rounded-xl border px-3" /></label>
          <label className="block text-sm font-medium">Message<textarea required minLength={10} maxLength={3000} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what happened and what you need help with." className="mt-1 w-full rounded-xl border p-3" /></label>
          {notice && <p role="status" className="rounded-xl bg-teal/10 p-3 text-sm text-teal">{notice}</p>}
          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-[#171a32] px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send to admin panel'}</button>
        </form>
      </section>
      <section className="rounded-3xl border bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold">Your requests</h2>
        <p className="mt-1 text-sm text-slate-500">Check ticket status and read admin replies here.</p>
        <div className="mt-4 space-y-3">{tickets.map((ticket) => <article key={ticket.id} className="rounded-2xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold uppercase text-violet">{labels[ticket.category] ?? ticket.category.replaceAll('_', ' ')}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold">{ticket.status.replaceAll('_', ' ')}</span></div>
          <h3 className="mt-2 font-semibold">{ticket.subject}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{ticket.message}</p>
          <p className="mt-2 text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleString('en-IN')}</p>
          {ticket.adminResponse && <div className="mt-3 rounded-xl bg-teal/5 p-3"><p className="text-xs font-semibold text-teal">Destiny support response</p><p className="mt-1 whitespace-pre-wrap text-sm">{ticket.adminResponse}</p></div>}
        </article>)}
        {!tickets.length && <p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">No requests filed yet.</p>}</div>
      </section>
    </div>
  </div>
}
