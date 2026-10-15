import { NextResponse } from 'next/server'
import { ProfType } from '@prisma/client'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  gender: z.enum(['Female', 'Male', 'Non-binary', 'Prefer not to say']),
  type: z.nativeEnum(ProfType),
  experience: z.number().int().min(0).max(60),
  email: z.string().trim().email().max(254),
  phoneNumber: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/),
  licenseImage: z.string().min(1).max(3_000_000),
})

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  // Rate limiting to prevent storage/CPU flooding
  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(`prof-app:${ip}`, { windowMs: 15 * 60_000, maxRequests: 5 })
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many application submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide valid application details.' }, { status: 400 })
  }
  const parsed = applicationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Complete every required field and upload a valid license image.' }, { status: 400 })

  const cleanName = sanitizeText(parsed.data.name, 100)
  const cleanEmail = sanitizeEmail(parsed.data.email)

  if (cleanName.length < 2) {
    return NextResponse.json({ error: 'Please enter a valid applicant name.' }, { status: 400 })
  }

  const imageMatch = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(parsed.data.licenseImage)
  if (!imageMatch || !allowedMimeTypes.has(imageMatch[1])) {
    return NextResponse.json({ error: 'Upload a JPEG, PNG, or WebP license image.' }, { status: 400 })
  }
  const imageBytes = Buffer.from(imageMatch[2], 'base64')
  if (!imageBytes.length || imageBytes.length > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'License images must be 2 MB or smaller.' }, { status: 400 })
  }

  const existingUser = await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } })
  if (existingUser) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  const existingApplication = await db.professionalApplication.findUnique({ where: { email: cleanEmail } })
  if (existingApplication && existingApplication.status !== 'REJECTED') {
    return NextResponse.json({ error: 'An application with this email is already being reviewed or approved.' }, { status: 409 })
  }

  const applicationData = {
    name: cleanName,
    gender: parsed.data.gender,
    type: parsed.data.type,
    experience: parsed.data.experience,
    email: cleanEmail,
    phoneNumber: parsed.data.phoneNumber,
    licenseImage: parsed.data.licenseImage,
    licenseMimeType: imageMatch[1],
    status: 'PENDING' as const,
    reviewNotes: null,
    reviewedById: null,
    reviewedAt: null,
  }
  const application = existingApplication
    ? await db.professionalApplication.update({ where: { id: existingApplication.id }, data: applicationData })
    : await db.professionalApplication.create({ data: applicationData })

  return NextResponse.json({ id: application.id, status: application.status }, { status: 201 })
}
