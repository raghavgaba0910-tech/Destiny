'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, LockKeyhole, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Slot = { id: string; startTime: string }
type SlotDay = { key: string; label: string; shortLabel: string; slots: Slot[] }

const dateKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const dayLabelFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const shortDayFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
  day: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
})

function getDateKey(value: string) {
  return dateKeyFormat.format(new Date(value))
}

export function BookingSection({ professionalId, professionalName, patientName, hasAssessment, pricePerSession }: { professionalId: string; professionalName: string; patientName: string; hasAssessment: boolean; pricePerSession: number }) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selected, setSelected] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [message, setMessage] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [bookedSlot, setBookedSlot] = useState<Slot | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [intakeName, setIntakeName] = useState(patientName)
  const [intakeAge, setIntakeAge] = useState('')
  const [intakeGender, setIntakeGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('OTHER')
  const [shareAssessment, setShareAssessment] = useState(hasAssessment)
  const router = useRouter()

  const loadSlots = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const response = await fetch(`/api/professionals/${professionalId}/slots`, { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Could not load appointment times.')
      const availableSlots = body as Slot[]
      setSlots(availableSlots)
      if (availableSlots.length) {
        const availableDays = Array.from(new Set(availableSlots.map((slot) => getDateKey(slot.startTime))))
        setSelectedDay((current) => availableDays.includes(current) ? current : availableDays[0])
        setSelected((current) => availableSlots.some((slot) => slot.id === current) ? current : '')
      } else {
        setSelected('')
        setSelectedDay('')
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load appointment times.')
    } finally {
      setLoading(false)
    }
  }, [professionalId])

  useEffect(() => { void loadSlots() }, [loadSlots])

  const days = useMemo(() => {
    const grouped = new Map<string, Slot[]>()
    for (const slot of slots) {
      const key = getDateKey(slot.startTime)
      grouped.set(key, [...(grouped.get(key) ?? []), slot])
    }
    return Array.from(grouped, ([key, daySlots]) => ({
      key,
      label: dayLabelFormat.format(new Date(daySlots[0].startTime)),
      shortLabel: shortDayFormat.format(new Date(daySlots[0].startTime)),
      slots: daySlots,
    })) satisfies SlotDay[]
  }, [slots])

  const activeDay = days.find((day) => day.key === selectedDay)
  const selectedSlot = slots.find((slot) => slot.id === selected)

  async function book() {
    if (!selected || !selectedSlot || !intakeName.trim() || !intakeAge) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selected,
          professionalId,
          patientName: intakeName.trim(),
          patientAge: Number(intakeAge),
          patientGender: intakeGender,
          shareAssessment,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setMessage(body.error || 'Booking failed. Please choose another time.')
        setSelected('')
        await loadSlots()
        return
      }
      setBookedSlot(selectedSlot ?? null)
      setBookingId(body.id)
      setSelected('')
      setMessage(body.emailMessage || '')
      await loadSlots()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not confirm your booking. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (bookingId) {
    return (
      <section aria-live="polite" className="overflow-hidden rounded-[1.65rem] border border-[#D3CCE2] bg-white shadow-xs">
        <div className="bg-gradient-to-br from-[#EBE4F2] via-white to-[#F5F3F8] p-6 text-[#221C35]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]"><CheckCircle2 className="h-6 w-6 text-[#BD6999]" /></div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-[#221C35]">Your session is booked</h2>
          <p className="mt-2 text-sm leading-6 text-[#554E6B]">You’re scheduled to meet {professionalName}{bookedSlot ? ` on ${dayLabelFormat.format(new Date(bookedSlot.startTime))} at ${timeFormat.format(new Date(bookedSlot.startTime))} IST` : ''}.</p>
          {message && <p role="status" className="mt-3 text-xs leading-5 text-[#6B3346]">{message}</p>}
          <Link href="/appointments" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#483D76] px-4 text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]">View my appointments <ChevronRight className="h-4 w-4" /></Link>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[1.65rem] border border-[#D3CCE2] bg-white shadow-xs">
      <div className="border-b border-[#D3CCE2] bg-gradient-to-br from-[#EBE4F2]/50 via-white to-[#F5F3F8] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#766F8C]">A good next step</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#221C35]">Choose a time</h2><p className="mt-1 text-xs text-[#554E6B]">50-minute online session</p></div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76] shadow-xs"><CalendarDays className="h-5 w-5" /></div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#D3CCE2] bg-white px-3.5 py-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#766F8C]">Session fee</p><p className="mt-0.5 text-lg font-semibold text-[#221C35]">₹{new Intl.NumberFormat('en-IN').format(pricePerSession)}<span className="ml-1 text-xs font-normal text-[#554E6B]">/ session</span></p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-2.5 py-1 text-[10px] font-semibold text-[#483D76]"><Video className="h-3 w-3" /> Online</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 text-[#221C35]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#221C35]"><CalendarDays className="h-4 w-4 text-[#483D76]" /> Select a day <span className="ml-auto text-[10px] font-normal text-[#766F8C]">Times shown in IST</span></div>
        {loading ? (
          <div aria-label="Loading available times" className="mt-4 flex gap-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[4.2rem] flex-1 animate-pulse rounded-xl bg-[#EAE6F0]" />)}</div>
        ) : loadError ? (
          <div role="alert" className="mt-4 rounded-xl border border-[#E8C8D2] bg-[#FBECEF] p-3 text-xs leading-5 text-[#6B3346]">{loadError}<button type="button" onClick={() => void loadSlots()} className="ml-1 font-semibold underline text-[#BD6999]">Try again</button></div>
        ) : days.length ? (
          <>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => (
                <button key={day.key} type="button" onClick={() => { setSelectedDay(day.key); setSelected('') }} aria-pressed={selectedDay === day.key} className={`min-w-[4.25rem] rounded-xl border px-3 py-2.5 text-center transition ${selectedDay === day.key ? 'border-[#483D76] bg-[#483D76] text-[#F5F3F8] shadow-sm' : 'border-[#D3CCE2] bg-[#F5F3F8] text-[#554E6B] hover:border-[#BD6999] hover:bg-white'}`}>
                  <span className="block text-[10px] font-medium opacity-80">{day.shortLabel.split(' ')[0]}</span><span className="mt-0.5 block text-sm font-semibold">{day.shortLabel.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-[#221C35]">{activeDay?.label}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {activeDay?.slots.map((slot) => <button key={slot.id} type="button" onClick={() => { setSelected(slot.id); setMessage('') }} aria-pressed={selected === slot.id} className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition ${selected === slot.id ? 'border-[#483D76] bg-[#483D76] text-[#F5F3F8] shadow-sm' : 'border-[#D3CCE2] bg-[#F5F3F8] text-[#554E6B] hover:border-[#BD6999] hover:bg-white'}`}><Clock3 className="h-3.5 w-3.5" />{timeFormat.format(new Date(slot.startTime))}</button>)}
            </div>
          </>
        ) : <div className="mt-4 rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] p-4 text-xs leading-5 text-[#554E6B]">No upcoming times are available right now. Please check again later.</div>}

        {selectedSlot && <>
          <div className="mt-4 rounded-xl border border-[#C8BCE0] bg-[#EBE4F2] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#483D76]">Your selection</p><p className="mt-1 text-sm font-semibold text-[#221C35]">{dayLabelFormat.format(new Date(selectedSlot.startTime))} · {timeFormat.format(new Date(selectedSlot.startTime))} IST</p></div>
          <fieldset className="mt-5 space-y-3">
            <legend className="mb-3 text-sm font-semibold text-[#221C35]">A few details for your professional</legend>
            <label className="block space-y-1.5 text-xs font-medium text-[#221C35]">Name
              <input required minLength={2} maxLength={100} autoComplete="name" value={intakeName} onChange={(event) => setIntakeName(event.target.value)} className="h-11 w-full rounded-xl border border-[#D3CCE2] bg-white px-3 text-sm font-normal text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5 text-xs font-medium text-[#221C35]">Age
                <input required type="number" min={1} max={120} inputMode="numeric" value={intakeAge} onChange={(event) => setIntakeAge(event.target.value)} className="h-11 w-full rounded-xl border border-[#D3CCE2] bg-white px-3 text-sm font-normal text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" />
              </label>
              <label className="block space-y-1.5 text-xs font-medium text-[#221C35]">Gender
                <select value={intakeGender} onChange={(event) => { const value = event.target.value; setIntakeGender(value === 'MALE' || value === 'FEMALE' ? value : 'OTHER') }} className="h-11 w-full rounded-xl border border-[#D3CCE2] bg-white px-3 text-sm font-normal text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20">
                  <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                </select>
              </label>
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] p-3 text-xs leading-5 text-[#554E6B]">
              <input type="checkbox" checked={shareAssessment} disabled={!hasAssessment} onChange={(event) => setShareAssessment(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#483D76]" />
              <span>{hasAssessment ? `Share my latest assessment report with ${professionalName}. Uncheck to keep it private.` : 'No completed assessment report is available to share. Only the details above will be shared.'}</span>
            </label>
          </fieldset>
        </>}
        {message && !bookingId && <p role="alert" className="mt-3 text-xs leading-5 text-[#6B3346]">{message}</p>}

        <button type="button" disabled={!selectedSlot || !intakeName.trim() || !intakeAge || Number(intakeAge) < 1 || Number(intakeAge) > 120 || busy || loading} onClick={() => void book()} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#483D76] px-4 text-sm font-semibold text-[#F5F3F8] shadow-sm transition hover:bg-[#372E5A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#483D76]/25 disabled:cursor-not-allowed disabled:bg-[#D3CCE2] disabled:shadow-none">
          {busy ? 'Confirming your time…' : 'Confirm session'}{!busy && <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="mt-3 flex items-start justify-center gap-1.5 text-center text-[10px] leading-4 text-[#766F8C]"><LockKeyhole className="mt-0.5 h-3 w-3 shrink-0" /><span>No payment is collected. The session room does not connect remote participants.</span></div>
      </div>
    </section>
  )
}
