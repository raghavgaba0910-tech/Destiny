import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string()
    .min(12, 'Use at least 12 characters')
    .regex(/[a-z]/, 'Include a lowercase letter')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number')
    .regex(/[^A-Za-z0-9]/, 'Include a symbol'),
  name: z.string().trim().min(2).max(100),
})

async function main() {
  const parsed = credentialsSchema.safeParse({
    email: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || 'Destiny Admin',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((issue) => issue.message).join('. '))
  }

  const { email, password, name } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email }, select: { role: true } })
  if (existing && existing.role !== 'ADMIN') {
    throw new Error('That email already belongs to a non-admin account; refusing to change its role.')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, mustChangePassword: false },
    create: { email, name, passwordHash, role: 'ADMIN' },
  })

  console.log(`Admin account ready for ${email}. Sign in at /login and choose Admin.`)
}

main()
  .catch((error: unknown) => {
    console.error('Admin account setup failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
