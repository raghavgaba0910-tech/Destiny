import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CheckinPanel } from '@/components/destiny/CheckinPanel'

export default async function CheckinPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'PATIENT') {
    redirect(session.user.role === 'ADMIN' ? '/admin' : '/pro')
  }
  return <CheckinPanel />
}
