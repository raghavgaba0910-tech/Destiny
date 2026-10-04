import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slots = await db.slot.findMany({
    where: { professionalId: id, isBooked: false, startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
    take: 40,
  })
  return NextResponse.json(slots)
}
