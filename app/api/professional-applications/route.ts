import { NextResponse } from 'next/server'
import { ProfType } from '@prisma/client'
import { db } from '@/lib/db'
import { z } from 'zod'

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  gender: z.enum(['Female', 'Male', 'Non-binary', 'Prefer not to say']),
  type: z.nativeEnum(ProfType),
  experience: z.number().int().min(0).max(60),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  phoneNumber: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/),
  licenseImage: z.string().min(1).max(3_000_000),
})

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide valid application details.' }, { status: 400 })
  }
  const parsed = applicationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Complete every required field and upload a valid license image.' }, { status: 400 })

  const imageMatch = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(parsed.data.licenseImage)
  if (!imageMatch || !allowedMimeTypes.has(imageMatch[1])) {
    return NextResponse.json({ error: 'Upload a JPEG, PNG, or WebP license image.' }, { status: 400 })
  }
  const imageBytes = Buffer.from(imageMatch[2], 'base64')
  if (!imageBytes.length || imageBytes.length > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'License images must be 2 MB or smaller.' }, { status: 400 })
  }

  const existingUser = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } })
  if (existingUser) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  const existingApplication = await db.professionalApplication.findUnique({ where: { email: parsed.data.email } })
  if (existingApplication && existingApplication.status !== 'REJECTED') {
    return NextResponse.json({ error: 'An application with this email is already being reviewed or approved.' }, { status: 409 })
  }

  const applicationData = {
    name: parsed.data.name,
    gender: parsed.data.gender,
    type: parsed.data.type,
    experience: parsed.data.experience,
    email: parsed.data.email,
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
