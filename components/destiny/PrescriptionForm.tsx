'use client'

import { useState } from 'react'

type Option = { id: string; patientName: string }
type Medicine = { name: string }
type MedicineDetails = { dose: string; frequency: string; duration: string }

export function PrescriptionForm({ appointments, medicines, canPrescribe }: { appointments: Option[]; medicines: Medicine[]; canPrescribe: boolean }) {
  const [appointmentId, setAppointmentId] = useState(appointments[0]?.id ?? '')
  const [selected, setSelected] = useState<string[]>([])
  const [details, setDetails] = useState<Record<string, MedicineDetails>>({})
  const [nextSessionAt, setNextSessionAt] = useState('')
  const [followUpRequired, setFollowUpRequired] = useState(true)
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const response = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        medicines: selected.map((name) => ({ name, ...details[name] })),
        nextSessionAt: nextSessionAt ? new Date(nextSessionAt).toISOString() : '',
        followUpRequired,
        followUpNotes,
      }),
    })
    const body = await response.json()
    setBusy(false)
    setMessage(response.ok ? 'Care plan saved to the patient’s pharmacy profile.' : body.error || 'Could not save the care plan.')
    if (response.ok) {
      setSelected([])
      setDetails({})
      setNextSessionAt('')
      setFollowUpNotes('')
    }
  }

  if (!appointments.length) return <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">A prescription can be added after a completed session with this psychiatrist.</p>
  return <form onSubmit={(event) => void submit(event)} className="space-y-4">
    <label className="block text-sm font-medium">Completed session<select value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} className="mt-1 h-11 w-full rounded-xl border bg-white px-3">{appointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{appointment.patientName}</option>)}</select></label>
    {canPrescribe && <fieldset><legend className="text-sm font-medium">Prescription-only catalog</legend><div className="mt-2 space-y-3">{medicines.map((medicine) => {
      const checked = selected.includes(medicine.name)
      const current = details[medicine.name] ?? { dose: '', frequency: 'ONCE_DAILY', duration: '' }
      return <div key={medicine.name} className="rounded-xl border p-3">
        <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={checked} onChange={(event) => {
          setSelected((items) => event.target.checked ? [...items, medicine.name] : items.filter((item) => item !== medicine.name))
          setDetails((items) => ({ ...items, [medicine.name]: items[medicine.name] ?? { dose: '', frequency: 'ONCE_DAILY', duration: '' } }))
        }} />{medicine.name}</label>
        {checked && <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input aria-label={`${medicine.name} dose`} required placeholder="Dose (e.g. 1 tablet)" value={current.dose} onChange={(event) => setDetails((items) => ({ ...items, [medicine.name]: { ...current, dose: event.target.value } }))} className="h-10 rounded-lg border px-3 text-sm" />
          <select aria-label={`${medicine.name} frequency`} value={current.frequency} onChange={(event) => setDetails((items) => ({ ...items, [medicine.name]: { ...current, frequency: event.target.value } }))} className="h-10 rounded-lg border bg-white px-3 text-sm">
            <option value="ONCE_DAILY">Once a day</option><option value="TWICE_DAILY">Twice a day</option><option value="THRICE_DAILY">Three times a day</option><option value="AS_NEEDED">As needed</option>
          </select>
          <input aria-label={`${medicine.name} duration`} required placeholder="Duration (e.g. 7 days)" value={current.duration} onChange={(event) => setDetails((items) => ({ ...items, [medicine.name]: { ...current, duration: event.target.value } }))} className="h-10 rounded-lg border px-3 text-sm" />
        </div>}
      </div>
    })}</div></fieldset>}
    <label className="block text-sm font-medium">Suggested next session<input type="date" min={new Date().toISOString().slice(0, 10)} value={nextSessionAt} onChange={(event) => setNextSessionAt(event.target.value)} className="mt-1 h-11 w-full rounded-xl border bg-white px-3" /></label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={followUpRequired} onChange={(event) => setFollowUpRequired(event.target.checked)} />Patient should book a follow-up session</label>
    <label className="block text-sm font-medium">Follow-up guidance<textarea value={followUpNotes} onChange={(event) => setFollowUpNotes(event.target.value)} maxLength={1000} rows={3} className="mt-1 w-full rounded-xl border p-3 text-sm" placeholder="Optional care instructions or follow-up notes" /></label>
    <button disabled={busy || !appointmentId || (canPrescribe && !selected.length && !followUpRequired && !followUpNotes.trim() && !nextSessionAt)} className="w-full rounded-xl bg-indigo px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : canPrescribe ? 'Save prescription and care note' : 'Save follow-up plan'}</button>
    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
  </form>
}
