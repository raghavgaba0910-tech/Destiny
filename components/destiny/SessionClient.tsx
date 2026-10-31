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
      setCameraError('Camera preview is not supported in this browser. You can still open the session room.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraError('')
    } catch {
      setCameraError('Camera or microphone permission was not granted. You can still open the session room.')
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
      setMessage(body.error || 'Could not complete the session.')
      setEnding(false)
      return
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    router.push('/appointments?completed=1')
  }

  return <div className="mx-auto max-w-5xl px-5 py-10 text-[#221C35]">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">Session room</p><h1 className="mt-2 text-3xl font-bold text-[#221C35]">Your session</h1></div><span className="rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-4 py-2 text-sm font-semibold text-[#483D76]">No recordings or transcripts</span></div>
    {!available && <div role="alert" className="mt-6 rounded-2xl border border-[#DFC7BE] bg-[#F5EAE6] p-4 text-sm text-[#5A2E22]">This room opens from 10 minutes before the appointment until 15 minutes after its start time. It does not connect remote participants; arrange the actual session through a separate secure service.</div>}
    <div className="mt-7 grid gap-5 md:grid-cols-[1fr_280px]">
      <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#19152B] to-[#2A214C] p-5">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white/80"><div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-4xl text-[#BD6999]">✦</div><p className="text-lg font-semibold">Your professional will appear here</p><p className="mt-1 text-sm text-[#D5CEEC]/70">Local camera preview · no remote connection</p></div>
        <video ref={videoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 z-10 h-32 w-48 rounded-2xl bg-black object-cover" />
        {joined && <div className="absolute left-5 top-5 z-10 rounded-full bg-black/40 px-3 py-1.5 text-sm text-white">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</div>}
      </div>
      <aside className="rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs"><h2 className="font-bold text-[#221C35]">Before you begin</h2><p className="mt-2 text-sm leading-6 text-[#554E6B]">This room does not connect you to your professional. Arrange the actual conversation through a separate secure service. Camera and microphone are used only for a local preview and are not recorded or transmitted.</p>
        {!joined ? <button disabled={!available} onClick={() => { void startPreview(); setJoined(true) }} className="mt-5 w-full rounded-xl bg-[#483D76] px-4 py-3 font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A] disabled:opacity-50">Open session room</button> : <div className="mt-5 space-y-2"><button onClick={toggleCamera} className="w-full rounded-xl border border-[#D3CCE2] px-4 py-2.5 font-medium text-[#221C35] hover:bg-[#F5F3F8]">{cameraEnabled ? 'Turn camera off' : 'Turn camera on'}</button><button onClick={toggleMute} className="w-full rounded-xl border border-[#D3CCE2] px-4 py-2.5 font-medium text-[#221C35] hover:bg-[#F5F3F8]">{muted ? 'Unmute microphone' : 'Mute microphone'}</button><button disabled={ending} onClick={() => void endSession()} className="w-full rounded-xl border border-[#E8C8D2] bg-[#FBECEF] px-4 py-2.5 font-semibold text-[#6B3346] hover:bg-[#E8C8D2]/40">{ending ? 'Ending…' : 'End session'}</button></div>}
        {cameraError && <p className="mt-3 text-xs text-[#5A2E22]">{cameraError}</p>}{message && <p role="alert" className="mt-3 text-sm text-[#6B3346]">{message}</p>}
      </aside>
    </div>
  </div>
}
