import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const nextStatus: Record<string, 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | null> = {
  PLACED: 'PACKED',
  PACKED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
  DELIVERED: null,
}

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const { id } = await params
  const order = await db.order.findFirst({ where: { id, userId: session.user.id } })
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  const status = nextStatus[order.status]
  if (!status) return NextResponse.json({ error: 'This order is already delivered.' }, { status: 409 })
  const updated = await db.order.updateMany({ where: { id, userId: session.user.id, status: order.status }, data: { status } })
  if (!updated.count) return NextResponse.json({ error: 'Order status changed. Refresh and try again.' }, { status: 409 })
  return NextResponse.json({ status })
}
