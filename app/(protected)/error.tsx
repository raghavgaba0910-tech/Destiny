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
    try {
      console.error('[Destiny Protected Route Error]:', error instanceof Error ? error.message : error)
    } catch {}
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] text-[#BD6999]">
        <AlertCircle className="h-7 w-7" />
      </div>

      <p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-[#BD6999]">
        Temporary Service Disruption
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#221C35] sm:text-3xl">
        Something interrupted this page
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-[#554E6B]">
        We encountered a temporary server or database hiccup while retrieving your care space.
        Please try again in a moment.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#483D76] px-5 text-sm font-semibold text-[#F5F3F8] shadow-sm hover:bg-[#372E5A]"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>

        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D3CCE2] bg-white px-5 text-sm font-semibold text-[#221C35] shadow-xs hover:bg-[#F5F3F8]"
        >
          <Home className="h-4 w-4" /> Back to overview
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] p-4 text-xs text-[#6B3346]">
        <p className="font-semibold">Need urgent help?</p>
        <p className="mt-1">
          If you are experiencing an emergency, call <a href="tel:112" className="font-bold underline text-[#BD6999]">112</a> or Tele-MANAS at <a href="tel:14416" className="font-bold underline text-[#BD6999]">14416</a> (India).
        </p>
      </div>
    </div>
  )
}
