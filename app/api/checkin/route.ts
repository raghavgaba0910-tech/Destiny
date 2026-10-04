import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  medication: z.boolean(),
  exercise: z.boolean(),
  meditation: z.boolean(),
  supplements: z.boolean(),
})

function todayUtc() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const [completed, checkins] = await Promise.all([
    db.appointment.count({ where: { patientId: session.user.id, status: 'COMPLETED' } }),
    db.checkIn.findMany({ where: { userId: session.user.id }, orderBy: { date: 'desc' }, take: 7 }),
  ])
  return NextResponse.json({ unlocked: completed > 0, checkins })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Patient sign-in required.' }, { status: 401 })
  const completed = await db.appointment.count({ where: { patientId: session.user.id, status: 'COMPLETED' } })
  if (!completed) return NextResponse.json({ error: 'Complete your first session to unlock daily check-ins.' }, { status: 403 })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Check-in values are invalid.' }, { status: 400 })
  const checkin = await db.checkIn.upsert({
    where: { userId_date: { userId: session.user.id, date: todayUtc() } },
    create: { userId: session.user.id, date: todayUtc(), ...parsed.data },
    update: parsed.data,
  })
  return NextResponse.json(checkin)
}
