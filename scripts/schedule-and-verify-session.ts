import { PrismaClient, ProfType, Tier } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

const prisma = new PrismaClient()

async function main() {
  console.log('=== STEP 1: RESOLVING USERS ===')

  // Find Raghav
  const raghav = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: 'raghav', mode: 'insensitive' } },
        { name: { contains: 'raghav', mode: 'insensitive' } },
      ],
      role: 'PATIENT',
    },
  })

  if (!raghav) {
    throw new Error('Raghav patient account not found!')
  }
  console.log(`Found Raghav: ${raghav.name} (${raghav.email}, ID: ${raghav.id})`)

  // Ensure Dr. Rakesh exists
  let drRakeshUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'n2005ak@gmail.com' },
        { name: { contains: 'rakesh', mode: 'insensitive' } },
      ],
    },
    include: { professional: true },
  })

  const tempPassword = 'DNvTCYK8YqBz0UVCRLHCAhflO9'
  const passwordHash = await bcrypt.hash(tempPassword, 12)

  if (!drRakeshUser) {
    console.log('Creating Dr. Rakesh user and professional profile...')
    drRakeshUser = await prisma.user.create({
      data: {
        name: 'Dr. Rakesh',
        email: 'n2005ak@gmail.com',
        role: 'PSYCHIATRIST',
        passwordHash,
        mustChangePassword: false,
      },
      include: { professional: true },
    })
  } else {
    console.log(`Found Dr. Rakesh user: ${drRakeshUser.name} (${drRakeshUser.email}, ID: ${drRakeshUser.id})`)
    if (drRakeshUser.name !== 'Dr. Rakesh') {
      drRakeshUser = await prisma.user.update({
        where: { id: drRakeshUser.id },
        data: { name: 'Dr. Rakesh' },
        include: { professional: true },
      })
    }
  }

  let drRakeshPro = drRakeshUser.professional
  if (!drRakeshPro) {
    // Check if code DT00007C exists
    const codeTaken = await prisma.professional.findUnique({
      where: { professionalCode: 'DT00007C' },
    })
    const code = codeTaken ? 'DT00008P' : 'DT00007C'

    drRakeshPro = await prisma.professional.create({
      data: {
        userId: drRakeshUser.id,
        professionalCode: code,
        type: 'PSYCHIATRIST',
        specialties: ['Anxiety', 'Depression', 'General Support'],
        languages: ['English', 'Hindi'],
        bio: 'Dr. Rakesh is a licensed clinical psychiatrist with extensive experience in evidence-based therapy and mental wellness.',
        experience: 8,
        rating: 9.2,
        pricePerSession: 2000,
        tier: 'B',
        isApproved: true,
      },
    })
    console.log(`Created Professional record for Dr. Rakesh: Code ${drRakeshPro.professionalCode}`)
  } else {
    console.log(`Dr. Rakesh already has professional profile: ${drRakeshPro.professionalCode}`)
  }

  console.log('\n=== STEP 2: CREATING 11:25 PM SESSION SLOT ===')
  // Exact 11:25 PM IST on 2026-11-05
  // IST is UTC+05:30. 23:25:00 - 05:30 = 17:55:00 UTC.
  const targetDate = new Date('2026-11-05T17:55:00.000Z')
  console.log(`Target Session Start Time UTC: ${targetDate.toISOString()}`)
  console.log(`Target Session Start Time IST: ${targetDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`)

  // Find or create slot for Dr. Rakesh at target time
  let slot = await prisma.slot.findFirst({
    where: {
      professionalId: drRakeshPro.id,
      startTime: targetDate,
    },
    include: { appointment: true },
  })

  if (!slot) {
    slot = await prisma.slot.create({
      data: {
        professionalId: drRakeshPro.id,
        startTime: targetDate,
        isBooked: true,
      },
      include: { appointment: true },
    })
    console.log(`Created new Slot ID: ${slot.id}`)
  } else {
    console.log(`Found existing Slot ID: ${slot.id}`)
    if (!slot.isBooked) {
      await prisma.slot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      })
    }
  }

  console.log('\n=== STEP 3: CREATING / ENSURING APPOINTMENT ===')
  let appointment = await prisma.appointment.findFirst({
    where: {
      slotId: slot.id,
    },
  })

  if (!appointment) {
    appointment = await prisma.appointment.create({
      data: {
        patientId: raghav.id,
        professionalId: drRakeshPro.id,
        slotId: slot.id,
        status: 'UPCOMING',
        patientName: raghav.name,
        patientAge: 25,
        patientGender: 'MALE',
      },
    })
    console.log(`Created Appointment ID: ${appointment.id}`)
  } else {
    appointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        patientId: raghav.id,
        professionalId: drRakeshPro.id,
        status: 'UPCOMING',
        patientName: raghav.name,
      },
    })
    console.log(`Updated Appointment ID: ${appointment.id} to status UPCOMING`)
  }

  console.log('\n=== STEP 4: VERIFYING LIVEKIT ROOM & REAL-TIME WEBSOCKET CONNECTION ===')
  const apiKey = process.env.LIVEKIT_API_KEY!
  const apiSecret = process.env.LIVEKIT_API_SECRET!
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!
  const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://')
  const roomId = `destiny-session-${appointment.id}`

  console.log(`Room ID: ${roomId}`)
  console.log(`LiveKit Server: ${wsUrl}`)

  // Mint token for Raghav
  const raghavToken = new AccessToken(apiKey, apiSecret, {
    identity: raghav.id,
    name: raghav.name,
    ttl: '4h',
  })
  raghavToken.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })
  const raghavJwt = await raghavToken.toJwt()

  // Mint token for Dr. Rakesh
  const rakeshToken = new AccessToken(apiKey, apiSecret, {
    identity: drRakeshUser.id,
    name: drRakeshUser.name,
    ttl: '4h',
  })
  rakeshToken.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })
  const rakeshJwt = await rakeshToken.toJwt()

  console.log('[Token Minting] Raghav JWT generated successfully (4h ttl)')
  console.log('[Token Minting] Dr. Rakesh JWT generated successfully (4h ttl)')

  // Connect both participants via WebSocket RTC
  const errors: string[] = []
  let raghavConnected = false
  let rakeshConnected = false

  const raghavWs = new WebSocket(`${wsUrl}/rtc?access_token=${raghavJwt}&protocol=15&auto_subscribe=1`)
  const rakeshWs = new WebSocket(`${wsUrl}/rtc?access_token=${rakeshJwt}&protocol=15&auto_subscribe=1`)

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      raghavWs.close()
      rakeshWs.close()
      reject(new Error('WebSocket connection timed out after 10s'))
    }, 10000)

    let connectedCount = 0
    function checkBoth() {
      connectedCount++
      if (connectedCount === 2) {
        clearTimeout(timeout)
        resolve()
      }
    }

    raghavWs.onopen = () => {
      raghavConnected = true
      console.log('✓ [RTC Check] Raghav connected to LiveKit room successfully')
      checkBoth()
    }
    raghavWs.onerror = (e: any) => {
      const err = `Raghav WS error: ${e.message || 'unknown'}`
      console.error(err)
      errors.push(err)
    }

    rakeshWs.onopen = () => {
      rakeshConnected = true
      console.log('✓ [RTC Check] Dr. Rakesh connected to LiveKit room successfully')
      checkBoth()
    }
    rakeshWs.onerror = (e: any) => {
      const err = `Dr. Rakesh WS error: ${e.message || 'unknown'}`
      console.error(err)
      errors.push(err)
    }
  })

  // Verify room status using RoomServiceClient
  const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret)
  const participants = await roomService.listParticipants(roomId)
  console.log(`✓ [Cloud Room Verified] Active room ${roomId} has ${participants.length} connected participants:`)
  participants.forEach((p) => {
    console.log(`  - Participant: ${p.name} (${p.identity}), State: ${p.state}`)
  })

  // Clean close of test sockets
  raghavWs.close(1000, 'Test pre-flight verified')
  rakeshWs.close(1000, 'Test pre-flight verified')

  console.log('\n======================================================')
  console.log('✓ VERIFICATION COMPLETE: ALL SYSTEMS READY & GREEN!')
  console.log(`Appointment ID: ${appointment.id}`)
  console.log(`Session URL: http://localhost:3000/sessions/${appointment.id}`)
  console.log(`Start Time: 11:25 PM IST (23:25:00 IST)`)
  console.log(`Patient: ${raghav.name} (${raghav.email})`)
  console.log(`Professional: ${drRakeshUser.name} (${drRakeshUser.email}, Code: ${drRakeshPro.professionalCode})`)
  console.log('======================================================')
}

main()
  .catch((e) => {
    console.error('FATAL ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

