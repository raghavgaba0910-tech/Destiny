import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const raghav = await prisma.user.findUnique({ where: { email: 'raghavgaba0910@gmail.com' } })
  console.log('Raghav user:', raghav)
  if (raghav) {
    for (const p of ['Demo@1234', 'raghav123', 'Raghav@123', '12345678', 'password', 'DBs3WIzgwmbDFJyTLu6bZhLIB9', 'raghav', '123456']) {
      console.log(p, bcrypt.compareSync(p, raghav.passwordHash))
    }
  }
}

main().finally(() => prisma.$disconnect())

