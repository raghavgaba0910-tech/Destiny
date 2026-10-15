import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sanitizeText } from '@/lib/sanitize'

const schema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
  adminResponse: z.string().trim().max(2000).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 403 })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide a valid support update.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Provide a valid support status and response.' }, { status: 400 })
  const { id } = await params
  const cleanResponse = parsed.data.adminResponse ? sanitizeText(parsed.data.adminResponse, 2000) : null
  const updated = await db.supportTicket.updateMany({
    where: { id },
    data: { status: parsed.data.status, adminResponse: cleanResponse },
  })
  if (!updated.count) return NextResponse.json({ error: 'Support ticket not found.' }, { status: 404 })
  return NextResponse.json({ status: parsed.data.status })
}
