'use client'

import { useEffect, useState } from 'react'

type Medicine = { id: string; name: string; type: string; description: string; price: number; category: string }
type Order = { id: string; status: string; total: number; createdAt: string; items: unknown }
type PharmacyData = { medicines: Medicine[]; allowedPrescriptionItems: string[]; orders: Order[] }

export function PharmacyPanel() {
  const [data, setData] = useState<PharmacyData | null>(null)
  const [cart, setCart] = useState<string[]>([])
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/pharmacy/medicines')
    const body = await response.json()
    if (!response.ok) throw new Error(body.error || 'Could not load the demo pharmacy.')
    setData(body)
  }

  useEffect(() => { void load().catch((error: Error) => setMessage(error.message)) }, [])

  async function checkout() {
    setMessage('')
    const response = await fetch('/api/pharmacy/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ medicineIds: cart }) })
    const body = await response.json()
    if (!response.ok) { setMessage(body.error || 'Could not place the order.'); return }
    setCart([])
    await load()
    setMessage('Demo order placed. No payment was collected.')
  }

  async function advance(orderId: string) {
    const response = await fetch(`/api/orders/${orderId}/advance`, { method: 'PATCH' })
    const body = await response.json()
    if (!response.ok) { setMessage(body.error || 'Could not advance this order.'); return }
    await load()
  }

  if (!data) return <main className="mx-auto max-w-6xl px-5 py-12"><p>{message || 'Loading demo pharmacy…'}</p></main>
  const total = data.medicines.filter((medicine) => cart.includes(medicine.id)).reduce((sum, medicine) => sum + medicine.price, 0)
  const stages = ['PLACED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED']
  return <main className="mx-auto max-w-6xl px-5 py-10"><p className="text-sm font-semibold uppercase tracking-[.18em] text-violet">Demo E-Pharmacy</p><h1 className="mt-3 text-3xl font-bold">A small shelf of wellbeing</h1><p className="mt-2 text-sm text-muted-foreground">Catalog items and orders are for demonstration only. No medical advice or real medicines are provided.</p>
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_310px]"><section><div className="grid gap-4 sm:grid-cols-2">{data.medicines.map((medicine) => { const gated = medicine.type === 'PRESCRIPTION' && !data.allowedPrescriptionItems.includes(medicine.name); const inCart = cart.includes(medicine.id); return <article key={medicine.id} className="rounded-3xl border bg-white p-5"><div className="flex justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${medicine.type === 'OTC' ? 'bg-teal/10 text-teal' : 'bg-violet/10 text-violet'}`}>{medicine.type === 'OTC' ? 'General wellness' : 'Prescription-only'}</span><span className="text-sm font-semibold">₹{medicine.price}</span></div><h2 className="mt-4 font-bold">{medicine.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{medicine.description}</p><button disabled={gated} onClick={() => setCart((current) => inCart ? current.filter((id) => id !== medicine.id) : [...current, medicine.id])} className="mt-4 w-full rounded-xl border px-3 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">{gated ? 'Requires an active prescription' : inCart ? 'Remove from cart' : 'Add to demo cart'}</button></article> })}</div></section>
      <aside className="space-y-5"><div className="rounded-3xl border bg-white p-5"><h2 className="font-bold">Demo cart</h2><p className="mt-2 text-sm text-muted-foreground">{cart.length} item(s)</p><p className="mt-4 text-xl font-bold">₹{total}</p><button disabled={!cart.length} onClick={() => void checkout()} className="mt-4 w-full rounded-xl bg-indigo px-4 py-3 font-semibold text-white disabled:opacity-50">Place demo order</button></div>
        <div className="rounded-3xl border bg-white p-5"><h2 className="font-bold">Your demo orders</h2><div className="mt-4 space-y-4">{data.orders.map((order) => <div key={order.id} className="border-t pt-4"><div className="flex justify-between text-sm"><span className="font-semibold">{order.status.replaceAll('_', ' ')}</span><span>₹{order.total}</span></div><div className="mt-2 flex gap-1">{stages.map((stage, index) => <div key={stage} title={stage} className={`h-1.5 flex-1 rounded-full ${stages.indexOf(order.status) >= index ? 'bg-teal' : 'bg-muted'}`} />)}</div>{order.status !== 'DELIVERED' && <button onClick={() => void advance(order.id)} className="mt-3 text-xs font-semibold text-indigo">Advance demo order →</button>}</div>)}{!data.orders.length && <p className="text-sm text-muted-foreground">Your orders will show here.</p>}</div></div></aside>
    </div>{message && <p role="status" className="mt-5 rounded-xl bg-teal/10 p-3 text-sm">{message}</p>}
  </main>
}
