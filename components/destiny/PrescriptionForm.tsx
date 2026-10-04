'use client'

import { useState } from 'react'

type Option = { id: string; patient: { name: string } }
type Medicine = { name: string }

export function PrescriptionForm({ appointments, medicines }: { appointments: Option[]; medicines: Medicine[] }) {
  const [appointmentId, setAppointmentId] = useState(appointments[0]?.id ?? '')
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const response = await fetch('/api/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId, medicines: selected }) })
    const body = await response.json()
    setBusy(false)
    setMessage(response.ok ? 'Demo prescription saved to the patient’s pharmacy profile.' : body.error || 'Could not save prescription.')
    if (response.ok) setSelected([])
  }

  if (!appointments.length) return <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">A prescription can be added after a completed session with this psychiatrist.</p>
  return <form onSubmit={(event) => void submit(event)} className="space-y-4">
    <label className="block text-sm font-medium">Completed session<select value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} className="mt-1 h-11 w-full rounded-xl border bg-white px-3">{appointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{appointment.patient.name}</option>)}</select></label>
    <fieldset><legend className="text-sm font-medium">Prescription-only demo catalog</legend><div className="mt-2 space-y-2">{medicines.map((medicine) => <label key={medicine.name} className="flex items-center gap-3 rounded-xl border p-3 text-sm"><input type="checkbox" checked={selected.includes(medicine.name)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, medicine.name] : current.filter((item) => item !== medicine.name))} />{medicine.name}</label>)}</div></fieldset>
    <button disabled={busy || !appointmentId || !selected.length} className="w-full rounded-xl bg-indigo px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Issue demo prescription'}</button>
    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
  </form>
}
