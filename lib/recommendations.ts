import { db } from '@/lib/db'

export async function getRecommendedProfessionals(recommendation: 'COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST', specialties?: string[]) {
  const typeMap: Record<typeof recommendation, ('COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST')[]> = {
    COUNSELLOR: ['COUNSELLOR'],
    THERAPIST: ['THERAPIST'],
    PSYCHIATRIST: ['PSYCHIATRIST', 'THERAPIST'],
  }

  const professionals = await db.professional.findMany({
    where: {
      type: { in: typeMap[recommendation] },
      ...(specialties?.length ? { specialties: { hasSome: specialties } } : {}),
    },
    include: {
      user: { select: { id: true, name: true } },
      slots: { where: { isBooked: false, startTime: { gte: new Date() } }, orderBy: { startTime: 'asc' }, take: 1 },
    },
    orderBy: [{ rating: 'desc' }, { pricePerSession: 'asc' }],
    take: 6,
  })

  return professionals
}
