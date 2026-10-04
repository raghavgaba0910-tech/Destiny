'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Activity, BadgeCheck, Brain, CalendarDays, CheckSquare, LayoutDashboard, LogOut, MessageCircleHeart, ShoppingBag, Stethoscope, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const patientItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'My overview' },
  { href: '/assessment', icon: Brain, label: 'Check-in & reports' },
  { href: '/therapists', icon: Users, label: 'Therapists' },
  { href: '/counsellors', icon: MessageCircleHeart, label: 'Counsellors' },
  { href: '/appointments', icon: CalendarDays, label: 'Appointments' },
  { href: '/checkin', icon: CheckSquare, label: 'Daily care' },
  { href: '/pharmacy', icon: ShoppingBag, label: 'Demo pharmacy' },
]

export function Sidebar({ name, email, role }: { name: string; email: string; role: string }) {
  const pathname = usePathname()
  const isProfessional = role !== 'PATIENT'
  const visibleItems = isProfessional
    ? [{ href: '/pro', icon: Stethoscope, label: 'Professional console' }, { href: '/appointments', icon: CalendarDays, label: 'My sessions' }]
    : patientItems
  const initials = name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'D'

  return (
    <>
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur lg:hidden">
      <Link href={isProfessional ? '/pro' : '/dashboard'} className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#171a32] text-white"><Activity className="h-4 w-4 text-teal" /></span>
        <span className="text-sm font-semibold tracking-tight text-ink">destiny<span className="text-violet">.</span></span>
      </Link>
      <div className="flex items-center gap-2"><span className="max-w-28 truncate text-[10px] font-medium text-slate-500">{name}</span><button type="button" aria-label="Sign out" onClick={() => void signOut({ callbackUrl: '/' })} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-rose-700"><LogOut className="h-4 w-4" /></button></div>
    </header>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-slate-200/80 bg-white lg:flex">
      <div className="border-b border-slate-100 px-5 py-5">
        <Link href={isProfessional ? '/pro' : '/dashboard'} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#171a32] text-white shadow-sm"><Activity className="h-5 w-5 text-teal" /></span>
          <span><span className="block text-base font-semibold tracking-tight text-ink">destiny<span className="text-violet">.</span></span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">Your care, your pace</span></span>
        </Link>
      </div>

      <div className="px-4 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-[#f8f7f4] p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-indigo text-xs font-semibold text-white">{initials}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-ink">{name}</span><span className="mt-1 block truncate text-[10px] text-slate-500">{isProfessional ? 'Professional workspace' : 'Personal space'}</span></span>
          <BadgeCheck className="h-4 w-4 shrink-0 text-teal" />
        </div>
      </div>

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">{isProfessional ? 'Workspace' : 'Your journey'}</p>
        <div className="space-y-1">
          {visibleItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
            return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('group flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-medium transition', active ? 'bg-[#171a32] text-white shadow-sm' : 'text-slate-600 hover:bg-[#f5f4f1] hover:text-ink')}><Icon className={cn('h-[17px] w-[17px] shrink-0', active ? 'text-teal' : 'text-slate-400 group-hover:text-violet')} />{label}</Link>
          })}
        </div>
      </nav>

      <div className="px-4 pb-3">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3.5">
          <p className="text-[10px] font-semibold text-rose-950">Need urgent support?</p>
          <p className="mt-1 text-[10px] leading-4 text-rose-900/70">India emergency <a href="tel:112" className="font-bold underline">112</a> · Tele-MANAS <a href="tel:14416" className="font-bold underline">14416</a></p>
        </div>
      </div>
      <div className="border-t border-slate-100 p-3">
        <button type="button" onClick={() => void signOut({ callbackUrl: '/' })} className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-rose-700"><LogOut className="h-4 w-4" />Sign out<span className="ml-auto max-w-28 truncate text-[9px] text-slate-400">{email}</span></button>
      </div>
    </aside>
    </>
  )
}
