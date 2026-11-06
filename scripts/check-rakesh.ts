import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const apps = await prisma.professionalApplication.findMany()
  console.log('--- ALL PROFESSIONAL APPLICATIONS ---')
  console.log(JSON.stringify(apps, null, 2))

  const user = await prisma.user.findFirst({
    where: { email: { contains: 'n2005ak', mode: 'insensitive' } },
    include: { professional: true }
  })
  console.log('--- USER n2005ak ---', user)

  const pros = await prisma.professional.findMany({
    include: { user: true }
  })
  console.log('--- ALL PROS ---', pros)
}

main().finally(() => prisma.$disconnect())

