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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <Link
          href={isAdmin ? '/admin' : isProfessional ? '/pro' : '/dashboard'}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-4 w-4 text-teal-400" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Destiny<span className="text-violet-600">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {initials}
            </span>
            <span className="max-w-28 truncate text-xs font-semibold text-slate-700 sm:max-w-40">
              {name}
            </span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => void signOut({ callbackUrl: '/' })}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-slate-200/80 bg-white lg:flex">
        {/* Brand Header */}
        <div className="border-b border-slate-100 px-6 py-6">
          <Link
            href={isAdmin ? '/admin' : isProfessional ? '/pro' : '/dashboard'}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-indigo-950/10">
              <Sparkles className="h-5 w-5 text-teal-400" />
            </span>
            <div>
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                Destiny<span className="text-violet-600">.</span>
              </span>
              <span className="block text-xs font-medium text-slate-400">
                Care on your terms
              </span>
            </div>
          </Link>
        </div>

        {/* Member Profile Badge */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#FAF9F6] p-3.5 shadow-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-slate-900">{name}</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-indigo-700 shadow-2xs border border-slate-200/60 mt-1">
                <BadgeCheck className="h-3 w-3 text-teal-600" />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items Scrollable */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-4 py-6">
          {isAdmin ? (
            <div className="space-y-1">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Administration
              </p>
              <Link
                href="/admin"
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                  pathname === '/admin'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                Admin Workspace
              </Link>
            </div>
          ) : isProfessional ? (
            <div className="space-y-4">
              <div>
                <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Practice Workspace
                </p>
                <div className="space-y-1">
                  <Link
                    href="/pro"
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                      pathname === '/pro'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Stethoscope className="h-4 w-4 text-teal-400" />
                    Professional Console
                  </Link>
                  <Link
                    href="/appointments"
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                      pathname === '/appointments'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    My Sessions
                  </Link>
                  <Link
                    href="/helpdesk"
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition',
                      pathname === '/helpdesk'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <MessageCircleHeart className="h-4 w-4 text-violet-500" />
                    Help Desk
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {patientNavGroups.map((group) => (
                <div key={group.title}>
                  <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition',
                              active
                                ? 'text-teal-400'
                                : 'text-slate-400 group-hover:text-indigo-600'
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
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 p-3.5">
              <p className="text-xs font-bold text-rose-950">Immediate Help in India</p>
              <p className="mt-1 text-[11px] leading-relaxed text-rose-900/80">
                Emergency <a href="tel:112" className="font-bold underline">112</a> · Tele-MANAS{' '}
                <a href="tel:14416" className="font-bold underline">14416</a>
              </p>
            </div>
          </div>
        )}

        {/* Sign Out Footer */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: '/' })}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
            <span className="ml-auto max-w-28 truncate text-[10px] text-slate-400">{email}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
