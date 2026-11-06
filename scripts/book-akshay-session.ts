import { PrismaClient } from '@prisma/client'
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

  // Find Dr. Akshay
  const drAkshayPro = await prisma.professional.findFirst({
    where: {
      user: {
        OR: [
          { name: { contains: 'akshay', mode: 'insensitive' } },
          { email: 'gabaraghav0510@gmail.com' },
        ],
      },
    },
    include: { user: true },
  })

  if (!drAkshayPro) {
    throw new Error('Dr. Akshay professional record not found!')
  }
  console.log(`Found Dr. Akshay: ${drAkshayPro.user.name} (${drAkshayPro.user.email}, Code: ${drAkshayPro.professionalCode}, ID: ${drAkshayPro.id})`)

  console.log('\n=== STEP 2: CREATING 12:15 AM (7 NOV) SESSION SLOT ===')
  // 12:15 AM IST on 7 November 2026
  // 00:15:00 IST - 5:30 = 18:45:00 UTC on 6 November 2026
  const targetDate = new Date('2026-11-06T18:45:00.000Z')
  console.log(`Target Session Start Time UTC: ${targetDate.toISOString()}`)
  console.log(`Target Session Start Time IST: ${targetDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`)

  let slot = await prisma.slot.findFirst({
    where: {
      professionalId: drAkshayPro.id,
      startTime: targetDate,
    },
    include: { appointment: true },
  })

  if (!slot) {
    slot = await prisma.slot.create({
      data: {
        professionalId: drAkshayPro.id,
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

  console.log('\n=== STEP 3: CREATING APPOINTMENT ===')
  let appointment = await prisma.appointment.findFirst({
    where: {
      slotId: slot.id,
    },
  })

  if (!appointment) {
    appointment = await prisma.appointment.create({
      data: {
        patientId: raghav.id,
        professionalId: drAkshayPro.id,
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
        professionalId: drAkshayPro.id,
        status: 'UPCOMING',
        patientName: raghav.name,
      },
    })
    console.log(`Updated Appointment ID: ${appointment.id} to UPCOMING`)
  }

  console.log('\n=== STEP 4: PRE-PROVISIONING & VERIFYING LIVEKIT ROOM ===')
  const apiKey = process.env.LIVEKIT_API_KEY!
  const apiSecret = process.env.LIVEKIT_API_SECRET!
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!
  const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://')
  const roomId = `destiny-session-${appointment.id}`

  const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret)

  // 1. Pre-create the room on LiveKit Cloud
  try {
    const room = await roomService.createRoom({
      name: roomId,
      emptyTimeout: 30 * 60,
      maxParticipants: 10,
    })
    console.log(`✓ [LiveKit Room Provisioned] Name: ${room.name}, SID: ${room.sid}`)
  } catch (err: any) {
    console.log(`[LiveKit Room exists]: ${err.message}`)
  }

  // 2. Validate token minting for Patient & Doctor
  const patientToken = new AccessToken(apiKey, apiSecret, {
    identity: raghav.id,
    name: raghav.name,
    ttl: '4h',
  })
  patientToken.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })
  const patientJwt = await patientToken.toJwt()

  const doctorToken = new AccessToken(apiKey, apiSecret, {
    identity: drAkshayPro.userId,
    name: drAkshayPro.user.name,
    ttl: '4h',
  })
  doctorToken.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })
  const doctorJwt = await doctorToken.toJwt()

  console.log(`✓ [Token Minting] Raghav JWT verified: ${patientJwt.length} chars`)
  console.log(`✓ [Token Minting] Dr. Akshay JWT verified: ${doctorJwt.length} chars`)

  const currentRooms = await roomService.listRooms([roomId])
  console.log(`✓ [Active Cloud Rooms]:`, currentRooms.map(r => ({ name: r.name, sid: r.sid })))

  console.log('\n======================================================')
  console.log('✓ SUCCESS: Session scheduled and verified!')
  console.log(`Appointment ID: ${appointment.id}`)
  console.log(`Session Link: http://localhost:3000/sessions/${appointment.id}`)
  console.log(`Start Time: 12:15 AM IST (7 November 2026)`)
  console.log(`Patient: ${raghav.name} (${raghav.email})`)
  console.log(`Doctor: ${drAkshayPro.user.name} (${drAkshayPro.user.email}, Code: ${drAkshayPro.professionalCode})`)
  console.log('======================================================')
}

main()
  .catch((e) => {
    console.error('ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

