'use client'

export function PrintButton() {
  return <button onClick={() => window.print()} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Print / save as PDF</button>
}
