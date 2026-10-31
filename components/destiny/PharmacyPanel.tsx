'use client'

import { useEffect, useState } from 'react'
import { CreditCard, WalletCards } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

type Medicine = { id: string; name: string; type: string; description: string; price: number; category: string }
type OrderItem = { id: string; name: string; price: number }
type PrescriptionItem = { name: string; dose?: string; frequency?: string; duration?: string }
type Order = {
  id: string
  status: string
  total: number
  createdAt: string
  items: unknown
  recipientName: string | null
  phoneNumber: string | null
  address: string | null
  postalCode: string | null
  paymentMode: string | null
}
type Prescription = {
  id: string
  medicines: unknown
  createdAt: string
  nextSessionAt: string | null
  followUpRequired: boolean
  followUpNotes: string | null
  appointment: { patientName: string; professional: { type: string; user: { name: string } } }
}
type PharmacyData = {
  medicines: Medicine[]
  allowedPrescriptionItems: string[]
  prescriptions: Prescription[]
  orders: Order[]
}

const stages = ['PLACED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED']
const paymentLabels: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on delivery',
  UPI: 'UPI · not processed',
  CARD: 'Card · not processed',
}
const frequencyLabels: Record<string, string> = {
  ONCE_DAILY: 'Once a day',
  TWICE_DAILY: 'Twice a day',
  THRICE_DAILY: 'Three times a day',
  AS_NEEDED: 'As needed',
}

function getPrescriptionItems(value: unknown): PrescriptionItem[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string') return []
    return [{
      name: item.name,
      dose: 'dose' in item && typeof item.dose === 'string' ? item.dose : undefined,
      frequency: 'frequency' in item && typeof item.frequency === 'string' ? item.frequency : undefined,
      duration: 'duration' in item && typeof item.duration === 'string' ? item.duration : undefined,
    }]
  })
}

function getOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string') return []
    return [{
      id: 'id' in item && typeof item.id === 'string' ? item.id : '',
      name: item.name,
      price: 'price' in item && typeof item.price === 'number' ? item.price : 0,
    }]
  })
}

