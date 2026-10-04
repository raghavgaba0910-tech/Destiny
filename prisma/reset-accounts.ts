import { Prisma, PrismaClient, ProfType, Tier } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { formatProfessionalCode } from '../lib/professional-code'

const prisma = new PrismaClient()
const passwordHashPromise = bcrypt.hash('Demo@1234', 12)
const patientDefinitions = [
  { email: 'patient1@demo.destiny', name: 'Aisha Sharma', role: 'PATIENT' as const },
  { email: 'patient2@demo.destiny', name: 'Rohan Mehta', role: 'PATIENT' as const },
]
type ClinicianAccount = {
  email: string
  name: string
  role: ProfType
  type: ProfType
  specialties: string[]
  experience: number
  rating: number
  pricePerSession: number
  tier: Tier
}
const clinicianDefinitions: ClinicianAccount[] = [
  { email: 'psychiatrist@demo.destiny', name: 'Dr. Mira Rao', role: 'PSYCHIATRIST', type: 'PSYCHIATRIST', specialties: ['Anxiety', 'Depression'], experience: 6, rating: 9.2, pricePerSession: 3000, tier: 'C' },
  { email: 'counsellor@demo.destiny', name: 'Aarav Sen', role: 'COUNSELLOR', type: 'COUNSELLOR', specialties: ['Anxiety', 'Stress', 'Life transitions'], experience: 3, rating: 8.1, pricePerSession: 1800, tier: 'B' },
  { email: 'therapist@demo.destiny', name: 'Dr. Neha Kapoor', role: 'THERAPIST', type: 'THERAPIST', specialties: ['Anxiety', 'Depression', 'Relationships'], experience: 4, rating: 8.5, pricePerSession: 2200, tier: 'B' },
]
const accountDefinitions = [...patientDefinitions, ...clinicianDefinitions]
const accountEmails = accountDefinitions.map(({ email }) => email)
const clinicianEmails = clinicianDefinitions.map(({ email }) => email)
async function nextProfessionalCode(tx: Prisma.TransactionClient, type: ProfType) {
  for (let number = 1; number <= 99_999; number += 1) {
    const code = formatProfessionalCode(number, type)
    if (!await tx.professional.findUnique({ where: { professionalCode: code }, select: { id: true } })) return code
  }
  throw new Error(`No available professional IDs remain for ${type}.`)
}

