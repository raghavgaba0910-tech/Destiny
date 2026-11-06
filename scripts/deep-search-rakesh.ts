import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function searchAll() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'rakesh', mode: 'insensitive' } },
        { email: { contains: 'rakesh', mode: 'insensitive' } },
      ],
    },
    include: { professional: true }
  })
  console.log('Matching Users:', users)

  const pros = await prisma.professional.findMany({
    where: {
      user: {
        OR: [
          { name: { contains: 'rakesh', mode: 'insensitive' } },
          { email: { contains: 'rakesh', mode: 'insensitive' } },
        ]
      }
    },
    include: { user: true }
  })
  console.log('Matching Pros:', pros)

  const apps = await prisma.professionalApplication.findMany({
    where: {
      OR: [
        { name: { contains: 'rakesh', mode: 'insensitive' } },
        { email: { contains: 'rakesh', mode: 'insensitive' } },
      ]
    }
  })
  console.log('Matching Applications:', apps)
}

searchAll().finally(() => prisma.$disconnect())

