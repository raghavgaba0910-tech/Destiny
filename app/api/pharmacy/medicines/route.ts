import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Patient sign-in required.' }, { status: 401 })
  const [medicines, prescriptions, orders] = await Promise.all([
    db.medicine.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
    db.prescription.findMany({
      where: { patientId: session.user.id },
      include: {
        appointment: {
          select: {
            patientName: true,
            professional: {
              select: {
                type: true,
                user: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])
  const allowedPrescriptionItems = prescriptions.flatMap(({ medicines: items }) => Array.isArray(items)
    ? items.flatMap((item) => {
      if (typeof item === 'string') return [item]
      if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') return [item.name]
      return []
    })
    : [])
  return NextResponse.json({ medicines, allowedPrescriptionItems, prescriptions, orders })
}
