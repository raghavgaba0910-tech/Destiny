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

export function BookingSection({ professionalId, professionalName, pricePerSession }: { professionalId: string; professionalName: string; pricePerSession: number }) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selected, setSelected] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [message, setMessage] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [bookedSlot, setBookedSlot] = useState<Slot | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
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
    if (!selected) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selected, professionalId }),
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
      setMessage(body.previewWarning || '')
      await loadSlots()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not confirm your booking. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (bookingId) {
    return (
      <section aria-live="polite" className="overflow-hidden rounded-[1.65rem] border border-teal/20 bg-white shadow-[0_18px_50px_-30px_rgba(20,20,40,.35)]">
        <div className="bg-gradient-to-br from-teal/10 via-white to-violet/10 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/15 text-teal"><CheckCircle2 className="h-6 w-6" /></div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Your session is booked</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">You’re scheduled to meet {professionalName}{bookedSlot ? ` on ${dayLabelFormat.format(new Date(bookedSlot.startTime))} at ${timeFormat.format(new Date(bookedSlot.startTime))} IST` : ''}.</p>
          {message && <p role="status" className="mt-3 text-xs leading-5 text-amber-800">{message}</p>}
          <Link href="/appointments" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#171a32] px-4 text-sm font-semibold text-white transition hover:bg-indigo">View my appointments <ChevronRight className="h-4 w-4" /></Link>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-[1.65rem] border border-[#e9e7e2] bg-white shadow-[0_18px_50px_-30px_rgba(20,20,40,.35)]">
      <div className="border-b border-slate-100 bg-gradient-to-br from-violet/[0.06] via-white to-teal/[0.07] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet">A good next step</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Choose a time</h2><p className="mt-1 text-xs text-slate-500">50-minute online session</p></div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet shadow-sm"><CalendarDays className="h-5 w-5" /></div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white bg-white/80 px-3.5 py-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">Session fee</p><p className="mt-0.5 text-lg font-semibold text-ink">₹{new Intl.NumberFormat('en-IN').format(pricePerSession)}<span className="ml-1 text-xs font-normal text-slate-500">/ session</span></p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-1 text-[10px] font-semibold text-teal"><Video className="h-3 w-3" /> Online</span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><CalendarDays className="h-4 w-4 text-violet" /> Select a day <span className="ml-auto text-[10px] font-normal text-slate-400">Times shown in IST</span></div>
        {loading ? (
          <div aria-label="Loading available times" className="mt-4 flex gap-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[4.2rem] flex-1 animate-pulse rounded-xl bg-slate-100" />)}</div>
        ) : loadError ? (
          <div role="alert" className="mt-4 rounded-xl bg-coral/10 p-3 text-xs leading-5 text-rose-800">{loadError}<button type="button" onClick={() => void loadSlots()} className="ml-1 font-semibold underline">Try again</button></div>
        ) : days.length ? (
          <>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => (
                <button key={day.key} type="button" onClick={() => { setSelectedDay(day.key); setSelected('') }} aria-pressed={selectedDay === day.key} className={`min-w-[4.25rem] rounded-xl border px-3 py-2.5 text-center transition ${selectedDay === day.key ? 'border-indigo bg-indigo text-white shadow-sm shadow-indigo/20' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo/40 hover:bg-indigo/[0.03]'}`}>
                  <span className="block text-[10px] font-medium opacity-75">{day.shortLabel.split(' ')[0]}</span><span className="mt-0.5 block text-sm font-semibold">{day.shortLabel.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-700">{activeDay?.label}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {activeDay?.slots.map((slot) => <button key={slot.id} type="button" onClick={() => { setSelected(slot.id); setMessage('') }} aria-pressed={selected === slot.id} className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition ${selected === slot.id ? 'border-violet bg-violet text-white shadow-sm shadow-violet/20' : 'border-slate-200 bg-white text-slate-600 hover:border-violet/40 hover:bg-violet/[0.03]'}`}><Clock3 className="h-3.5 w-3.5" />{timeFormat.format(new Date(slot.startTime))}</button>)}
            </div>
          </>
        ) : <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">No upcoming times are available right now. Please check again later.</div>}

        {selectedSlot && <div className="mt-4 rounded-xl border border-indigo/10 bg-indigo/[0.035] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-indigo">Your selection</p><p className="mt-1 text-sm font-semibold text-ink">{dayLabelFormat.format(new Date(selectedSlot.startTime))} · {timeFormat.format(new Date(selectedSlot.startTime))} IST</p></div>}
        {message && !bookingId && <p role="alert" className="mt-3 text-xs leading-5 text-rose-700">{message}</p>}

        <button type="button" disabled={!selected || busy || loading} onClick={() => void book()} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171a32] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
          {busy ? 'Confirming your time…' : 'Confirm session'}{!busy && <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="mt-3 flex items-start justify-center gap-1.5 text-center text-[10px] leading-4 text-slate-400"><LockKeyhole className="mt-0.5 h-3 w-3 shrink-0" /><span>Demo booking · no payment collected · no real video connection</span></div>
      </div>
    </section>
  )
}
