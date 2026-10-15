import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PharmacyPanel } from '@/components/destiny/PharmacyPanel'

export default async function PharmacyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'PATIENT') {
    redirect(session.user.role === 'ADMIN' ? '/admin' : '/pro')
  }
  return <PharmacyPanel />
}
