import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({ medicineIds: z.array(z.string()).min(1).max(20) })

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Patient sign-in required.' }, { status: 401 })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Choose at least one medicine.' }, { status: 400 })
  const [medicines, prescriptions] = await Promise.all([
    db.medicine.findMany({ where: { id: { in: parsed.data.medicineIds } } }),
    db.prescription.findMany({ where: { patientId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 }),
  ])
  if (medicines.length !== new Set(parsed.data.medicineIds).size) return NextResponse.json({ error: 'One or more items are unavailable.' }, { status: 400 })
  const rxList = prescriptions[0]?.medicines
  const allowed = Array.isArray(rxList)
    ? rxList.flatMap((item) => {
      if (typeof item === 'string') return [item]
      if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') return [item.name]
      return []
    })
    : []
  if (medicines.some((medicine) => medicine.type === 'PRESCRIPTION' && !allowed.includes(medicine.name))) {
    return NextResponse.json({ error: 'Prescription medicines must appear on your latest psychiatrist-issued prescription.' }, { status: 403 })
  }
  const items = medicines.map(({ id, name, price }) => ({ id, name, price }))
  const order = await db.order.create({
    data: { userId: session.user.id, items, total: medicines.reduce((sum, medicine) => sum + medicine.price, 0) },
  })
  return NextResponse.json({ id: order.id }, { status: 201 })
}
