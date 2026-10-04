import { db } from '@/lib/db'
import { ProfessionalsPage } from '@/components/destiny/ProfessionalsPage'

export default async function TherapistsPage() {
  const professionals = await db.professional.findMany({
    where: { type: { in: ['THERAPIST', 'PSYCHIATRIST'] } },
    include: { user: { select: { name: true } } },
    orderBy: [{ rating: 'desc' }, { pricePerSession: 'asc' }],
  })
  return <ProfessionalsPage professionals={professionals} heading="Therapists & psychiatrists" />
}
