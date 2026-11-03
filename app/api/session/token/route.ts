import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { AccessToken } from 'livekit-server-sdk'
import { auth } from '@/auth'
import { db } from '@/lib/db'

interface AppointmentRecord {
  id: string
  therapist_id: string
  patient_id: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

interface TokenRequestBody {
  appointmentId?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Framework & Auth: Check Supabase session if configured, with NextAuth fallback
    let activeUser: { id: string; email?: string | null } | null = null
    let supabase: ReturnType<typeof createServerClient> | null = null

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const cookieStore = await cookies()
        supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // Handled safely if called in an environment restricting cookie sets
              }
            },
          },
        })

        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser()

        if (supabaseUser) {
          activeUser = { id: supabaseUser.id, email: supabaseUser.email }
        }
      } catch (err) {
        console.warn('[Supabase Auth skipped/failed]:', err)
      }
    }

    if (!activeUser) {
      const nextAuthSession = await auth()
      if (nextAuthSession?.user?.id) {
        activeUser = {
          id: nextAuthSession.user.id,
          email: nextAuthSession.user.email,
        }
      }
    }

    if (!activeUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Input & DB Verification
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

    // Query appointments table via Supabase (if configured), with fallback to Prisma for website bookings
    let isParticipant = false
    let isEnded = false
    let appointmentFound = false

    if (supabase) {
      try {
        const { data, error: dbError } = await (
          supabase
            .from('appointments')
            .select('id, therapist_id, patient_id, status')
            .eq('id', trimmedAppointmentId)
            .single() as Promise<{ data: AppointmentRecord | null; error: unknown }>
        )
        const appointment = data

        if (appointment && !dbError) {
          appointmentFound = true
          isParticipant =
            activeUser.id === appointment.therapist_id ||
            activeUser.id === appointment.patient_id
          isEnded =
            appointment.status === 'completed' ||
            appointment.status === 'cancelled'
        }
      } catch {
        // Supabase query failed or table not populated, check Prisma
      }
    }

    if (!appointmentFound) {
      const prismaAppointment = await db.appointment.findUnique({
        where: { id: trimmedAppointmentId },
        include: { professional: { include: { user: true } }, patient: true },
      })

      if (!prismaAppointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      appointmentFound = true
      isParticipant =
        activeUser.id === prismaAppointment.patientId ||
        activeUser.id === prismaAppointment.professional.userId ||
        (!!activeUser.email && activeUser.email.toLowerCase() === prismaAppointment.patient.email.toLowerCase()) ||
        (!!activeUser.email && activeUser.email.toLowerCase() === prismaAppointment.professional.user.email.toLowerCase())

      isEnded =
        prismaAppointment.status === 'COMPLETED' ||
        prismaAppointment.status === 'CANCELLED'
    }

    // Verify user is a participating therapist or patient
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this consultation' },
        { status: 403 }
      )
    }

    // Ensure appointment is active
    if (isEnded) {
      return NextResponse.json(
        { error: 'This consultation has already ended' },
        { status: 400 }
      )
    }

    // 3. LiveKit AccessToken Generation
    let apiKey = process.env.LIVEKIT_API_KEY
    if (!apiKey || apiKey.includes('your_livekit')) {
      apiKey = 'APIKagamHKrErvH'
    }

    let apiSecret = process.env.LIVEKIT_API_SECRET
    if (!apiSecret || apiSecret.includes('your_livekit')) {
      apiSecret = 'aK0tYmXHFwiKpS2BX0Ka9fiu4VfebJK8mLlhDIhe30zD'
    }

    let wsUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL
    if (!wsUrl || wsUrl.includes('your-project')) {
      wsUrl = 'wss://destiny-video-sessions-som6m6u1.livekit.cloud'
    }

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error(
        '[LiveKit Token Error] Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or NEXT_PUBLIC_LIVEKIT_URL in process.env'
      )
      return NextResponse.json(
        { error: 'LiveKit server configuration is incomplete' },
        { status: 500 }
      )
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: activeUser.id,
      name: activeUser.email ?? 'Participant',
      ttl: '1h',
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
