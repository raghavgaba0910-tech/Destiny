'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

type Application = {
  id: string
  name: string
  gender: string
  type: string
  experience: number
  email: string
  phoneNumber: string
  licenseImage: string
  licenseMimeType: string
  createdAt: string
}
type Ticket = {
  id: string
  category: string
  subject: string
  message: string
  status: string
  adminResponse: string | null
  createdAt: string
  requester: { name: string; email: string; role: string }
  relatedAppointment: { patientName: string; slot: { startTime: string }; professional: { user: { name: string } } } | null
  relatedOrder: { total: number; status: string; createdAt: string } | null
  relatedAssessment: { type: string; severity: string; createdAt: string } | null
}

const categoryLabels: Record<string, string> = {
  APPOINTMENT_SCHEDULING: 'Appointment scheduling',
  LIVE_SESSION: 'Live session / troubleshooting',
  BILLING_REFUND_RECEIPT: 'Billing, refund or receipt',
  PRIVACY_DATA_ACCOUNT: 'Privacy, data or account',
  CLIENT_EHR_PLATFORM: 'Client EHR / platform',
  PAYOUTS_CLAIMS_DUES: 'Payouts, claims or dues',
  SESSION_INCONVENIENCE: 'Session inconvenience',
  CLIENT_MANAGEMENT: 'Client management',
  CONTACT_US: 'Contact Destiny',
  OTHER: 'Other',
}

