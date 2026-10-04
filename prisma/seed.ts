import { PrismaClient, ProfType, Tier, AppointmentStatus, OrderStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
  const pronoun = name.includes('Dr.') ? 'They' : 'They'
  return `${name} has ${years} year${years !== 1 ? 's' : ''} of experience supporting young adults through ${specialties.slice(0, 2).join(' and ')}. ${pronoun} believe in creating a safe, non-judgmental space where you can explore your thoughts at your own pace. Demo profile.`
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

// Build professional specs
// Therapists: 7A, 7B, 6C. Among 20, 6 are psychiatrists: 2 from each tier
const therapistSpecs: ProfSpec[] = [
  // Tier A: 7 therapists (indices 0-6), 2 are psychiatrists (0,1)
  ...Array.from({ length: 7 }, (_, i) => makeTierSpec('A', i < 2 ? 'PSYCHIATRIST' : 'THERAPIST')),
  // Tier B: 7 therapists (indices 7-13), 2 are psychiatrists (7,8)
  ...Array.from({ length: 7 }, (_, i) => makeTierSpec('B', i < 2 ? 'PSYCHIATRIST' : 'THERAPIST')),
  // Tier C: 6 therapists (indices 14-19), 2 are psychiatrists (14,15)
  ...Array.from({ length: 6 }, (_, i) => makeTierSpec('C', i < 2 ? 'PSYCHIATRIST' : 'THERAPIST')),
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
    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}${index}@destiny.demo`
    const role = spec.type === 'COUNSELLOR' ? 'COUNSELLOR' : spec.type === 'PSYCHIATRIST' ? 'PSYCHIATRIST' : 'THERAPIST'

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash('ProfDemo@123', 10),
        role: role as any,
        professional: {
          create: {
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

  // Demo psychiatrist account
  const firstPsychiatrist = allProfessionalUsers.find(p => p.professional.type === 'PSYCHIATRIST')
  const firstCounsellor = allProfessionalUsers.find(p => p.professional.type === 'COUNSELLOR')

  const psychUser = await prisma.user.upsert({
    where: { email: 'psychiatrist@demo.destiny' },
    update: {},
    create: {
      name: 'Dr. Demo Psychiatrist',
      email: 'psychiatrist@demo.destiny',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      role: 'PSYCHIATRIST',
      professional: {
        create: {
          type: 'PSYCHIATRIST',
          specialties: ['Anxiety', 'Depression'],
          languages: ['Hindi', 'English'],
          bio: 'Demo psychiatrist account for testing. Demo profile.',
          experience: 6,
          rating: 9.2,
          pricePerSession: 3000,
          tier: 'C',
        }
      }
    },
    include: { professional: true }
  })

  // Seed slots for demo psychiatrist
  const today2 = new Date()
  today2.setHours(0, 0, 0, 0)
  const psychSlotData = []
  let daysAdded2 = 0
  let d2 = new Date(today2)
  while (daysAdded2 < 21) {
    const dayOfWeek = d2.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      for (const { h, m } of SLOT_HOURS) {
        const slotTime = new Date(d2)
        slotTime.setHours(h, m, 0, 0)
        psychSlotData.push({ professionalId: psychUser.professional!.id, startTime: slotTime })
      }
      daysAdded2++
    }
    d2.setDate(d2.getDate() + 1)
  }
  await prisma.slot.createMany({ data: psychSlotData })

  const counsellorUser = await prisma.user.upsert({
    where: { email: 'counsellor@demo.destiny' },
    update: {},
    create: {
      name: 'Demo Counsellor',
      email: 'counsellor@demo.destiny',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      role: 'COUNSELLOR',
      professional: {
        create: {
          type: 'COUNSELLOR',
          specialties: ['Anxiety', 'Stress', 'Life transitions'],
          languages: ['Hindi', 'English'],
          bio: 'Demo counsellor account for testing. Demo profile.',
          experience: 3,
          rating: 8.1,
          pricePerSession: 1800,
          tier: 'B',
        }
      }
    },
    include: { professional: true }
  })

  // Seed slots for demo counsellor
  const today3 = new Date()
  today3.setHours(0, 0, 0, 0)
  const counsellorSlotData = []
  let daysAdded3 = 0
  let d3 = new Date(today3)
  while (daysAdded3 < 21) {
    const dayOfWeek = d3.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      for (const { h, m } of SLOT_HOURS) {
        const slotTime = new Date(d3)
        slotTime.setHours(h, m, 0, 0)
        counsellorSlotData.push({ professionalId: counsellorUser.professional!.id, startTime: slotTime })
      }
      daysAdded3++
    }
    d3.setDate(d3.getDate() + 1)
  }
  await prisma.slot.createMany({ data: counsellorSlotData })

  // Demo patient 1 (has completed appointment + prescription)
  const patient1 = await prisma.user.upsert({
    where: { email: 'patient1@demo.destiny' },
    update: {},
    create: {
      name: 'Aisha Demo',
      email: 'patient1@demo.destiny',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      role: 'PATIENT',
    }
  })

  // Find a slot for patient1's completed appointment
  const pastSlot = await prisma.slot.findFirst({
    where: {
      professionalId: psychUser.professional!.id,
      isBooked: false,
    }
  })

  if (pastSlot) {
    await prisma.slot.update({ where: { id: pastSlot.id }, data: { isBooked: true } })
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        professionalId: psychUser.professional!.id,
        slotId: pastSlot.id,
        status: 'COMPLETED',
      }
    })

    // Prescription for patient1
    await prisma.prescription.create({
      data: {
        appointmentId: appointment.id,
        patientId: patient1.id,
        medicines: [
          { medicineId: medicines[6].id, name: 'Sertraline 50mg', dose: '50mg once daily', duration: '30 days', notes: 'Take in the morning with food' },
          { medicineId: medicines[0].id, name: 'Ashwagandha 300mg', dose: '300mg twice daily', duration: '30 days', notes: 'Take with meals' },
        ]
      }
    })
  }

  // Demo patient 2 (new)
  await prisma.user.upsert({
    where: { email: 'patient2@demo.destiny' },
    update: {},
    create: {
      name: 'Rohan Demo',
      email: 'patient2@demo.destiny',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      role: 'PATIENT',
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Demo accounts:')
  console.log('  patient1@demo.destiny / Demo@1234 (PATIENT with completed session + prescription)')
  console.log('  patient2@demo.destiny / Demo@1234 (PATIENT, new)')
  console.log('  psychiatrist@demo.destiny / Demo@1234 (PSYCHIATRIST)')
  console.log('  counsellor@demo.destiny / Demo@1234 (COUNSELLOR)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
