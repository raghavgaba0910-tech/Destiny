'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BadgeCheck,
  Brain,
  CalendarDays,
  CheckSquare,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircleHeart,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavGroup = {
  title: string
  items: {
    href: string
    icon: typeof LayoutDashboard
    label: string
  }[]
}

const patientNavGroups: NavGroup[] = [
  {
    title: 'My Sanctuary',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { href: '/assessment', icon: Brain, label: 'Assessments & Reports' },
      { href: '/checkin', icon: CheckSquare, label: 'Daily Care & Habits' },
    ],
  },
  {
    title: 'Support & Care',
    items: [
      { href: '/therapists', icon: Users, label: 'Therapists & Psychiatrists' },
      { href: '/counsellors', icon: MessageCircleHeart, label: 'Counsellors' },
      { href: '/appointments', icon: CalendarDays, label: 'My Sessions' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { href: '/pharmacy', icon: ShoppingBag, label: 'E-Pharmacy' },
      { href: '/helpdesk', icon: MessageCircleHeart, label: 'Help & Support Desk' },
    ],
  },
]

export function Sidebar({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: string
}) {
  const pathname = usePathname()
  const isAdmin = role === 'ADMIN'
  const isProfessional = role !== 'PATIENT' && !isAdmin

  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'D'

  const roleLabel = isAdmin
    ? 'Administrator'
    : role === 'PSYCHIATRIST'
    ? 'Psychiatrist'
    : role === 'THERAPIST'
    ? 'Therapist'
    : role === 'COUNSELLOR'
    ? 'Counsellor'
    : 'Client Member'

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#D3CCE2] bg-[#EAE6F0]/95 px-4 backdrop-blur-md lg:hidden">
        <Link
          href={isAdmin ? '/admin' : isProfessional ? '/pro' : '/dashboard'}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#221C35] text-[#BD6999] shadow-sm">
            <Sparkles className="h-4 w-4 text-[#BD6999]" />
          </span>
          <span className="text-base font-bold tracking-tight text-[#221C35]">
            Destiny<span className="text-[#BD6999]">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EBE4F2] text-xs font-bold text-[#483D76]">
              {initials}
            </span>
            <span className="max-w-28 truncate text-xs font-semibold text-[#221C35] sm:max-w-40">
              {name}
            </span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => void signOut({ callbackUrl: '/' })}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#766F8C] transition hover:bg-[#FBECEF] hover:text-[#6B3346]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-[#D3CCE2] bg-[#EAE6F0] lg:flex">
        {/* Brand Header */}
        <div className="border-b border-[#D3CCE2] px-6 py-6">
          <Link
            href={isAdmin ? '/admin' : isProfessional ? '/pro' : '/dashboard'}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#221C35] text-[#BD6999] shadow-md shadow-[#221C35]/10">
              <Sparkles className="h-5 w-5 text-[#BD6999]" />
            </span>
            <div>
              <span className="block text-lg font-bold tracking-tight text-[#221C35]">
                Destiny<span className="text-[#BD6999]">.</span>
              </span>
              <span className="block text-xs font-medium text-[#766F8C]">
                Care on your terms
              </span>
            </div>
          </Link>
        </div>

        {/* Member Profile Badge */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] p-3.5 shadow-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#483D76] text-sm font-bold text-[#F5F3F8] shadow-sm">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[#221C35]">{name}</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#EBE4F2] px-2 py-0.5 text-[11px] font-semibold text-[#483D76] shadow-2xs border border-[#C8BCE0] mt-1">
                <BadgeCheck className="h-3 w-3 text-[#483D76]" />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items Scrollable */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-4 py-6">
          {isAdmin ? (
            <div className="space-y-1">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                Administration
              </p>
              <Link
                href="/admin"
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                  pathname === '/admin'
                    ? 'bg-[#483D76] text-[#F5F3F8] shadow-sm hover:bg-[#372E5A]'
                    : 'text-[#554E6B] hover:bg-[#EBE4F2]/70 hover:text-[#221C35]'
                )}
              >
                <ShieldCheck className={cn('h-4 w-4', pathname === '/admin' ? 'text-[#F5F3F8]' : 'text-[#766F8C]')} />
                Admin Workspace
              </Link>
            </div>
          ) : isProfessional ? (
            <div className="space-y-4">
              <div>
                <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-[#766F8C]">
                  Practice Workspace
                </p>
                <div className="space-y-1">
                  <Link
                    href="/pro"
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                      pathname === '/pro'
                        ? 'bg-[#483D76] text-[#F5F3F8] shadow-sm hover:bg-[#372E5A]'
                        : 'text-[#554E6B] hover:bg-[#EBE4F2]/70 hover:text-[#221C35]'
                    )}
                  >
                    <Stethoscope className={cn('h-4 w-4', pathname === '/pro' ? 'text-[#FBF9F5]' : 'text-[#766F8C]')} />
                    Professional Console
                  </Link>
                  <Link
                    href="/appointments"
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                      pathname === '/appointments'
                        ? 'bg-[#483D76] text-[#F5F3F8] shadow-sm hover:bg-[#372E5A]'
                        : 'text-[#554E6B] hover:bg-[#EBE4F2]/70 hover:text-[#221C35]'
                    )}
                  >
                    <CalendarDays className={cn('h-4 w-4', pathname === '/appointments' ? 'text-[#F5F3F8]' : 'text-[#766F8C]')} />
                    My Sessions
                  </Link>
                  <Link
                    href="/helpdesk"
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                      pathname === '/helpdesk'
                        ? 'bg-[#483D76] text-[#F5F3F8] shadow-sm hover:bg-[#372E5A]'
                        : 'text-[#554E6B] hover:bg-[#EBE4F2]/70 hover:text-[#221C35]'
                    )}
                  >
                    <MessageCircleHeart className={cn('h-4 w-4', pathname === '/helpdesk' ? 'text-[#F5F3F8]' : 'text-[#766F8C]')} />
                    Help Desk
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {patientNavGroups.map((group) => (
                <div key={group.title}>
                  <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#766F8C]">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map(({ href, icon: Icon, label }) => {
                      const active =
                        pathname === href ||
                        (href !== '/dashboard' && pathname.startsWith(`${href}/`)) ||
                        (href === '/therapists' && pathname.startsWith('/professionals/'))
                      return (
                        <Link
                          key={href}
                          href={href}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'group flex min-h-10 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                            active
                              ? 'bg-[#483D76] text-[#F5F3F8] shadow-sm hover:bg-[#372E5A]'
                              : 'text-[#554E6B] hover:bg-[#EBE4F2]/70 hover:text-[#221C35]'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition',
                              active
                                ? 'text-[#F5F3F8]'
                                : 'text-[#766F8C] group-hover:text-[#483D76]'
                            )}
                          />
                          {label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Emergency Reassurance Card */}
        {!isProfessional && !isAdmin && (
          <div className="px-4 pb-3">
            <div className="rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] p-3.5 text-[#6B3346]">
              <p className="text-xs font-bold text-[#6B3346]">Immediate Help in India</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#6B3346]/90">
                Emergency <a href="tel:112" className="font-bold underline text-[#BD6999]">112</a> · Tele-MANAS{' '}
                <a href="tel:14416" className="font-bold underline text-[#BD6999]">14416</a>
              </p>
            </div>
          </div>
        )}

        {/* Sign Out Footer */}
        <div className="border-t border-[#D3CCE2] p-3">
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: '/' })}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-medium text-[#554E6B] transition hover:bg-[#FBECEF] hover:text-[#6B3346]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
            <span className="ml-auto max-w-28 truncate text-[10px] text-[#766F8C]">{email}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
