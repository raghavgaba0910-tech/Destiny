'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function SessionClient({ appointmentId, available }: { appointmentId: string; available: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [joined, setJoined] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [muted, setMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [message, setMessage] = useState('')
  const [ending, setEnding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  useEffect(() => {
    if (!joined) return
    const timer = window.setInterval(() => setElapsed((time) => time + 1), 1000)
    return () => window.clearInterval(timer)
  }, [joined])

  async function startPreview() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera preview is not supported in this browser. You can still join the demo room.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraError('')
    } catch {
      setCameraError('Camera or microphone permission was not granted. You can still join the demo room.')
    }
  }

  function toggleCamera() {
    const next = !cameraEnabled
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next })
    setCameraEnabled(next)
  }

  function toggleMute() {
    const next = !muted
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !next })
    setMuted(next)
  }

  async function endSession() {
    setEnding(true)
    const response = await fetch(`/api/appointments/${appointmentId}/complete`, { method: 'PATCH' })
    const body = await response.json()
    if (!response.ok) {
      setMessage(body.error || 'Could not complete the demo session.')
      setEnding(false)
      return
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    router.push('/appointments?completed=1')
  }

  return <div className="mx-auto max-w-5xl px-5 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Private demo room</p><h1 className="mt-2 text-3xl font-bold">Your session</h1></div><span className="rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">No recordings or transcripts</span></div>
    {!available && <div role="alert" className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm">This demo room opens from 10 minutes before the appointment until 15 minutes after its start time.</div>}
    <div className="mt-7 grid gap-5 md:grid-cols-[1fr_280px]">
      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl bg-ink p-5">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/80"><div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-violet/30 text-4xl">✦</div><p className="text-lg font-semibold">Your professional will appear here</p><p className="mt-1 text-sm text-white/50">Demo video room · no remote connection</p></div>
        <video ref={videoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 z-10 h-32 w-48 rounded-2xl bg-black object-cover" />
        {joined && <div className="absolute left-5 top-5 z-10 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</div>}
      </div>
      <aside className="rounded-3xl border bg-white p-5"><h2 className="font-bold">Before you begin</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Allow camera and microphone access for a local preview. Nothing is recorded or transmitted.</p>
        {!joined ? <button disabled={!available} onClick={() => { void startPreview(); setJoined(true) }} className="mt-5 w-full rounded-xl bg-indigo px-4 py-3 font-semibold text-white disabled:opacity-50">Join demo room</button> : <div className="mt-5 space-y-2"><button onClick={toggleCamera} className="w-full rounded-xl border px-4 py-2.5 font-medium">{cameraEnabled ? 'Turn camera off' : 'Turn camera on'}</button><button onClick={toggleMute} className="w-full rounded-xl border px-4 py-2.5 font-medium">{muted ? 'Unmute microphone' : 'Mute microphone'}</button><button disabled={ending} onClick={() => void endSession()} className="w-full rounded-xl bg-coral px-4 py-2.5 font-semibold text-white">{ending ? 'Ending…' : 'End session'}</button></div>}
        {cameraError && <p className="mt-3 text-xs text-amber-800">{cameraError}</p>}{message && <p role="alert" className="mt-3 text-sm text-destructive">{message}</p>}
      </aside>
    </div>
  </div>
}
