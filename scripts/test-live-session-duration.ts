import fs from 'fs'
import path from 'path'
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

// Load .env
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    }
  })
}

interface SessionStats {
  doctorMsgs: number
  patientMsgs: number
  errors: string[]
  doctorConnected: boolean
  patientConnected: boolean
}

async function runSessionTest(durationMinutes: number) {
  const apiKey = process.env.LIVEKIT_API_KEY!
  const apiSecret = process.env.LIVEKIT_API_SECRET!
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!
  const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://')
  const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret)

  const roomId = `session-verify-${Date.now()}`
  console.log(`[TEST SESSION START] Room: ${roomId}`)
  console.log(`Target duration: ${durationMinutes} minutes`)
  console.log(`Server URL: ${wsUrl}`)

  // 1. Generate Tokens (ttl: 4h ensures zero token expiration during session)
  const doctorToken = new AccessToken(apiKey, apiSecret, {
    identity: `doctor-${Date.now()}`,
    name: 'Dr. Sarah Jenkins (Psychiatrist)',
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

  const patientToken = new AccessToken(apiKey, apiSecret, {
    identity: `patient-${Date.now()}`,
    name: 'Alex Morgan (Client)',
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

  const stats: SessionStats = {
    doctorMsgs: 0,
    patientMsgs: 0,
    errors: [],
    doctorConnected: false,
    patientConnected: false,
  }

  // 2. Connect Doctor
  const doctorWsUrl = `${wsUrl}/rtc?access_token=${doctorJwt}&protocol=15&auto_subscribe=1`
  const doctorWs = new WebSocket(doctorWsUrl)

  doctorWs.onopen = () => {
    stats.doctorConnected = true
    console.log('[Doctor] Connected to LiveKit Cloud RTC room successfully.')
  }
  doctorWs.onmessage = () => {
    stats.doctorMsgs++
  }
  doctorWs.onerror = (e: any) => {
    const err = `[Doctor Error]: ${e.message || 'WebSocket Error'}`
    console.error(err)
    stats.errors.push(err)
  }
  doctorWs.onclose = (e) => {
    stats.doctorConnected = false
    console.log(`[Doctor] Connection closed (code: ${e.code}, reason: ${e.reason || 'None'})`)
  }

  // 3. Connect Patient
  const patientWsUrl = `${wsUrl}/rtc?access_token=${patientJwt}&protocol=15&auto_subscribe=1`
  const patientWs = new WebSocket(patientWsUrl)

  patientWs.onopen = () => {
    stats.patientConnected = true
    console.log('[Patient] Connected to LiveKit Cloud RTC room successfully.')
  }
  patientWs.onmessage = () => {
    stats.patientMsgs++
  }
  patientWs.onerror = (e: any) => {
    const err = `[Patient Error]: ${e.message || 'WebSocket Error'}`
    console.error(err)
    stats.errors.push(err)
  }
  patientWs.onclose = (e) => {
    stats.patientConnected = false
    console.log(`[Patient] Connection closed (code: ${e.code}, reason: ${e.reason || 'None'})`)
  }

  // Wait 3 seconds for initial joins to register
  await new Promise((r) => setTimeout(r, 3000))

  // Verify room on LiveKit Cloud API
  const rooms = await roomService.listRooms([roomId])
  console.log(`[Cloud API] Active rooms matching ${roomId}:`, rooms.length)
  if (rooms.length > 0) {
    console.log(`[Cloud API] Room Name: ${rooms[0].name}, Participants: ${rooms[0].numParticipants}`)
  }

  const participants = await roomService.listParticipants(roomId)
  console.log(`[Cloud API] Room participants (${participants.length}):`, participants.map(p => ({
    identity: p.identity,
    name: p.name,
    joinedAt: p.joinedAt,
    state: p.state,
  })))

  // 4. Run loop for the target duration, checking health every 30 seconds
  const totalDurationMs = durationMinutes * 60 * 1000
  const checkIntervalMs = 30 * 1000
  const startTime = Date.now()

  let elapsedMinutes = 0

  while (Date.now() - startTime < totalDurationMs) {
    await new Promise((r) => setTimeout(r, checkIntervalMs))
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000)
    elapsedMinutes = Number((elapsedSeconds / 60).toFixed(1))

    // Check Cloud room state
    try {
      const currentParticipants = await roomService.listParticipants(roomId)
      console.log(
        `[HEALTH CHECK ${elapsedMinutes}m / ${durationMinutes}m] ` +
        `Doctor Connected: ${stats.doctorConnected} (msgs: ${stats.doctorMsgs}) | ` +
        `Patient Connected: ${stats.patientConnected} (msgs: ${stats.patientMsgs}) | ` +
        `Active Participants on Cloud: ${currentParticipants.length} | ` +
        `Errors: ${stats.errors.length}`
      )
    } catch (err: any) {
      console.warn(`[Health Check Warn] Failed to query room service: ${err.message}`)
    }

    if (stats.errors.length > 0) {
      console.error('[TEST FAILED] Errors encountered during session:', stats.errors)
      break
    }
  }

  // 5. Clean teardown
  console.log(`[TEST SESSION COMPLETE] Total elapsed time: ${elapsedMinutes} minutes. Closing connections cleanly.`)
  doctorWs.close(1000, 'Session Completed Normal')
  patientWs.close(1000, 'Session Completed Normal')

  await new Promise((r) => setTimeout(r, 1000))

  if (stats.errors.length === 0) {
    console.log(`>>> SUCCESS: Live consultation session ran without any errors for ${elapsedMinutes} minutes! <<<`)
  } else {
    console.error(`>>> FAILED: Encountered ${stats.errors.length} errors during session test <<<`)
    process.exit(1)
  }
}

// Read duration from command line args (default: 15 minutes)
const durationArg = process.argv[2] ? parseFloat(process.argv[2]) : 15
runSessionTest(durationArg).catch((err) => {
  console.error('[Fatal Error in runSessionTest]:', err)
  process.exit(1)
})

