'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowDownUp, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Search, SlidersHorizontal, Star, Video } from 'lucide-react'
import { GradientAvatar } from '@/components/destiny/GradientAvatar'

type Professional = {
  id: string
  professionalCode: string
  type: string
  specialties: string[]
  languages: string[]
  bio: string
  experience: number
  rating: number
  pricePerSession: number
  tier: string
  user: { name: string }
}

const formatPrice = new Intl.NumberFormat('en-IN')

export function ProfessionalsPage({ professionals, heading }: { professionals: Professional[]; heading: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const specialty = searchParams.get('specialty') ?? 'all'
  const tier = searchParams.get('tier') ?? 'all'
  const sort = searchParams.get('sort') ?? 'rating'
  const query = searchParams.get('q') ?? ''
  const specialties = useMemo(() => Array.from(new Set(professionals.flatMap((person) => person.specialties))).sort(), [professionals])
  const visible = useMemo(() => professionals
    .filter((person) => specialty === 'all' || person.specialties.includes(specialty))
    .filter((person) => tier === 'all' || person.tier === tier)
    .filter((person) => {
      const normalizedQuery = query.trim().toLocaleLowerCase()
      return !normalizedQuery
        || person.professionalCode.toLocaleLowerCase().includes(normalizedQuery)
        || person.user.name.toLocaleLowerCase().includes(normalizedQuery)
        || person.specialties.some((item) => item.toLocaleLowerCase().includes(normalizedQuery))
        || person.languages.some((item) => item.toLocaleLowerCase().includes(normalizedQuery))
    })
    .sort((a, b) => sort === 'price' ? a.pricePerSession - b.pricePerSession : b.rating - a.rating),
  [professionals, specialty, tier, sort, query])

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false })
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false })
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-1/4 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
            <Link href="/dashboard" className="transition hover:text-white">Your Sanctuary</Link><span aria-hidden="true">/</span><span className="text-white">Find Support</span>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1 text-xs font-semibold text-teal-300"><span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" /> TAKE YOUR TIME · FIND YOUR FIT</span>
              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{heading}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">Good support starts with feeling heard. Explore profiles and choose an accredited professional whose approach feels right for you.</p>
            </div>
            <div className="flex gap-3 lg:pb-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{professionals.length}</p><p className="mt-1 text-xs text-slate-300 font-medium">available providers</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-teal-300">Online</p><p className="mt-1 text-xs text-slate-300 font-medium">video sessions</p>
              </div>
            </div>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300 font-medium">
            <span className="inline-flex items-center gap-2"><Video className="h-4 w-4 text-teal-400" /> Private video sessions</span>
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-teal-400" /> Flexible weekday booking</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-teal-400" /> Verified professional IDs</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <section aria-label="Filter professionals" className="relative z-10 -mt-6 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-lg shadow-slate-900/5 md:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><SlidersHorizontal className="h-4 w-4 text-indigo-600" /> Filter &amp; Search Care Providers</div>
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1.4fr)_minmax(170px,1fr)_minmax(150px,.75fr)_minmax(170px,.9fr)]">
            <label className="relative block">
              <span className="sr-only">Search by name, specialty, or language</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => updateFilter('q', event.target.value)} placeholder="Name, specialty, language…" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet focus:bg-white focus:ring-4 focus:ring-violet/10" />
            </label>
            <label className="block">
              <span className="sr-only">Filter by area of support</span>
              <select value={specialty} onChange={(event) => updateFilter('specialty', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-violet focus:bg-white focus:ring-4 focus:ring-violet/10">
                <option value="all">All areas of support</option>{specialties.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Filter by price tier</span>
              <select value={tier} onChange={(event) => updateFilter('tier', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-violet focus:bg-white focus:ring-4 focus:ring-violet/10">
                <option value="all">Any price tier</option><option value="A">Tier 1 · ₹999–₹1,499</option><option value="B">Tier 2 · ₹1,999–₹2,499</option><option value="C">Tier 3 · ₹2,999–₹3,500</option>
              </select>
            </label>
            <label className="relative block">
              <span className="sr-only">Sort professionals</span>
              <ArrowDownUp aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select value={sort} onChange={(event) => updateFilter('sort', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-violet focus:bg-white focus:ring-4 focus:ring-violet/10">
                <option value="rating">Highest rated</option><option value="price">Lowest session fee</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p aria-live="polite" className="text-sm text-slate-500"><span className="font-semibold text-ink">{visible.length}</span> {visible.length === 1 ? 'person' : 'people'} to explore</p>
            {(specialty !== 'all' || tier !== 'all' || query) && <button type="button" onClick={clearFilters} className="text-sm font-semibold text-violet transition hover:text-indigo">Clear filters</button>}
          </div>
        </section>

        <section className="mt-7" aria-label="Professional results">
          {visible.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {visible.map((person, index) => (
                <article key={person.id} className="group relative overflow-hidden rounded-[1.65rem] border border-slate-200/90 bg-white p-5 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg sm:p-6">
                  <div aria-hidden="true" className={`absolute right-0 top-0 h-28 w-28 rounded-bl-[5rem] opacity-70 ${index % 2 ? 'bg-teal/5' : 'bg-violet/5'}`} />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <GradientAvatar name={person.user.name} size="lg" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">{person.type.toLowerCase()}</span>
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">Tier {person.tier === 'A' ? '1' : person.tier === 'B' ? '2' : '3'}</span>
                            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500">{person.professionalCode}</span>
                          </div>
                          <h2 className="mt-2 truncate text-lg font-bold tracking-tight text-slate-900">{person.user.name}</h2>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><BriefcaseBusiness className="h-3.5 w-3.5 text-slate-400" />{person.experience} years experience</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-sm font-semibold text-amber-800"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{person.rating.toFixed(1)}</div>
                    </div>

                    <p className="mt-5 line-clamp-2 min-h-12 text-sm leading-relaxed text-slate-600">{person.bio}</p>
                    <div className="mt-4 flex min-h-7 flex-wrap gap-2">{person.specialties.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{tag}</span>)}{person.specialties.length > 3 && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">+{person.specialties.length - 3}</span>}</div>

                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><span className="font-semibold text-slate-700">Speaks</span><span className="truncate">{person.languages.join(' · ')}</span></div>
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
                      <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session fee</p><p className="mt-0.5 text-xl font-bold text-slate-900">₹{formatPrice.format(person.pricePerSession)}<span className="ml-1 text-xs font-normal text-slate-500">/ session</span></p></div>
                      <Link href={`/professionals/${person.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-indigo-600">
                        View profile <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/10 text-violet"><Search className="h-6 w-6" /></div>
              <h2 className="mt-5 text-lg font-semibold text-ink">No one matches those filters just yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Try a broader search or clear the filters to see all available professionals.</p>
              <button type="button" onClick={clearFilters} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo px-4 text-sm font-semibold text-white transition hover:bg-indigo/90">Show everyone <ArrowRight className="h-4 w-4" /></button>
            </div>
          )}
        </section>

        <aside className="mt-8 flex gap-3 rounded-2xl border border-indigo/10 bg-indigo/[0.035] p-4 text-sm leading-6 text-slate-600">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo" />
          <p><span className="font-semibold text-ink">A note about this directory:</span> profiles and availability are sample data for this MVP. They are not verified providers or a substitute for professional or emergency care.</p>
        </aside>
      </div>
    </main>
  )
}
