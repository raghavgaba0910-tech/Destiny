import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sanitizeText } from '@/lib/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  medicineIds: z.array(z.string().min(1)).min(1).max(20),
  recipientName: z.string().trim().min(2).max(100),
  phoneNumber: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/),
  address: z.string().trim().min(10).max(500),
  postalCode: z.string().trim().regex(/^\d{6}$/),
  paymentMode: z.enum(['CASH_ON_DELIVERY', 'UPI', 'CARD']),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Patient sign-in required.' }, { status: 403 })
  }

  // Rate limiting for order placements
  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(`order:${session.user.id}:${ip}`, { windowMs: 10 * 60_000, maxRequests: 10 })
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many order requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide valid order details.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Provide a valid shipping name, phone, address, PIN code, payment mode, and at least one medicine.' }, { status: 400 })

  const cleanRecipientName = sanitizeText(parsed.data.recipientName, 100)
  const cleanAddress = sanitizeText(parsed.data.address, 500)
  const cleanPhone = sanitizeText(parsed.data.phoneNumber, 20)
  const cleanPostal = sanitizeText(parsed.data.postalCode, 6)

  if (cleanRecipientName.length < 2 || cleanAddress.length < 10) {
    return NextResponse.json({ error: 'Provide a valid name and full address.' }, { status: 400 })
  }

  if (new Set(parsed.data.medicineIds).size !== parsed.data.medicineIds.length) return NextResponse.json({ error: 'Each medicine can be ordered only once per order.' }, { status: 400 })
  const [medicines, prescriptions] = await Promise.all([
    db.medicine.findMany({ where: { id: { in: parsed.data.medicineIds } } }),
    db.prescription.findMany({ where: { patientId: session.user.id }, orderBy: { createdAt: 'desc' } }),
  ])
  if (medicines.length !== new Set(parsed.data.medicineIds).size) return NextResponse.json({ error: 'One or more items are unavailable.' }, { status: 400 })
  const allowed = prescriptions.flatMap(({ medicines: rxList }) => Array.isArray(rxList)
    ? rxList.flatMap((item) => {
      if (typeof item === 'string') return [item]
      if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') return [item.name]
      return []
    })
    : [])
  if (medicines.some((medicine) => medicine.type === 'PRESCRIPTION' && !allowed.includes(medicine.name))) {
    return NextResponse.json({ error: 'Prescription medicines must appear on your latest psychiatrist-issued prescription.' }, { status: 403 })
  }
  const items = medicines.map(({ id, name, price }) => ({ id, name, price }))
  const order = await db.order.create({
    data: {
      userId: session.user.id,
      items,
      total: medicines.reduce((sum, medicine) => sum + medicine.price, 0),
      recipientName: cleanRecipientName,
      phoneNumber: cleanPhone,
      address: cleanAddress,
      postalCode: cleanPostal,
      paymentMode: parsed.data.paymentMode,
    },
  })
  return NextResponse.json({ id: order.id }, { status: 201 })
}
