'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Destiny Protected Route Error]:', error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertCircle className="h-7 w-7" />
      </div>

      <p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-rose-600">
        Temporary Service Disruption
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Something interrupted this page
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        We encountered a temporary server or database hiccup while retrieving your care space.
        Please try again in a moment.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo px-5 text-sm font-semibold text-white hover:bg-[#393879]"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>

        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Home className="h-4 w-4" /> Back to overview
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-xs text-rose-900">
        <p className="font-semibold">Need urgent help?</p>
        <p className="mt-1">
          If you are experiencing an emergency, call <a href="tel:112" className="font-bold underline">112</a> or Tele-MANAS at <a href="tel:14416" className="font-bold underline">14416</a> (India).
        </p>
      </div>
    </div>
  )
}
