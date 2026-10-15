import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email address').max(254, 'Email is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password cannot exceed 72 characters'),
})

export async function POST(req: NextRequest) {
  // 1. Rate limiting on registration
  const ip = getClientIp(req)
  const rateLimit = checkRateLimit(`register:${ip}`, { windowMs: 15 * 60_000, maxRequests: 5 })
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)) },
      }
    )
  }

  // 2. Safe JSON parsing
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 })
  }

  // 3. Validation
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  // 4. Sanitization
  const cleanName = sanitizeText(parsed.data.name, 100)
  const cleanEmail = sanitizeEmail(parsed.data.email)

  if (cleanName.length < 2) {
    return NextResponse.json({ error: 'Please enter a valid name.' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email: cleanEmail } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  await db.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'PATIENT',
    },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
