import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const [medicines, prescriptions, orders] = await Promise.all([
    db.medicine.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
    db.prescription.findMany({ where: { patientId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 }),
    db.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])
  const latestMedicines = prescriptions[0]?.medicines
  const allowedPrescriptionItems = Array.isArray(latestMedicines)
    ? latestMedicines.flatMap((item) => {
      if (typeof item === 'string') return [item]
      if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') return [item.name]
      return []
    })
    : []
  return NextResponse.json({ medicines, allowedPrescriptionItems, orders })
}
