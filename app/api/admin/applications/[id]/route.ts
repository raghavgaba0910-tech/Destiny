import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { formatProfessionalCode } from '@/lib/professional-code'
import { getTierPrice } from '@/lib/professional-pricing'
import { createProfessionalSchedule } from '@/lib/professional-schedule'
import { MailDeliveryError, sendProfessionalWelcome } from '@/lib/mail'
import bcrypt from 'bcryptjs'

const reviewSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  reviewNotes: z.string().trim().max(1000).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 403 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Provide a review decision.' }, { status: 400 })
  }
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Provide a valid review decision.' }, { status: 400 })
  const { id } = await params
  const application = await db.professionalApplication.findFirst({ where: { id, status: 'PENDING' } })
  if (!application) return NextResponse.json({ error: 'Pending application not found.' }, { status: 404 })

  if (parsed.data.decision === 'REJECT') {
    const result = await db.professionalApplication.updateMany({
      where: { id, status: 'PENDING' },
      data: {
        status: 'REJECTED',
        reviewNotes: parsed.data.reviewNotes || null,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    })
    if (!result.count) return NextResponse.json({ error: 'This application has already been reviewed.' }, { status: 409 })
    return NextResponse.json({ status: 'REJECTED' })
  }

  const temporaryPassword = `D${randomBytes(18).toString('base64url')}9`
  const passwordHash = await bcrypt.hash(temporaryPassword, 12)
  let created: { id: string; professionalCode: string }
  try {
    created = await db.$transaction(async (tx) => {
      const current = await tx.professionalApplication.findFirst({ where: { id, status: 'PENDING' } })
      if (!current) throw new Error('APPLICATION_ALREADY_REVIEWED')
      if (await tx.user.findUnique({ where: { email: current.email }, select: { id: true } })) {
        throw new Error('APPLICATION_EMAIL_EXISTS')
      }

      const existingCodes = await tx.professional.findMany({ select: { professionalCode: true } })
      const lastNumber = existingCodes.reduce((largest, { professionalCode }) => {
        const match = /^DT(\d{5})[TCP]$/.exec(professionalCode)
        return match ? Math.max(largest, Number(match[1])) : largest
      }, 0)
      const professionalCode = formatProfessionalCode(lastNumber + 1, current.type)
      const tier = current.experience < 2 ? 'A' : current.experience < 5 ? 'B' : 'C'
      const rating = 7.5
      const user = await tx.user.create({
        data: {
          name: current.name,
          email: current.email,
          role: current.type,
          passwordHash,
          mustChangePassword: true,
        },
      })
      const professional = await tx.professional.create({
        data: {
          professionalCode,
          userId: user.id,
          type: current.type,
          specialties: ['General support'],
          languages: ['English'],
          bio: `${current.name} is a Destiny professional with ${current.experience} years of experience.`,
          experience: current.experience,
          rating,
          pricePerSession: getTierPrice(tier, current.experience, rating),
          tier,
          isApproved: true,
        },
        select: { id: true, professionalCode: true },
      })
      const slots = createProfessionalSchedule(professional.id)
      await tx.slot.createMany({ data: slots })
      const reviewed = await tx.professionalApplication.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: 'APPROVED',
          reviewNotes: parsed.data.reviewNotes || null,
          reviewedById: session.user.id,
          reviewedAt: new Date(),
        },
      })
      if (!reviewed.count) throw new Error('APPLICATION_ALREADY_REVIEWED')
      return professional
    }, { timeout: 60_000 })
  } catch (error) {
    if (error instanceof Error && error.message === 'APPLICATION_ALREADY_REVIEWED') {
      return NextResponse.json({ error: 'This application has already been reviewed.' }, { status: 409 })
    }
    if (error instanceof Error && error.message === 'APPLICATION_EMAIL_EXISTS') {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }
    console.error('Professional approval failed:', error)
    return NextResponse.json({ error: 'The application could not be approved.' }, { status: 500 })
  }

  let emailDelivery: 'sent' | 'preview' | 'failed' = 'failed'
  let emailMessage = 'The account was approved, but email could not be delivered or previewed. Share the temporary password securely.'
  try {
    const result = await sendProfessionalWelcome({
      id: created.id,
      to: application.email,
      name: application.name,
      professionalCode: created.professionalCode,
      temporaryPassword,
    })
    emailDelivery = result.delivery
    emailMessage = result.message
  } catch (error) {
    console.error('Professional welcome email could not be delivered:', error)
    if (error instanceof MailDeliveryError && error.previewSaved) {
      emailMessage = 'Email delivery failed, but a local preview was saved. Share the temporary password securely.'
    }
  }
  return NextResponse.json({
    status: 'APPROVED',
    professionalCode: created.professionalCode,
    temporaryPassword,
    emailDelivery,
    emailMessage,
  })
}
