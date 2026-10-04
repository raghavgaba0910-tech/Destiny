'use client'

import { useEffect, useState } from 'react'

type Habit = 'medication' | 'exercise' | 'meditation' | 'supplements'
type Checkin = Record<Habit, boolean> & { date: string }
const habits: { key: Habit; title: string; description: string }[] = [
  { key: 'medication', title: 'Medication', description: 'I followed my care plan today' },
  { key: 'exercise', title: 'Movement', description: 'I moved my body in a way that felt okay' },
  { key: 'meditation', title: 'Mindful moment', description: 'I paused for a mindful moment' },
  { key: 'supplements', title: 'Rest & nourishment', description: 'I made space for rest or nourishment' },
]

export function CheckinPanel() {
  const [unlocked, setUnlocked] = useState(false)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [today, setToday] = useState<Record<Habit, boolean>>({ medication: false, exercise: false, meditation: false, supplements: false })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/checkin').then(async (response) => {
      if (!response.ok) throw new Error('Could not load your check-ins.')
      const data = await response.json()
      setUnlocked(data.unlocked)
      setCheckins(data.checkins)
      const current = data.checkins.find((item: Checkin) => new Date(item.date).toDateString() === new Date().toDateString())
      if (current) setToday({ medication: current.medication, exercise: current.exercise, meditation: current.meditation, supplements: current.supplements })
    }).catch((error: Error) => setMessage(error.message)).finally(() => setLoading(false))
  }, [])

  async function save() {
    setMessage('')
    const response = await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(today) })
    const data = await response.json()
    if (!response.ok) { setMessage(data.error || 'Could not save this check-in.'); return }
    setCheckins((current) => [data, ...current.filter((item) => new Date(item.date).toDateString() !== new Date(data.date).toDateString())].slice(0, 7))
    setMessage('Your check-in is saved for today.')
  }

  const chart = [...checkins].reverse()
  if (loading) return <div className="mx-auto max-w-4xl px-5 py-12 text-muted-foreground">Loading your check-ins…</div>
  if (!unlocked) return <div className="mx-auto max-w-3xl px-5 py-12"><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Daily care</p><h1 className="mt-3 text-3xl font-bold">A little care, each day</h1><div className="mt-7 rounded-3xl border bg-white p-7"><div className="text-3xl">🔒</div><h2 className="mt-3 text-xl font-bold">Check-ins unlock after your first session</h2><p className="mt-2 text-muted-foreground">When you complete a session, you can use this space to gently notice routines that support you.</p></div></div>
  return <main className="mx-auto max-w-4xl px-5 py-10"><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Daily care</p><h1 className="mt-3 text-3xl font-bold">How are you caring for yourself?</h1><p className="mt-2 text-muted-foreground">No streaks to break. Just a small moment to notice.</p>
    <section className="mt-7 rounded-3xl border bg-white p-6"><p className="text-sm font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{habits.map(({ key, title, description }) => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4"><input type="checkbox" checked={today[key]} onChange={(event) => setToday((current) => ({ ...current, [key]: event.target.checked }))} className="h-5 w-5 accent-indigo" /><span><span className="block font-semibold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span></label>)}</div><button onClick={() => void save()} className="mt-5 rounded-xl bg-indigo px-5 py-3 font-semibold text-white">Save today’s check-in</button>{message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}</section>
    <section className="mt-7 rounded-3xl border bg-white p-6"><h2 className="font-bold">Your last 7 days</h2><div className="mt-5 flex h-40 items-end gap-3">{chart.map((entry) => { const done = habits.filter(({ key }) => entry[key]).length; return <div key={entry.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div title={`${done} of 4 check-ins`} className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-violet to-teal" style={{ height: `${Math.max(6, done * 25)}%` }} /><span className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' })}</span></div> })}{chart.length === 0 && <p className="text-sm text-muted-foreground">Your check-in history will appear here.</p>}</div></section>
  </main>
}
