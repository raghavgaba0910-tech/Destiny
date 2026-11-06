import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'
import { auth } from '@/auth'
import { db } from '@/lib/db'

interface TokenRequestBody {
  appointmentId?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate user via NextAuth
    const nextAuthSession = await auth()
    if (!nextAuthSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Sign-in required' }, { status: 401 })
    }

    const activeUser = {
      id: nextAuthSession.user.id,
      email: nextAuthSession.user.email,
      name: nextAuthSession.user.name,
      role: nextAuthSession.user.role,
    }

    // 2. Validate input
    let body: TokenRequestBody
    try {
      body = (await req.json()) as TokenRequestBody
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Invalid JSON body' },
        { status: 400 }
      )
    }

    const { appointmentId } = body
    if (
      !appointmentId ||
      typeof appointmentId !== 'string' ||
      !appointmentId.trim()
    ) {
      return NextResponse.json(
        { error: 'Bad Request: appointmentId is required and must be a valid string' },
        { status: 400 }
      )
    }

    const trimmedAppointmentId = appointmentId.trim()

    // 3. Query appointment from Prisma database
    const appointment = await db.appointment.findUnique({
      where: { id: trimmedAppointmentId },
      include: {
        professional: { include: { user: true } },
        patient: true,
        slot: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // 4. Verify participant permissions (patient, assigned professional, or admin)
    const isPatient =
      activeUser.id === appointment.patientId ||
      (!!activeUser.email &&
        activeUser.email.toLowerCase() === appointment.patient.email.toLowerCase())

    const isProfessional =
      activeUser.id === appointment.professional.userId ||
      (!!activeUser.email &&
        activeUser.email.toLowerCase() ===
          appointment.professional.user.email.toLowerCase())

    const isAdmin = activeUser.role === 'ADMIN'

    if (!isPatient && !isProfessional && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this consultation' },
        { status: 403 }
      )
    }

    // 5. Ensure consultation status is active
    if (
      appointment.status === 'COMPLETED' ||
      appointment.status === 'CANCELLED'
    ) {
      return NextResponse.json(
        { error: 'This consultation has already ended' },
        { status: 400 }
      )
    }

    // 6. LiveKit Configuration
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error(
        '[LiveKit Token Error] Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or NEXT_PUBLIC_LIVEKIT_URL in environment variables.'
      )
      return NextResponse.json(
        { error: 'LiveKit server configuration is incomplete' },
        { status: 500 }
      )
    }

    const displayName =
      activeUser.name ||
      activeUser.email ||
      (isProfessional ? 'Healthcare Provider' : 'Client')

    // 7. Mint LiveKit AccessToken
    // ttl is set to 4 hours so full consultations (15-20 min or extended) run smoothly without token expiration
    const at = new AccessToken(apiKey, apiSecret, {
      identity: activeUser.id,
      name: displayName,
      ttl: '4h',
    })

    at.addGrant({
      room: `destiny-session-${trimmedAppointmentId}`,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    return NextResponse.json({
      token,
      wsUrl,
    })
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('[Session Token Route Error]:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    )
  }
}
