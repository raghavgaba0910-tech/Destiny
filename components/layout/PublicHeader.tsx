'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Menu, X, ShieldAlert, Heart, User, Briefcase } from 'lucide-react'

type PublicHeaderProps = {
  isLoggedIn: boolean
  homeHref: string
}

export function PublicHeader({ isLoggedIn, homeHref }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#FAF9F6]/90 backdrop-blur-md">
      <nav aria-label="Main navigation" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3" aria-label="Destiny home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-indigo-950/10 transition group-hover:bg-indigo-600">
            <Sparkles className="h-5 w-5 text-teal-400" />
          </span>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Destiny<span className="text-violet-600">.</span>
            </span>
            <span className="hidden text-[11px] font-medium text-slate-500 sm:block">
              Mental Wellbeing & Care
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a href="#how-it-works" className="transition hover:text-indigo-600">
            How It Works
          </a>
          <a href="#care-options" className="transition hover:text-indigo-600">
            Care Options
          </a>
          <a href="#assessments" className="transition hover:text-indigo-600">
            Assessments
          </a>
          <a href="#faq" className="transition hover:text-indigo-600">
            FAQs
          </a>
        </div>

        {/* Action Buttons */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/for-professionals"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50"
          >
            For Professionals
          </Link>

          {isLoggedIn ? (
            <Link
              href={homeHref}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              My Space <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              href="/for-patients"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm shadow-slate-900/10 transition hover:bg-indigo-600"
            >
              For Clients
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 sm:hidden">
          {isLoggedIn ? (
            <Link
              href={homeHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white"
            >
              My Space
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white"
            >
              Start
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-5 py-6 shadow-xl sm:hidden">
          <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-slate-50"
            >
              How It Works
            </a>
            <a
              href="#care-options"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-slate-50"
            >
              Care Options (Counsellors, Therapists, Psychiatrists)
            </a>
            <a
              href="#assessments"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-slate-50"
            >
              Clinical Assessments
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-slate-50"
            >
              Frequently Asked Questions
            </a>
            <hr className="my-2 border-slate-100" />
            <Link
              href="/for-patients"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl p-2.5 text-indigo-600 hover:bg-indigo-50"
            >
              <User className="h-4 w-4" /> Client Portal
            </Link>
            <Link
              href="/for-professionals"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50"
            >
              <Briefcase className="h-4 w-4" /> Professional Workspace & Portal
            </Link>
            {!isLoggedIn && (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/for-patients"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-xl bg-slate-900 font-semibold text-white"
                >
                  For Clients
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