export function AdminConsole({ applications, tickets }: { applications: Application[]; tickets: Ticket[] }) {
  const router = useRouter()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')
  const [testingEmail, setTestingEmail] = useState(false)

  async function sendEmailTest() {
    setTestingEmail(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/email-test', { method: 'POST' })
      const body = await response.json()
      setMessage(response.ok
        ? body.message
        : body.error || 'SMTP test failed. Check the deployment logs and email settings.')
    } catch {
      setMessage('SMTP test request failed. Check your connection and try again.')
    } finally {
      setTestingEmail(false)
    }
  }

  async function review(id: string, decision: 'APPROVE' | 'REJECT') {
    setBusyId(id)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reviewNotes: notes[id] ?? '' }),
      })
      const body = await response.json()
      if (!response.ok) {
        setMessage(body.error || 'Could not review this application.')
        return
      }
      if (decision === 'APPROVE') {
        setMessage(body.emailDelivery === 'sent'
          ? `Approved ${body.professionalCode}. ${body.emailMessage}`
          : `Approved ${body.professionalCode}. Email status: ${body.emailMessage} Temporary password: ${body.temporaryPassword}`)
      } else {
        setMessage('Application rejected. The applicant may submit a new application.')
      }
      router.refresh()
    } catch {
      setMessage('Could not review this application. Check your connection and try again.')
    } finally {
      setBusyId('')
    }
  }

  async function updateTicket(id: string) {
    setBusyId(id)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statuses[id] ?? 'IN_PROGRESS',
          adminResponse: responses[id] ?? '',
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setMessage(body.error || 'Could not update this support ticket.')
        return
      }
      setMessage('Support ticket updated.')
      router.refresh()
    } catch {
      setMessage('Could not update this support ticket. Check your connection and try again.')
    } finally {
      setBusyId('')
    }
  }

  return <div className="space-y-8">
    {message && <p role="status" className="rounded-xl bg-teal/10 p-3 text-sm">{message}</p>}
    <section className="rounded-3xl border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Professional applications</h2><p className="mt-1 text-sm text-slate-500">Review uploaded licenses before creating a professional account.</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-violet/10 px-3 py-1 text-xs font-semibold text-violet">{applications.length} pending</span><button type="button" disabled={testingEmail} onClick={() => void sendEmailTest()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">{testingEmail ? 'Sending test…' : 'Send test email'}</button></div></div>
      <div className="mt-5 space-y-4">
        {applications.map((application) => <article key={application.id} className="rounded-2xl border p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div><h3 className="font-semibold">{application.name} · {application.type.toLowerCase()}</h3><p className="mt-1 text-sm text-slate-600">{application.gender} · {application.experience} years experience</p><p className="mt-1 text-sm text-slate-600">{application.email} · {application.phoneNumber}</p><p className="mt-1 text-xs text-slate-400">Submitted {new Date(application.createdAt).toLocaleString('en-IN')}</p></div>
            <a href={application.licenseImage} target="_blank" rel="noreferrer" aria-label={`${application.name}'s license image`} className="block overflow-hidden rounded-xl border bg-slate-50"><Image src={application.licenseImage} alt="Uploaded professional license" width={220} height={144} unoptimized className="h-36 w-full object-contain" /></a>
          </div>
          <p className="mt-2 text-xs text-slate-500">License image type: {application.licenseMimeType}</p>
          <label className="mt-3 block text-xs font-medium">Review note<input maxLength={1000} value={notes[application.id] ?? ''} onChange={(event) => setNotes({ ...notes, [application.id]: event.target.value })} className="mt-1 h-10 w-full rounded-lg border px-3 text-sm" /></label>
          <div className="mt-3 flex gap-2"><button disabled={Boolean(busyId)} onClick={() => void review(application.id, 'APPROVE')} className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busyId === application.id ? 'Reviewing…' : 'Approve and create account'}</button><button disabled={Boolean(busyId)} onClick={() => void review(application.id, 'REJECT')} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-800 disabled:opacity-50">Reject</button></div>
        </article>)}
        {!applications.length && <p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">No applications are awaiting review.</p>}
      </div>
    </section>
    <section className="rounded-3xl border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Help desk</h2><p className="mt-1 text-sm text-slate-500">Patient and professional questions are collected here.</p></div><span className="rounded-full bg-violet/10 px-3 py-1 text-xs font-semibold text-violet">{tickets.length} ticket(s)</span></div>
      <div className="mt-5 space-y-4">
        {tickets.map((ticket) => <article key={ticket.id} className="rounded-2xl border p-4">
          <div className="flex flex-wrap justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-violet">{categoryLabels[ticket.category] ?? ticket.category.replaceAll('_', ' ')}</p><h3 className="mt-1 font-semibold">{ticket.subject}</h3></div><span className="text-xs text-slate-500">{ticket.status.replaceAll('_', ' ')}</span></div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{ticket.message}</p>
          {ticket.relatedAppointment && <p className="mt-2 text-xs text-indigo">Linked session: {ticket.relatedAppointment.patientName} · {ticket.relatedAppointment.professional.user.name} · {new Date(ticket.relatedAppointment.slot.startTime).toLocaleString('en-IN')}</p>}
          {ticket.relatedOrder && <p className="mt-2 text-xs text-indigo">Linked pharmacy order: ₹{ticket.relatedOrder.total} · {ticket.relatedOrder.status.toLowerCase()} · {new Date(ticket.relatedOrder.createdAt).toLocaleDateString('en-IN')}</p>}
          {ticket.relatedAssessment && <p className="mt-2 text-xs text-indigo">Linked assessment: {ticket.relatedAssessment.type.toLowerCase()} · {ticket.relatedAssessment.severity} · {new Date(ticket.relatedAssessment.createdAt).toLocaleDateString('en-IN')}</p>}
          <p className="mt-2 text-xs text-slate-500">{ticket.requester.name} · {ticket.requester.email} · {ticket.requester.role.toLowerCase()} · {new Date(ticket.createdAt).toLocaleString('en-IN')}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[180px_1fr_auto]">
            <select aria-label="Support ticket status" value={statuses[ticket.id] ?? ticket.status} onChange={(event) => setStatuses({ ...statuses, [ticket.id]: event.target.value })} className="h-10 rounded-lg border bg-white px-3 text-sm"><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select>
            <input maxLength={2000} aria-label="Admin response" value={responses[ticket.id] ?? ticket.adminResponse ?? ''} onChange={(event) => setResponses({ ...responses, [ticket.id]: event.target.value })} placeholder="Response for the requester" className="h-10 rounded-lg border px-3 text-sm" />
            <button disabled={Boolean(busyId)} onClick={() => void updateTicket(ticket.id)} className="rounded-lg bg-[#171a32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save response</button>
          </div>
          <p className="mt-2 text-xs font-medium text-teal">Your issue will be resolved as soon as possible.</p>
        </article>)}
        {!tickets.length && <p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">No help desk tickets have been filed.</p>}
      </div>
    </section>
  </div>
}
