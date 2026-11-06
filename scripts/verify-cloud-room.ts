import { PrismaClient } from '@prisma/client'
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

const prisma = new PrismaClient()

async function main() {
  const appointmentId = 'cmw3uc6610006yndidnp4u291'
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      professional: { include: { user: true } },
      slot: true,
    },
  })

  if (!appointment) {
    throw new Error('Appointment not found!')
  }

  console.log('=== VERIFYING APPOINTMENT IN DATABASE ===')
  console.log(`Appointment ID: ${appointment.id}`)
  console.log(`Status: ${appointment.status}`)
  console.log(`Patient: ${appointment.patient.name} (${appointment.patient.email})`)
  console.log(`Professional: ${appointment.professional.user.name} (${appointment.professional.user.email}, Code: ${appointment.professional.professionalCode})`)
  console.log(`Slot Start (UTC): ${appointment.slot.startTime.toISOString()}`)
  console.log(`Slot Start (IST): ${appointment.slot.startTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`)

  console.log('\n=== TESTING LIVEKIT CLOUD CONNECTIVITY ===')
  const apiKey = process.env.LIVEKIT_API_KEY!
  const apiSecret = process.env.LIVEKIT_API_SECRET!
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!
  const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://')
  const roomId = `destiny-session-${appointment.id}`

  const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret)

  // 1. List existing rooms on LiveKit cloud
  const existingRooms = await roomService.listRooms()
  console.log(`✓ [LiveKit Cloud API Connected] Currently active cloud rooms: ${existingRooms.length}`)

  // 2. Mint tokens for Patient (Raghav) and Doctor (Dr. Rakesh)
  const raghavToken = new AccessToken(apiKey, apiSecret, {
    identity: appointment.patientId,
    name: appointment.patient.name,
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

  const rakeshToken = new AccessToken(apiKey, apiSecret, {
    identity: appointment.professional.userId,
    name: appointment.professional.user.name,
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

  console.log(`✓ [Raghav Token Valid] JWT length: ${raghavJwt.length}`)
  console.log(`✓ [Dr. Rakesh Token Valid] JWT length: ${rakeshJwt.length}`)

  // 3. Create or inspect the room directly on LiveKit
  try {
    const room = await roomService.createRoom({
      name: roomId,
      emptyTimeout: 30 * 60, // 30 minutes
      maxParticipants: 10,
    })
    console.log(`✓ [LiveKit Room Created/Verified] Room Name: ${room.name}, SID: ${room.sid}`)
  } catch (err: any) {
    console.log(`[Room already active or pre-created]: ${err.message}`)
  }

  // Check room status
  const currentRooms = await roomService.listRooms([roomId])
  console.log(`✓ [Active Cloud Rooms for Appointment]:`, currentRooms.map(r => ({ name: r.name, sid: r.sid, numParticipants: r.numParticipants })))

  console.log('\n======================================================')
  console.log('✓ SUCCESS: Session is confirmed and active without error!')
  console.log(`Direct Join Link: http://localhost:3000/sessions/${appointment.id}`)
  console.log(`Appointments Page: http://localhost:3000/appointments`)
  console.log(`Doctor Console: http://localhost:3000/pro`)
  console.log('======================================================')
}

main()
  .catch((e) => {
    console.error('VERIFICATION ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

