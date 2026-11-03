'use client'

import '@livekit/components-styles'
import { useEffect, useState, useCallback, use } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock,
  CameraOff,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'

type SessionStatus = 'loading' | 'connected' | 'error' | 'ended'

interface PageProps {
  params?: Promise<{ id: string }>
}

export default function SessionPage({ params }: PageProps) {
  const router = useRouter()
  const routeParams = useParams()

  // Support both Promise params (Next.js 15) and useParams hook
  const resolvedParams = params ? use(params) : null
  const appointmentId =
    resolvedParams?.id ??
    (typeof routeParams?.id === 'string'
      ? routeParams.id
      : Array.isArray(routeParams?.id)
        ? routeParams.id[0]
        : '')

  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [permissionWarning, setPermissionWarning] = useState<string | null>(null)

  // 1. Lifecycle & Token Fetch
  useEffect(() => {
    setMounted(true)

    if (!appointmentId) {
      setStatus('error')
      setErrorMessage('Invalid session link: appointment ID is missing.')
      return
    }

    let isCancelled = false

    async function fetchToken() {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await fetch('/api/session/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId }),
        })

        const data = (await response.json()) as {
          token?: string
          wsUrl?: string
          error?: string
          details?: string
        }

        if (isCancelled) return

        if (!response.ok) {
          const fallbackError =
            response.status === 401
              ? 'Unauthorized: Please sign in to join this private consultation.'
              : response.status === 403
                ? 'Forbidden: You are not a participant in this consultation.'
                : response.status === 404
                  ? 'Appointment not found. This session may have expired or been removed.'
                  : data.error || 'Failed to initialize session room.'

          setStatus('error')
          setErrorMessage(data.error || fallbackError)
          return
        }

        if (data.token && data.wsUrl) {
          setToken(data.token)
          setWsUrl(data.wsUrl)
          setStatus('connected')
        } else {
          setStatus('error')
          setErrorMessage(
            'The consultation server did not return valid connection credentials.'
          )
        }
      } catch (err: unknown) {
        if (isCancelled) return
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to reach the consultation server.'
        console.error('[Destiny Video Session] Connection error:', msg)
        setStatus('error')
        setErrorMessage(
          'Network connection error. Please verify your internet connection and try again.'
        )
      }
    }

    void fetchToken()

    return () => {
      isCancelled = true
    }
  }, [appointmentId])

  // 2. Session Teardown & Navigation
  const handleDisconnect = useCallback(() => {
    setStatus('ended')
  }, [])

  // Prevent SSR hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#19152B] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#BD6999]" />
      </div>
    )
  }

  // 3. Loading State
  if (status === 'loading') {
    return (
      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#19152B] px-5 text-white">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md">
            <Loader2 className="h-10 w-10 animate-spin text-[#BD6999]" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D5CEEC]/70">
            Destiny Telehealth
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Connecting to your consultation
          </h1>
          <p className="mt-2 text-sm text-[#D5CEEC]/80">
            Establishing a private, encrypted 1-on-1 video room...
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-[#D5CEEC]/70">
            <Lock className="h-3.5 w-3.5 text-[#BD6999]" />
            <span>End-to-end encrypted · HIPAA compliant</span>
          </div>
        </div>
      </main>
    )
  }

  // 4. Ended / Left State
  if (status === 'ended') {
    return (
      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#19152B] px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Left Consultation</h1>
          <p className="mt-2 text-sm text-[#D5CEEC]/80">
            You have left the video room. While the session window is active, you or the other participant can rejoin at any time.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                setStatus('loading')
                window.location.reload()
              }}
              className="w-full rounded-xl bg-[#BD6999] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a25480]"
            >
              Rejoin Consultation
            </button>
            <Link
              href="/appointments"
              className="w-full rounded-xl bg-[#483D76] py-3 text-center text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]"
            >
              Back to Appointments
            </Link>
            <Link
              href="/dashboard"
              className="w-full rounded-xl border border-white/10 bg-transparent py-3 text-center text-sm font-semibold text-white/90 transition hover:bg-white/5"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // 5. Error & Access Denied State (401, 403, 404, or network error)
  if (status === 'error' || !token || !wsUrl) {
    return (
      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#19152B] px-5 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-rose-500/20 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">
            Access Restricted
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Cannot Join Consultation
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#D5CEEC]/80">
            {errorMessage ||
              'You do not have authorization to access this consultation room.'}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#483D76] px-6 py-3 text-sm font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Link>
            <Link
              href="/appointments"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              View Appointments
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // 6. Connected State: LiveKit Video Room
  return (
    <div
      className="relative h-screen w-full bg-slate-950 overflow-hidden"
      data-lk-theme="default"
      style={{ height: '100dvh', minHeight: '100dvh' }}
    >
      {/* Media permission denial alert */}
      {permissionWarning && (
        <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-950/90 px-4 py-2.5 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md">
          <CameraOff className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{permissionWarning}</span>
          <button
            onClick={() => setPermissionWarning(null)}
            className="ml-2 underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={wsUrl || 'wss://destiny-video-sessions-som6m6u1.livekit.cloud'}
        connect={true}
        onDisconnected={handleDisconnect}
        onError={(err: Error) => {
          console.error('[LiveKit Error]:', err)
          if (
            err.name === 'NotAllowedError' ||
            err.message?.toLowerCase().includes('permission')
          ) {
            setPermissionWarning(
              'Camera or microphone access was blocked. Please grant permissions in your browser URL bar to share video/audio.'
            )
          }
        }}
        className="h-full w-full"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
