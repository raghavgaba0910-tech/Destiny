import { PrismaClient, ProfType, Tier, AppointmentStatus, OrderStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { formatProfessionalCode } from '@/lib/professional-code'

const prisma = new PrismaClient()

// Deterministic seeded PRNG (mulberry32)
function createRNG(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  let state = h >>> 0
  return function() {
    state |= 0; state = state + 0x6D2B79F5 | 0
    let t = Math.imul(state ^ state >>> 15, 1 | state)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const rng = createRNG('destiny-v1')
let professionalNumber = 0

function nextProfessionalCode(type: ProfType) {
  professionalNumber += 1
  return formatProfessionalCode(professionalNumber, type)
}

function randInt(min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 1) {
  return parseFloat((rng() * (max - min) + min).toFixed(decimals))
}

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5)
  return shuffled.slice(0, n)
}

const SPECIALTIES = ['Anxiety', 'Depression', 'Trauma & PTSD', 'OCD', 'Relationship issues', 'Grief', 'Career stress', 'Substance use', 'Eating disorders', 'Sleep issues', 'ADHD', 'Self-esteem', 'Life transitions', 'LGBTQ+ affirming', 'Family conflict']
const LANGUAGES = ['Hindi', 'English', 'Bengali', 'Tamil', 'Marathi', 'Kannada', 'Telugu', 'Gujarati']

const SLOT_HOURS = [
  { h: 10, m: 0 },
  { h: 11, m: 30 },
  { h: 15, m: 0 },
  { h: 16, m: 30 },
]

const THERAPIST_NAMES = [
  'Dr. Ananya Krishnan', 'Dr. Rohan Mehta', 'Dr. Priya Iyer', 'Dr. Vikram Nair', 'Dr. Sanya Patel',
  'Dr. Arjun Sharma', 'Dr. Meera Bose', 'Dr. Kabir Das', 'Dr. Divya Reddy', 'Dr. Neel Joshi',
  'Dr. Simran Kaur', 'Dr. Aditya Rao', 'Dr. Kavitha Menon', 'Dr. Rahul Gupta', 'Dr. Shreya Malhotra',
  'Dr. Tarun Pillai', 'Dr. Anjali Singh', 'Dr. Vivek Chandra', 'Dr. Lakshmi Nair', 'Dr. Dhruv Saxena',
]

const COUNSELLOR_NAMES = [
  'Puja Verma', 'Sameer Khan', 'Ritika Agarwal', 'Manish Tiwari', 'Deepa Nambiar',
  'Farhan Siddiqui', 'Neha Kulkarni', 'Aryan Bhatia', 'Swati Jain', 'Rohit Choudhary',
]

function generateBio(name: string, specialties: string[], years: number): string {
  return `${name} has ${years} year${years !== 1 ? 's' : ''} of experience supporting young adults through ${specialties.slice(0, 2).join(' and ')}. They believe in creating a safe, non-judgmental space where you can explore your thoughts at your own pace.`
}

interface ProfSpec {
  tier: Tier
  type: ProfType
  experienceMin: number
  experienceMax: number
  ratingMin: number
  ratingMax: number
  priceMin: number
  priceMax: number
}

function makeTierSpec(tier: Tier, type: ProfType): ProfSpec {
  if (tier === 'A') return { tier, type, experienceMin: 0, experienceMax: 2, ratingMin: 5, ratingMax: 8, priceMin: 1000, priceMax: 1500 }
  if (tier === 'B') return { tier, type, experienceMin: 2, experienceMax: 4, ratingMin: 6, ratingMax: 9, priceMin: 1500, priceMax: 2500 }
  return { tier, type, experienceMin: 4, experienceMax: 10, ratingMin: 7, ratingMax: 10, priceMin: 2500, priceMax: 4000 }
}

// Seed ten sample professionals for each clinical role.
const therapistSpecs: ProfSpec[] = [
  ...Array.from({ length: 10 }, (_, i) => makeTierSpec(i < 4 ? 'A' : i < 7 ? 'B' : 'C', 'PSYCHIATRIST')),
  ...Array.from({ length: 10 }, (_, i) => makeTierSpec(i < 4 ? 'A' : i < 7 ? 'B' : 'C', 'THERAPIST')),
]

const counsellorSpecs: ProfSpec[] = [
  ...Array.from({ length: 4 }, () => makeTierSpec('A', 'COUNSELLOR')),
  ...Array.from({ length: 3 }, () => makeTierSpec('B', 'COUNSELLOR')),
  ...Array.from({ length: 3 }, () => makeTierSpec('C', 'COUNSELLOR')),
]

async function main() {
  console.log('🌱 Seeding database...')
  
  // Clear existing data
  await prisma.order.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.medicine.deleteMany()
  await prisma.user.deleteMany()

  // Seed medicines
  const medicines = await Promise.all([
    prisma.medicine.create({ data: { name: 'Ashwagandha 300mg', type: 'OTC', description: 'Adaptogenic herb that helps reduce stress and anxiety naturally.', price: 450, category: 'Supplement' } }),
    prisma.medicine.create({ data: { name: 'Melatonin 5mg', type: 'OTC', description: 'Supports healthy sleep cycles and reduces time to fall asleep.', price: 299, category: 'Sleep' } }),
    prisma.medicine.create({ data: { name: 'Omega-3 1000mg', type: 'OTC', description: 'Essential fatty acids that support brain health and mood regulation.', price: 599, category: 'Supplement' } }),
    prisma.medicine.create({ data: { name: 'Magnesium Glycinate 400mg', type: 'OTC', description: 'Highly bioavailable magnesium that supports relaxation and sleep.', price: 749, category: 'Supplement' } }),
    prisma.medicine.create({ data: { name: 'L-Theanine 200mg', type: 'OTC', description: 'Amino acid found in green tea that promotes calm focus without drowsiness.', price: 549, category: 'Supplement' } }),
    prisma.medicine.create({ data: { name: 'Vitamin D3 2000IU', type: 'OTC', description: 'Supports mood regulation and immune function, especially important in low-sunlight conditions.', price: 349, category: 'Supplement' } }),
    prisma.medicine.create({ data: { name: 'Sertraline 50mg', type: 'PRESCRIPTION', description: 'SSRI antidepressant commonly used for depression and anxiety disorders.', price: 180, category: 'Antidepressant' } }),
    prisma.medicine.create({ data: { name: 'Escitalopram 10mg', type: 'PRESCRIPTION', description: 'SSRI with a favourable side-effect profile for depression and generalised anxiety.', price: 210, category: 'Antidepressant' } }),
    prisma.medicine.create({ data: { name: 'Clonazepam 0.5mg', type: 'PRESCRIPTION', description: 'Benzodiazepine for short-term relief of acute anxiety episodes.', price: 95, category: 'Anxiolytic' } }),
    prisma.medicine.create({ data: { name: 'Quetiapine 25mg', type: 'PRESCRIPTION', description: 'Atypical antipsychotic used at low doses for sleep and mood stabilisation.', price: 320, category: 'Mood stabiliser' } }),
    prisma.medicine.create({ data: { name: 'Aripiprazole 5mg', type: 'PRESCRIPTION', description: 'Atypical antipsychotic that augments antidepressant treatment.', price: 480, category: 'Antipsychotic' } }),
    prisma.medicine.create({ data: { name: 'Propranolol 10mg', type: 'PRESCRIPTION', description: 'Beta-blocker that reduces physical symptoms of anxiety like racing heart.', price: 65, category: 'Beta-blocker' } }),
  ])

  // Seed professionals
  const allProfessionalUsers: { id: string; professional: { id: string; type: ProfType } }[] = []

  async function seedProfessional(name: string, spec: ProfSpec, index: number) {
    const experience = randInt(spec.experienceMin, spec.experienceMax)
    const rating = randFloat(spec.ratingMin, spec.ratingMax)
    const price = randInt(spec.priceMin, spec.priceMax)
    const specialties = pick(SPECIALTIES, randInt(2, 3))
    const languages = Array.from(new Set([
      'Hindi',
      'English',
      ...pick(LANGUAGES.filter((language) => language !== 'Hindi' && language !== 'English'), randInt(1, 2)),
    ]))
    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}${index}@destiny.local`
    const role = spec.type === 'COUNSELLOR' ? 'COUNSELLOR' : spec.type === 'PSYCHIATRIST' ? 'PSYCHIATRIST' : 'THERAPIST'

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash('ProfDemo@123', 10),
        role: role as any,
        professional: {
          create: {
            professionalCode: nextProfessionalCode(spec.type),
            type: spec.type,
            specialties,
            languages,
            bio: generateBio(name, specialties, experience),
            experience,
            rating,
            pricePerSession: price,
            tier: spec.tier,
          }
        }
      },
      include: { professional: true }
    })

    // Seed slots for next 21 weekdays
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const slotData = []
    let daysAdded = 0
    let d = new Date(today)
    while (daysAdded < 21) {
      const dayOfWeek = d.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        for (const { h, m } of SLOT_HOURS) {
          const slotTime = new Date(d)
          slotTime.setHours(h, m, 0, 0)
          slotData.push({ professionalId: user.professional!.id, startTime: slotTime })
        }
        daysAdded++
      }
      d.setDate(d.getDate() + 1)
    }

    await prisma.slot.createMany({ data: slotData })

    return { id: user.id, professional: { id: user.professional!.id, type: spec.type } }
  }

  // Seed therapists
  for (let i = 0; i < THERAPIST_NAMES.length; i++) {
    const result = await seedProfessional(THERAPIST_NAMES[i], therapistSpecs[i], i)
    allProfessionalUsers.push(result)
  }

  // Seed counsellors
  for (let i = 0; i < COUNSELLOR_NAMES.length; i++) {
    const result = await seedProfessional(COUNSELLOR_NAMES[i], counsellorSpecs[i], i + 20)
    allProfessionalUsers.push(result)
  }

  async function seedRoleProfessional(name: string, email: string, role: ProfType) {
    const professional = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash('Demo@1234', 12),
        role,
        professional: {
          create: {
            professionalCode: nextProfessionalCode(role),
            type: role,
            specialties: role === 'PSYCHIATRIST' ? ['Anxiety', 'Depression'] : role === 'COUNSELLOR' ? ['Anxiety', 'Stress', 'Life transitions'] : ['Anxiety', 'Depression', 'Relationships'],
            languages: ['Hindi', 'English'],
            bio: `${name} offers thoughtful, confidential support for young adults.`,
            experience: role === 'PSYCHIATRIST' ? 6 : 4,
            rating: role === 'PSYCHIATRIST' ? 9.2 : 8.5,
            pricePerSession: role === 'PSYCHIATRIST' ? 3000 : role === 'COUNSELLOR' ? 1800 : 2200,
            tier: 'B',
          },
        },
      },
      include: { professional: true },
    })

    const slotData: { professionalId: string; startTime: Date }[] = []
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    let weekdaysAdded = 0
    while (weekdaysAdded < 21) {
      if (day.getDay() !== 0 && day.getDay() !== 6) {
        for (const { h, m } of SLOT_HOURS) {
          const startTime = new Date(day)
          startTime.setHours(h, m, 0, 0)
          slotData.push({ professionalId: professional.professional!.id, startTime })
        }
        weekdaysAdded += 1
      }
      day.setDate(day.getDate() + 1)
    }
    await prisma.slot.createMany({ data: slotData })
    return professional
  }

  const psychiatrist = await seedRoleProfessional('Dr. Mira Rao', 'psychiatrist@demo.destiny', 'PSYCHIATRIST')
  const counsellor = await seedRoleProfessional('Aarav Sen', 'counsellor@demo.destiny', 'COUNSELLOR')
  const therapist = await seedRoleProfessional('Dr. Neha Kapoor', 'therapist@demo.destiny', 'THERAPIST')

  const patient1 = await prisma.user.create({
    data: {
      name: 'Aisha Sharma',
      email: 'patient1@demo.destiny',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      role: 'PATIENT',
    },
  })
  await prisma.user.create({
    data: {
      name: 'Rohan Mehta',
      email: 'patient2@demo.destiny',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      role: 'PATIENT',
    },
  })

  for (const provider of [psychiatrist, counsellor, therapist]) {
    const slot = await prisma.slot.findFirst({
      where: { professionalId: provider.professional!.id, isBooked: false, startTime: { gt: new Date() } },
      orderBy: { startTime: 'asc' },
    })
    if (!slot) throw new Error(`No upcoming sample session slot is available for ${provider.email}.`)
    await prisma.$transaction([
      prisma.slot.update({ where: { id: slot.id }, data: { isBooked: true } }),
      prisma.appointment.create({
        data: {
          patientId: patient1.id,
          patientName: patient1.name,
          patientAge: 28,
          patientGender: 'FEMALE',
          professionalId: provider.professional!.id,
          slotId: slot.id,
        },
      }),
    ])
  }

  console.log('Database seeded successfully.')
  console.log('\nSign-in accounts (all passwords: Demo@1234):')
  console.log('  patient1@demo.destiny (PATIENT; sample upcoming sessions)')
  console.log('  patient2@demo.destiny (PATIENT)')
  console.log('  psychiatrist@demo.destiny (PSYCHIATRIST)')
  console.log('  counsellor@demo.destiny (COUNSELLOR)')
  console.log('  therapist@demo.destiny (THERAPIST)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
