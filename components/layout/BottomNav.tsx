'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, CalendarDays, LayoutDashboard, ShoppingBag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/therapists', icon: Users, label: 'Find care' },
  { href: '/assessment', icon: Brain, label: 'Check-in' },
  { href: '/appointments', icon: CalendarDays, label: 'Sessions' },
  { href: '/pharmacy', icon: ShoppingBag, label: 'Pharmacy' },
]

export function BottomNav({ professional = false }: { professional?: boolean }) {
  const pathname = usePathname()
  const navItems = professional ? [
    { href: '/pro', icon: LayoutDashboard, label: 'Workspace' },
    { href: '/appointments', icon: CalendarDays, label: 'Sessions' },
  ] : items
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-24px_rgba(20,20,40,.4)] backdrop-blur lg:hidden">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`)) || (href === '/therapists' && pathname.startsWith('/professionals/'))
        return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[9px] font-medium transition', active ? 'text-indigo' : 'text-slate-400 hover:text-slate-700')}><span className={cn('flex h-7 w-9 items-center justify-center rounded-xl transition', active && 'bg-indigo/10')}><Icon className="h-[17px] w-[17px]" /></span>{label}</Link>
      })}
    </nav>
  )
}
