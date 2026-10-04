import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const professionals = await prisma.professional.findMany({
    select: { id: true, languages: true },
  })

  for (const professional of professionals) {
    const languages = Array.from(new Set(['Hindi', 'English', ...professional.languages]))
    if (languages.length !== professional.languages.length) {
      await prisma.professional.update({
        where: { id: professional.id },
        data: { languages },
      })
    }
  }

  console.log(`Updated language coverage for ${professionals.length} professional profiles.`)
}

main()
  .catch((error: unknown) => {
    console.error('Could not update professional languages:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
