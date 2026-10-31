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
    <header className="sticky top-0 z-50 border-b border-[#D3CCE2] bg-[#F5F3F8]/95 backdrop-blur-md">
      <nav aria-label="Main navigation" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3" aria-label="Destiny home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#221C35] text-[#BD6999] shadow-md shadow-[#221C35]/10 transition group-hover:bg-[#483D76]">
            <Sparkles className="h-5 w-5 text-[#BD6999]" />
          </span>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#221C35]">
              Destiny<span className="text-[#BD6999]">.</span>
            </span>
            <span className="hidden text-[11px] font-medium text-[#766F8C] sm:block">
              Mental Wellbeing & Care
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden items-center gap-8 text-sm font-semibold text-[#554E6B] md:flex">
          <a href="#how-it-works" className="transition hover:text-[#483D76]">
            How It Works
          </a>
          <a href="#care-options" className="transition hover:text-[#483D76]">
            Care Options
          </a>
          <a href="#assessments" className="transition hover:text-[#483D76]">
            Assessments
          </a>
          <a href="#faq" className="transition hover:text-[#483D76]">
            FAQs
          </a>
        </div>

        {/* Action Buttons */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/for-professionals"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-4 text-xs font-semibold text-[#221C35] shadow-sm transition hover:border-[#C8BCE0] hover:bg-[#EAE6F0]"
          >
            For Professionals
          </Link>

          {isLoggedIn ? (
            <Link
              href={homeHref}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#483D76] px-4 text-xs font-semibold text-[#F5F3F8] shadow-sm transition hover:bg-[#372E5A]"
            >
              My Space <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              href="/for-patients"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#483D76] px-4 text-xs font-semibold text-[#F5F3F8] shadow-sm shadow-[#483D76]/10 transition hover:bg-[#372E5A]"
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
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#483D76] px-3 text-xs font-semibold text-[#F5F3F8]"
            >
              My Space
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#483D76] px-3 text-xs font-semibold text-[#F5F3F8]"
            >
              Start
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] text-[#221C35]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#D3CCE2] bg-[#F5F3F8] px-5 py-6 shadow-xl sm:hidden">
          <div className="flex flex-col gap-3 text-sm font-semibold text-[#554E6B]">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-[#EAE6F0] hover:text-[#221C35]"
            >
              How It Works
            </a>
            <a
              href="#care-options"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-[#EAE6F0] hover:text-[#221C35]"
            >
              Care Options (Counsellors, Therapists, Psychiatrists)
            </a>
            <a
              href="#assessments"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-[#EAE6F0] hover:text-[#221C35]"
            >
              Clinical Assessments
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2.5 hover:bg-[#EAE6F0] hover:text-[#221C35]"
            >
              Frequently Asked Questions
            </a>
            <hr className="my-2 border-[#D3CCE2]" />
            <Link
              href="/for-patients"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl p-2.5 text-[#483D76] hover:bg-[#EBE4F2]"
            >
              <User className="h-4 w-4" /> Client Portal
            </Link>
            <Link
              href="/for-professionals"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl p-2.5 text-[#554E6B] hover:bg-[#EAE6F0] hover:text-[#221C35]"
            >
              <Briefcase className="h-4 w-4" /> Professional Workspace & Portal
            </Link>
            {!isLoggedIn && (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/for-patients"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-xl bg-[#483D76] font-semibold text-[#F5F3F8]"
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
