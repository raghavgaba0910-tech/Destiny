import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const isProfessional = session.user.role !== 'PATIENT' && session.user.role !== 'ADMIN'
  const isAdmin = session.user.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="print:hidden"><Sidebar name={session.user.name ?? 'Destiny member'} email={session.user.email ?? ''} role={session.user.role} /></div>
      <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[264px]">
        {children}
      </main>
      <div className="print:hidden"><BottomNav professional={isProfessional} admin={isAdmin} /></div>
    </div>
  )
}
