import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from './auth.config'

const loginSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(6).max(72),
  expectedRole: z.enum(['PATIENT', 'COUNSELLOR', 'THERAPIST', 'PSYCHIATRIST', 'ADMIN']),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  debug: false,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const identifier = parsed.data.email.trim()
        const isProfessionalCode = /^DT\d{5}[TCP]$/i.test(identifier)
        if (isProfessionalCode && !['COUNSELLOR', 'THERAPIST', 'PSYCHIATRIST'].includes(parsed.data.expectedRole)) return null
        const user = isProfessionalCode
          ? (await db.professional.findUnique({
              where: { professionalCode: identifier.toUpperCase(), isApproved: true },
              include: { user: true },
            }))?.user
          : await db.user.findUnique({ where: { email: identifier.toLowerCase() } })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid || user.role !== parsed.data.expectedRole) return null
        if (['COUNSELLOR', 'THERAPIST', 'PSYCHIATRIST'].includes(user.role)) {
          const professional = await db.professional.findFirst({ where: { userId: user.id, isApproved: true }, select: { id: true } })
          if (!professional) return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        }
      },
    }),
  ],
})