async function main() {
  const passwordHash = await passwordHashPromise
  const summary = await prisma.$transaction(async (tx) => {
    const seededUsers = []
    for (const account of accountDefinitions) {
      seededUsers.push(await tx.user.upsert({
        where: { email: account.email },
        update: { name: account.name, role: account.role },
        create: { name: account.name, email: account.email, passwordHash, role: account.role },
      }))
    }

    const professionals = []
    for (const account of clinicianDefinitions) {
      const user = seededUsers.find((candidate) => candidate.email === account.email)
      if (!user) throw new Error(`Could not prepare the account ${account.email}.`)
      const existing = await tx.professional.findUnique({ where: { userId: user.id } })
      const type = account.type
      professionals.push(await tx.professional.upsert({
        where: { userId: user.id },
        update: {
          type,
          specialties: account.specialties,
          languages: ['Hindi', 'English'],
          bio: `${account.name} offers thoughtful, confidential support for young adults.`,
          experience: account.experience,
          rating: account.rating,
          pricePerSession: account.pricePerSession,
          tier: account.tier,
        },
        create: {
          professionalCode: existing?.professionalCode ?? await nextProfessionalCode(tx, type),
          type,
          userId: user.id,
          specialties: account.specialties,
          languages: ['Hindi', 'English'],
          bio: `${account.name} offers thoughtful, confidential support for young adults.`,
          experience: account.experience,
          rating: account.rating,
          pricePerSession: account.pricePerSession,
          tier: account.tier,
        },
      }))
    }

    const [prescriptions, appointments, assessments, checkins, orders] = await Promise.all([
      tx.prescription.deleteMany(),
      tx.appointment.deleteMany(),
      tx.assessment.deleteMany(),
      tx.checkIn.deleteMany(),
      tx.order.deleteMany(),
    ])

    const professionalIds = professionals.map(({ id }) => id)
    await tx.slot.deleteMany({ where: { professionalId: { notIn: professionalIds } } })
    await tx.professional.deleteMany({ where: { user: { email: { notIn: clinicianEmails } } } })
    const users = await tx.user.deleteMany({ where: { email: { notIn: accountEmails } } })

    await tx.slot.deleteMany({ where: { professionalId: { in: professionalIds } } })
    const patient = seededUsers.find((candidate) => candidate.email === 'patient1@demo.destiny')
    if (!patient) throw new Error('The sample patient account was not created.')

    const slots: { professionalId: string; startTime: Date }[] = []
    for (const professionalId of professionalIds) {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      let weekdaysAdded = 0
      while (weekdaysAdded < 21) {
        if (day.getDay() !== 0 && day.getDay() !== 6) {
          for (const [hour, minute] of [[10, 0], [11, 30], [15, 0], [16, 30]]) {
            const startTime = new Date(day)
            startTime.setHours(hour, minute, 0, 0)
            slots.push({ professionalId, startTime })
          }
          weekdaysAdded += 1
        }
        day.setDate(day.getDate() + 1)
      }
    }
    await tx.slot.createMany({ data: slots })

    const sampleAppointments = []
    for (const professional of professionals) {
      const slot = await tx.slot.findFirst({
        where: { professionalId: professional.id, isBooked: false, startTime: { gt: new Date() } },
        orderBy: { startTime: 'asc' },
      })
      if (!slot) throw new Error(`Could not create an upcoming sample appointment for ${professional.professionalCode}.`)
      await tx.slot.update({ where: { id: slot.id }, data: { isBooked: true } })
      sampleAppointments.push(await tx.appointment.create({
        data: {
          patientId: patient.id,
          patientName: patient.name,
          patientAge: 28,
          patientGender: 'FEMALE',
          professionalId: professional.id,
          slotId: slot.id,
        },
      }))
    }

    const remainingActivity = {
      prescriptions: await tx.prescription.count(),
      assessments: await tx.assessment.count(),
      checkins: await tx.checkIn.count(),
      orders: await tx.order.count(),
      completedAppointments: await tx.appointment.count({ where: { status: 'COMPLETED' } }),
    }
    const retained = {
      users: await tx.user.count(),
      professionals: await tx.professional.count(),
      medicines: await tx.medicine.count(),
      appointments: await tx.appointment.count(),
      bookedSlots: await tx.slot.count({ where: { isBooked: true } }),
    }
    const retainedProfiles = await tx.professional.findMany({ select: { professionalCode: true, type: true } })
    const invalidCodes = retainedProfiles.filter(({ professionalCode, type }) => {
      const suffix = type === 'THERAPIST' ? 'T' : type === 'COUNSELLOR' ? 'C' : 'P'
      return !/^DT\d{5}[TCP]$/.test(professionalCode) || !professionalCode.endsWith(suffix)
    }).length
    if (
      retained.users !== accountDefinitions.length
      || retained.professionals !== 3
      || retained.appointments !== 3
      || retained.bookedSlots !== 3
      || Object.values(remainingActivity).some((count) => count !== 0)
      || invalidCodes !== 0
      || sampleAppointments.length !== 3
    ) {
      throw new Error('The reset did not match the expected account, activity, and sample-session counts.')
    }

    return {
      removed: {
        unapprovedAccounts: users.count,
        prescriptions: prescriptions.count,
        priorAppointments: appointments.count,
        assessments: assessments.count,
        checkins: checkins.count,
        orders: orders.count,
      },
      preserved: retained,
      professionalIds: professionals.map(({ professionalCode }) => professionalCode),
      remainingActivity,
    }
  }, { timeout: 30_000 })

  const previewsDirectory = path.join(process.cwd(), '.mail-previews')
  let removedPreviews = 0
  try {
    const entries = await readdir(previewsDirectory, { withFileTypes: true })
    const generatedFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    await Promise.all(generatedFiles.map((entry) => unlink(path.join(previewsDirectory, entry.name))))
    removedPreviews = generatedFiles.length
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }

  console.log('Destiny account and activity reset completed.')
  console.log(JSON.stringify(summary, null, 2))
  console.log(`Removed ${removedPreviews} generated appointment email preview(s).`)
  console.log('The newly created therapist account uses the password Demo@1234; existing account passwords are unchanged.')
}

main()
  .catch((error: unknown) => {
    console.error('Could not reset Destiny accounts and activity:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
