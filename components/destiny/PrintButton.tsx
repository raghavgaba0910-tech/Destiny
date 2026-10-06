'use client'

export function PrintButton() {
  return <button onClick={() => window.print()} className="print:hidden rounded-xl border px-4 py-2.5 text-sm font-semibold">Download report (save as PDF)</button>
}
