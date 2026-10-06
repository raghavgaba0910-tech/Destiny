import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide your current and new passwords.' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Use a new password with at least 8 characters, one uppercase letter, and one number.' }, { status: 400 })
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json({ error: 'Choose a new password different from the temporary password.' }, { status: 400 })
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || !await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: 'The current password is incorrect.' }, { status: 403 })
  }
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12), mustChangePassword: false },
  })
  return NextResponse.json({ success: true })
}
