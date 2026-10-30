'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Destiny Root Error]:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf8] px-5 py-12 text-center text-slate-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertCircle className="h-7 w-7" />
      </div>

      <p className="mt-6 text-[10px] font-bold uppercase tracking-[.18em] text-rose-600">
        Server Error
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        We couldn&apos;t load this page
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        The server encountered an unexpected error. Please refresh or return to the home page.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo px-5 text-sm font-semibold text-white hover:bg-[#393879]"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>

        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Home className="h-4 w-4" /> Go to home
        </Link>
      </div>
    </div>
  )
}
