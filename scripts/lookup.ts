import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      professional: true,
    },
  })
  console.log('--- ALL USERS ---')
  for (const u of users) {
    console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Pro: ${u.professional ? u.professional.professionalCode + ' (id: ' + u.professional.id + ')' : 'none'}`)
  }

  const appointments = await prisma.appointment.findMany({
    include: {
      patient: true,
      professional: { include: { user: true } },
      slot: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  console.log('--- RECENT APPOINTMENTS ---')
  for (const a of appointments) {
    console.log(`Appt ID: ${a.id} | Status: ${a.status} | Patient: ${a.patient.name} (${a.patient.email}) | Pro: ${a.professional.user.name} (${a.professional.user.email}) | Slot Time: ${a.slot.startTime.toISOString()}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

