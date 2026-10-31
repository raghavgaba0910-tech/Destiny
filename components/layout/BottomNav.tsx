'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, CalendarDays, CircleHelp, LayoutDashboard, ShoppingBag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/therapists', icon: Users, label: 'Find care' },
  { href: '/assessment', icon: Brain, label: 'Assessments' },
  { href: '/appointments', icon: CalendarDays, label: 'Sessions' },
  { href: '/pharmacy', icon: ShoppingBag, label: 'Pharmacy' },
  { href: '/helpdesk', icon: CircleHelp, label: 'Help desk' },
]

export function BottomNav({ professional = false, admin = false }: { professional?: boolean; admin?: boolean }) {
  const pathname = usePathname()
  const navItems = professional ? [
    { href: '/pro', icon: LayoutDashboard, label: 'Workspace' },
    { href: '/appointments', icon: CalendarDays, label: 'Sessions' },
    { href: '/helpdesk', icon: CircleHelp, label: 'Help desk' },
  ] : admin ? [
    { href: '/admin', icon: LayoutDashboard, label: 'Admin' },
  ] : items
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200/90 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_25px_-10px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`)) || (href === '/therapists' && pathname.startsWith('/professionals/'))
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold transition',
              active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            )}
          >
            <span
              className={cn(
                'flex h-7 w-10 items-center justify-center rounded-xl transition',
                active && 'bg-indigo-50 text-indigo-600'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="truncate max-w-[58px]">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
