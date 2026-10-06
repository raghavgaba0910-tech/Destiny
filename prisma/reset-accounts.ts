import { Prisma, PrismaClient, ProfType, Tier } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { formatProfessionalCode } from '../lib/professional-code'
import { getTierPrice } from '../lib/professional-pricing'

const prisma = new PrismaClient()
const defaultPassword = 'Demo@1234'
const patientDefinitions = [
  { email: 'patient1@demo.destiny', name: 'Aisha Sharma', role: 'PATIENT' as const },
  { email: 'patient2@demo.destiny', name: 'Rohan Mehta', role: 'PATIENT' as const },
]
const adminDefinition = { email: 'admin@demo.destiny', name: 'Destiny Admin', role: 'ADMIN' as const }

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

const clinicianAccounts: ClinicianAccount[] = [
  { email: 'psychiatrist@demo.destiny', name: 'Dr. Mira Rao', role: 'PSYCHIATRIST', type: 'PSYCHIATRIST', specialties: ['Anxiety', 'Depression'], experience: 6, rating: 9.2, pricePerSession: 3000, tier: 'C' },
  { email: 'counsellor@demo.destiny', name: 'Aarav Sen', role: 'COUNSELLOR', type: 'COUNSELLOR', specialties: ['Anxiety', 'Stress', 'Life transitions'], experience: 3, rating: 8.1, pricePerSession: 1800, tier: 'B' },
  { email: 'therapist@demo.destiny', name: 'Dr. Neha Kapoor', role: 'THERAPIST', type: 'THERAPIST', specialties: ['Anxiety', 'Depression', 'Relationships'], experience: 4, rating: 8.5, pricePerSession: 2200, tier: 'B' },
]

const additionalClinicians = {
  PSYCHIATRIST: [
    ['Dr. Kavya Menon', ['Mood disorders', 'Anxiety']],
    ['Dr. Arjun Bhat', ['Sleep issues', 'Depression']],
    ['Dr. Isha Kulkarni', ['ADHD', 'Anxiety']],
    ['Dr. Dev Malhotra', ['OCD', 'Depression']],
    ['Dr. Sana Qureshi', ['Trauma & PTSD', 'Anxiety']],
    ['Dr. Karan Desai', ['Substance use', 'Mood disorders']],
    ['Dr. Leela Nair', ['Life transitions', 'Depression']],
    ['Dr. Nikhil Bose', ['Stress', 'Sleep issues']],
    ['Dr. Tara Kapoor', ['Eating disorders', 'Anxiety']],
  ],
  COUNSELLOR: [
    ['Maya Iyer', ['Career stress', 'Life transitions']],
    ['Kabir Anand', ['Relationship issues', 'Self-esteem']],
    ['Nisha Reddy', ['Grief', 'Family conflict']],
    ['Sameer Gill', ['Stress', 'Anxiety']],
    ['Pooja Nair', ['Self-esteem', 'Depression']],
    ['Aman Chawla', ['Life transitions', 'Career stress']],
    ['Ritu Shah', ['Family conflict', 'Grief']],
    ['Farah Ali', ['LGBTQ+ affirming', 'Anxiety']],
    ['Vivek Joshi', ['Relationship issues', 'Stress']],
  ],
  THERAPIST: [
    ['Dr. Ananya Krishnan', ['Trauma & PTSD', 'Anxiety']],
    ['Dr. Rohan Mehta', ['OCD', 'Depression']],
    ['Dr. Priya Iyer', ['Relationship issues', 'Grief']],
    ['Dr. Vikram Nair', ['Career stress', 'ADHD']],
    ['Dr. Sanya Patel', ['Eating disorders', 'Self-esteem']],
    ['Dr. Arjun Sharma', ['Substance use', 'Stress']],
    ['Dr. Meera Bose', ['Sleep issues', 'Depression']],
    ['Dr. Kabir Das', ['Family conflict', 'Anxiety']],
    ['Dr. Divya Reddy', ['LGBTQ+ affirming', 'Life transitions']],
  ],
} satisfies Record<ProfType, [string, string[]][]>

let allocatedId = 0

function nextProfessionalCode(type: ProfType) {
  allocatedId += 1
  return formatProfessionalCode(allocatedId, type)
}