export function PharmacyPanel() {
  const [data, setData] = useState<PharmacyData | null>(null)
  const [cart, setCart] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [shipping, setShipping] = useState({
    recipientName: '',
    phoneNumber: '',
    address: '',
    postalCode: '',
    paymentMode: 'CASH_ON_DELIVERY',
  })

  async function load() {
    const response = await fetch('/api/pharmacy/medicines')
    const body = await response.json()
    if (!response.ok) throw new Error(body.error || 'Could not load the pharmacy.')
    setData(body)
  }

  useEffect(() => { void load().catch((error: Error) => setMessage(error.message)) }, [])

  async function checkout(event: React.FormEvent) {
    event.preventDefault()
    if (!cart.length) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/pharmacy/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineIds: cart, ...shipping }),
      })
      const body = await response.json()
      if (!response.ok) {
        setMessage(body.error || 'Could not place the order.')
        return
      }
      setCart([])
      await load()
      setMessage('Order placed. No payment was collected and no medicine will be fulfilled.')
    } catch {
      setMessage('Could not place the order. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function advance(orderId: string) {
    const response = await fetch(`/api/orders/${orderId}/advance`, { method: 'PATCH' })
    const body = await response.json()
    if (!response.ok) { setMessage(body.error || 'Could not advance this order.'); return }
    await load()
  }

  if (!data) return <main className="mx-auto max-w-6xl px-5 py-12 text-[#766F8C]"><p>{message || 'Loading pharmacy…'}</p></main>
  const cartItems = data.medicines.filter((medicine) => cart.includes(medicine.id))
  const total = cartItems.reduce((sum, medicine) => sum + medicine.price, 0)
  return <main className="mx-auto max-w-6xl px-5 py-10 text-[#221C35]">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#766F8C]">E-Pharmacy</p>
    <h1 className="mt-3 text-3xl font-bold text-[#221C35]">A small shelf of wellbeing</h1>
    <p className="mt-2 text-sm text-[#554E6B]">Catalog items are informational only. No medical advice or medicines are provided, and orders are not fulfilled.</p>
    {data.prescriptions.length > 0 && <section className="mt-7 rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs sm:p-6">
      <h2 className="text-xl font-bold text-[#221C35]">Your prescriptions and follow-up</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{data.prescriptions.map((prescription) => <article key={prescription.id} className="rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] p-4">
        <p className="text-xs text-[#766F8C]">For {prescription.appointment.patientName} · {getPrescriptionItems(prescription.medicines).length ? 'prescribed by' : 'follow-up plan by'} {prescription.appointment.professional.user.name} ({prescription.appointment.professional.type.toLowerCase()})</p>
        <h3 className="mt-1 font-semibold text-[#221C35]">Issued {new Date(prescription.createdAt).toLocaleDateString('en-IN')}</h3>
        <ul className="mt-3 space-y-2">{getPrescriptionItems(prescription.medicines).map((item) => <li key={item.name} className="rounded-xl border border-[#D3CCE2] bg-white p-3 text-sm text-[#221C35]"><strong>{item.name}</strong>{item.dose && <span> · {item.dose}</span>}{item.frequency && <span> · {frequencyLabels[item.frequency] ?? item.frequency}</span>}{item.duration && <span> · {item.duration}</span>}</li>)}</ul>
        {!getPrescriptionItems(prescription.medicines).length && <p className="mt-3 rounded-xl border border-[#D3CCE2] bg-white p-3 text-sm text-[#554E6B]">Follow-up guidance only; no medication was prescribed.</p>}
        <p className="mt-3 text-sm text-[#554E6B]">{prescription.followUpRequired ? 'Follow-up session recommended' : 'No follow-up session recommended'}{prescription.nextSessionAt ? ` · Suggested date ${new Date(prescription.nextSessionAt).toLocaleDateString('en-IN')}` : ''}</p>
        {prescription.followUpNotes && <p className="mt-2 whitespace-pre-wrap text-sm text-[#554E6B]">{prescription.followUpNotes}</p>}
        <a target="_blank" rel="noreferrer" href={`/api/prescriptions/${prescription.id}/report`} className="mt-3 inline-block rounded-lg border border-[#D3CCE2] bg-white px-3 py-2 text-xs font-semibold text-[#221C35] hover:bg-[#EAE6F0]">Open / print care report</a>
      </article>)}</div>
    </section>}
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_330px]">
      <section><div className="grid gap-4 sm:grid-cols-2">{data.medicines.map((medicine) => {
        const gated = medicine.type === 'PRESCRIPTION' && !data.allowedPrescriptionItems.includes(medicine.name)
        const inCart = cart.includes(medicine.id)
        return <article key={medicine.id} className="rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs">
          <div className="flex justify-between gap-3"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${medicine.type === 'OTC' ? 'border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]' : 'border-[#D3CCE2] bg-[#F5F3F8] text-[#554E6B]'}`}>{medicine.type === 'OTC' ? 'General wellness' : 'Prescription-only'}</span><span className="text-sm font-semibold text-[#221C35]">₹{medicine.price}</span></div>
          <h2 className="mt-4 font-bold text-[#221C35]">{medicine.name}</h2><p className="mt-2 text-sm leading-6 text-[#554E6B]">{medicine.description}</p>
          <button type="button" disabled={gated} onClick={() => setCart((current) => inCart ? current.filter((id) => id !== medicine.id) : [...current, medicine.id])} className="mt-4 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 py-2.5 text-sm font-semibold text-[#221C35] transition hover:border-[#BD6999] hover:bg-[#EBE4F2] disabled:cursor-not-allowed disabled:opacity-50">{gated ? 'Requires a prescription' : inCart ? 'Remove from cart' : 'Add to cart'}</button>
        </article>
      })}</div></section>
      <aside className="space-y-5">
        <form onSubmit={(event) => void checkout(event)} className="rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs">
          <h2 className="font-bold text-[#221C35]">Delivery and payment details</h2><p className="mt-1 text-xs text-[#766F8C]">Payments are not processed and orders are not delivered.</p>
          <div className="mt-4 space-y-3">
            <input required minLength={2} maxLength={100} aria-label="Recipient name" placeholder="Full name" value={shipping.recipientName} onChange={(event) => setShipping({ ...shipping, recipientName: event.target.value })} className="h-10 w-full rounded-lg border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-sm text-[#221C35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" />
            <input required type="tel" aria-label="Phone number" placeholder="Phone number" value={shipping.phoneNumber} onChange={(event) => setShipping({ ...shipping, phoneNumber: event.target.value })} className="h-10 w-full rounded-lg border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-sm text-[#221C35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" />
            <textarea required minLength={10} maxLength={500} aria-label="Delivery address" placeholder="Full address" value={shipping.address} onChange={(event) => setShipping({ ...shipping, address: event.target.value })} rows={3} className="w-full rounded-lg border border-[#D3CCE2] bg-[#F5F3F8] p-3 text-sm text-[#221C35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" />
            <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} aria-label="PIN code" placeholder="6-digit PIN code" value={shipping.postalCode} onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value })} className="h-10 w-full rounded-lg border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-sm text-[#221C35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#483D76]/20" />
            <div>
              <label id="payment-mode-label" className="text-xs font-medium text-[#221C35]">Payment mode</label>
              <Select value={shipping.paymentMode} onValueChange={(paymentMode) => setShipping({ ...shipping, paymentMode })}>
                <SelectTrigger aria-labelledby="payment-mode-label" className="mt-1 h-12 rounded-xl border-[#D3CCE2] bg-[#F5F3F8] px-3 text-sm shadow-sm transition hover:border-[#BD6999] focus:ring-[#483D76]/20 [&>span]:!flex [&>span]:!min-w-0 [&>span]:!items-center [&>span]:!gap-2.5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#C8BCE0] bg-[#EBE4F2] text-[#483D76]"><WalletCards className="h-4 w-4" /></span>
                    <span className="truncate text-[#221C35]">{paymentLabels[shipping.paymentMode] ?? 'Choose payment mode'}</span>
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#D3CCE2] bg-white p-1.5 shadow-xl shadow-[#221C35]/10">
                  <SelectItem value="CASH_ON_DELIVERY" className="rounded-lg py-2.5 focus:bg-[#EBE4F2] focus:text-[#221C35]">
                    <span className="flex flex-col gap-0.5"><span className="font-medium text-[#221C35]">Cash on delivery</span><span className="text-xs text-[#766F8C]">Pay when your order arrives</span></span>
                  </SelectItem>
                  <SelectItem value="UPI" className="rounded-lg py-2.5 focus:bg-[#EBE4F2] focus:text-[#221C35]">
                    <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#483D76]" /><span className="flex flex-col gap-0.5"><span className="font-medium text-[#221C35]">UPI</span><span className="text-xs text-[#766F8C]">Not processed</span></span></span>
                  </SelectItem>
                  <SelectItem value="CARD" className="rounded-lg py-2.5 focus:bg-[#EBE4F2] focus:text-[#221C35]">
                    <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#483D76]" /><span className="flex flex-col gap-0.5"><span className="font-medium text-[#221C35]">Card</span><span className="text-xs text-[#766F8C]">Not processed</span></span></span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#766F8C]">{cart.length} item(s)</p><p className="mt-1 text-xl font-bold text-[#221C35]">₹{total}</p>
          <button disabled={!cart.length || busy} className="mt-3 w-full rounded-xl bg-[#483D76] px-4 py-3 font-semibold text-[#F5F3F8] transition hover:bg-[#372E5A] disabled:opacity-50">{busy ? 'Placing order…' : 'Place order'}</button>
        </form>
        <div className="rounded-3xl border border-[#D3CCE2] bg-white p-5 shadow-xs"><h2 className="font-bold text-[#221C35]">Your orders and receipts</h2><div className="mt-4 space-y-4">
          {data.orders.map((order) => <article key={order.id} className="border-t border-[#D3CCE2] pt-4">
            <div className="flex justify-between text-sm"><span className="font-semibold text-[#221C35]">{order.status.replaceAll('_', ' ')}</span><span className="text-[#221C35] font-bold">₹{order.total}</span></div>
            <p className="mt-1 text-xs text-[#766F8C]">{new Date(order.createdAt).toLocaleString('en-IN')} · {paymentLabels[order.paymentMode ?? ''] ?? 'Payment mode not recorded'}</p>
            <p className="mt-2 text-xs text-[#554E6B]">{getOrderItems(order.items).map(({ name }) => name).join(', ')}</p>
            {order.recipientName && <p className="mt-1 text-xs text-[#766F8C]">{order.recipientName} · {order.phoneNumber} · {order.address}, {order.postalCode}</p>}
            <a target="_blank" rel="noreferrer" href={`/api/orders/${order.id}/receipt`} className="mt-3 inline-block text-xs font-semibold text-[#483D76] hover:underline">Open / print receipt →</a>
            <div className="mt-2 flex gap-1">{stages.map((stage, index) => <div key={stage} title={stage} className={`h-1.5 flex-1 rounded-full ${stages.indexOf(order.status) >= index ? 'bg-[#483D76]' : 'bg-[#EAE6F0]'}`} />)}</div>
            {order.status !== 'DELIVERED' && <button type="button" onClick={() => void advance(order.id)} className="mt-3 text-xs font-semibold text-[#483D76] hover:underline">Advance order status →</button>}
          </article>)}
          {!data.orders.length && <p className="text-sm text-[#766F8C]">Your orders will show here.</p>}
        </div></div>
      </aside>
    </div>
    {message && <p role="status" className="mt-5 rounded-xl border border-[#C8BCE0] bg-[#EBE4F2] p-3 text-sm text-[#483D76]">{message}</p>}
  </main>
}
