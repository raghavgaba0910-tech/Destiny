import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawType = searchParams.get('type')?.toUpperCase()
  const type = ['COUNSELLOR', 'THERAPIST', 'PSYCHIATRIST'].includes(rawType ?? '') ? rawType as 'COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST' : undefined
  const tier = ['A', 'B', 'C'].includes(searchParams.get('tier') ?? '') ? searchParams.get('tier') as 'A' | 'B' | 'C' : undefined
  const professionals = await db.professional.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(tier ? { tier } : {}),
      ...(searchParams.get('specialty') ? { specialties: { has: searchParams.get('specialty') as string } } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: [{ rating: 'desc' }, { pricePerSession: 'asc' }],
  })
  return NextResponse.json(professionals)
}
