import { db } from '@/lib/db'
import { ProfessionalsPage } from '@/components/destiny/ProfessionalsPage'

export default async function CounsellorsPage() {
  const professionals = await db.professional.findMany({
    where: { type: 'COUNSELLOR', isApproved: true },
    include: { user: { select: { name: true } } },
    orderBy: [{ rating: 'desc' }, { pricePerSession: 'asc' }],
  })
  return <ProfessionalsPage professionals={professionals} heading="Counsellors" />
}