async function main() {
  const passwordHash = await bcrypt.hash(defaultPassword, 12)
  const profileDefinitions = [
    ...clinicianAccounts,
    ...Object.entries(additionalClinicians).flatMap(([typeValue, names]) => {
      const type = typeValue as ProfType
      return names.map(([name, specialties], index): ClinicianAccount => {
        const suffix = type === 'THERAPIST' ? 'therapist' : type === 'COUNSELLOR' ? 'counsellor' : 'psychiatrist'
        const experience = 2 + index
        const rating = 7.5 + (index % 5) * 0.4
        const tier = index < 3 ? 'A' : index < 6 ? 'B' : 'C'
        return {
          email: `${suffix}.${String(index + 2).padStart(2, '0')}@providers.destiny`,
          name,
          role: type,
          type,
          specialties,
          experience,
          rating,
          pricePerSession: getTierPrice(tier, experience, rating),
          tier,
        }
      })
    }),
  ].map((account) => ({
    ...account,
    pricePerSession: getTierPrice(account.tier, account.experience, account.rating),
  }))
  const allAccounts = [...patientDefinitions, adminDefinition, ...profileDefinitions]
  const accountEmails = allAccounts.map(({ email }) => email)
  const clinicianEmails = profileDefinitions.map(({ email }) => email)

  const summary = await prisma.$transaction(async (tx) => {
    const seededUsers = []
    for (const account of allAccounts) {
      seededUsers.push(await tx.user.upsert({
        where: { email: account.email },
        update: { name: account.name, role: account.role, passwordHash },
        create: { name: account.name, email: account.email, passwordHash, role: account.role },
      }))
    }

    await tx.supportTicket.deleteMany()
    await tx.prescription.deleteMany()
    await tx.appointment.deleteMany()
    await tx.assessment.deleteMany()
    await tx.checkIn.deleteMany()
    await tx.order.deleteMany()
    await tx.professionalApplication.deleteMany()
    await tx.slot.deleteMany()
    await tx.professional.deleteMany({ where: { user: { email: { notIn: clinicianEmails } } } })
    const removedUsers = await tx.user.deleteMany({ where: { email: { notIn: accountEmails } } })
    const remainingUsersWithProfiles = await tx.user.findMany({
      where: { email: { in: clinicianEmails } },
      select: { id: true, email: true },
    })
    const profileUserIds = new Set(remainingUsersWithProfiles.map(({ id }) => id))
    if (remainingUsersWithProfiles.length !== profileDefinitions.length) {
      throw new Error('Could not prepare all professional accounts before profile creation.')
    }

    const professionals = []
    for (let index = 0; index < profileDefinitions.length; index += 1) {
      const account = profileDefinitions[index]
      const user = seededUsers.find((candidate) => candidate.email === account.email)
      if (!user || !profileUserIds.has(user.id)) throw new Error(`Could not prepare ${account.email}.`)
      const professionalCode = nextProfessionalCode(account.type)
      professionals.push(await tx.professional.upsert({
        where: { userId: user.id },
        update: {
          professionalCode,
          type: account.type,
          specialties: account.specialties,
          languages: ['Hindi', 'English'],
          bio: `${account.name} offers thoughtful support for ${account.specialties.slice(0, 2).join(' and ')}.`,
          experience: account.experience,
          rating: Math.min(account.rating, 10),
          pricePerSession: account.pricePerSession,
          tier: account.tier,
          isApproved: true,
        },
        create: {
          userId: user.id,
          professionalCode,
          type: account.type,
          specialties: account.specialties,
          languages: ['Hindi', 'English'],
          bio: `${account.name} offers thoughtful support for ${account.specialties.slice(0, 2).join(' and ')}.`,
          experience: account.experience,
          rating: Math.min(account.rating, 10),
          pricePerSession: account.pricePerSession,
          tier: account.tier,
          isApproved: true,
        },
      }))
    }

    const slots: { professionalId: string; startTime: Date }[] = []
    for (const professional of professionals) {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      let weekdaysAdded = 0
      while (weekdaysAdded < 21) {
        if (day.getDay() !== 0 && day.getDay() !== 6) {
          for (const [hour, minute] of [[10, 0], [11, 30], [15, 0], [16, 30]]) {
            const startTime = new Date(day)
            startTime.setHours(hour, minute, 0, 0)
            slots.push({ professionalId: professional.id, startTime })
          }
          weekdaysAdded += 1
        }
        day.setDate(day.getDate() + 1)
      }
    }
    await tx.slot.createMany({ data: slots })

    const typeCounts = await tx.professional.groupBy({ by: ['type'], _count: { _all: true } })
    const countsByType = Object.fromEntries(typeCounts.map(({ type, _count }) => [type, _count._all])) as Record<ProfType, number>
    const duplicateCodes = await tx.professional.groupBy({
      by: ['professionalCode'],
      _count: { _all: true },
      having: { professionalCode: { _count: { gt: 1 } } },
    })
    const invalidCodes = await tx.professional.findMany({ select: { type: true, professionalCode: true } })
    const malformedCodeCount = invalidCodes.filter(({ type, professionalCode }) => {
      const suffix = type === 'THERAPIST' ? 'T' : type === 'COUNSELLOR' ? 'C' : 'P'
      return !/^DT\d{5}[TCP]$/.test(professionalCode) || !professionalCode.endsWith(suffix)
    }).length
    const activity = {
      appointments: await tx.appointment.count(),
      assessments: await tx.assessment.count(),
      checkins: await tx.checkIn.count(),
      prescriptions: await tx.prescription.count(),
      orders: await tx.order.count(),
      supportTickets: await tx.supportTicket.count(),
      pendingApplications: await tx.professionalApplication.count(),
      bookedSlots: await tx.slot.count({ where: { isBooked: true } }),
    }
    const preserved = {
      users: await tx.user.count(),
      professionals: await tx.professional.count(),
      medicines: await tx.medicine.count(),
      availableSlots: await tx.slot.count({ where: { isBooked: false } }),
    }

    if (
      Object.values(countsByType).some((count) => count < 10)
      || duplicateCodes.length > 0
      || malformedCodeCount > 0
      || Object.values(activity).some((count) => count !== 0)
      || preserved.professionals !== 30
      || preserved.users !== allAccounts.length
    ) {
      throw new Error('The account reset failed its provider-count, ID, or clean-activity verification.')
    }

    return {
      removedUnlistedUsers: removedUsers.count,
      retainedAccounts: preserved.users,
      professionalsByRole: countsByType,
      professionalIds: professionals.map(({ professionalCode }) => professionalCode),
      availableSlots: preserved.availableSlots,
      retainedMedicineCatalog: preserved.medicines,
      demoAdmin: adminDefinition.email,
      remainingActivity: activity,
    }
  }, { timeout: 60_000 })

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

  console.log('Destiny accounts and activity reset completed.')
  console.log(JSON.stringify(summary, null, 2))
  console.log(`Removed ${removedPreviews} generated email preview(s).`)
  console.log(`All accounts use the password ${defaultPassword}.`)
}

main()
  .catch((error: unknown) => {
    console.error('Could not reset Destiny accounts and activity:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
