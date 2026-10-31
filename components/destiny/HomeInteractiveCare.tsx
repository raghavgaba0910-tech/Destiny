'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  Heart,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  MessageCircleHeart,
  Pill,
  CheckCircle2,
} from 'lucide-react'

type FeatureKey = 'assessments' | 'professional' | 'counselor' | 'medications'

type FeatureOption = {
  key: FeatureKey
  icon: typeof Brain
  label: string
  subtitle: string
  reassurance: string
  actionLabel: string
  badge: string
  recommendedPath: string
}

const featureOptions: FeatureOption[] = [
  {
    key: 'assessments',
    icon: Brain,
    label: 'Assessments',
    subtitle: 'Private clinically recognized self-evaluations',
    reassurance:
      'Confidential clinical screenings (PHQ-9 & GAD-7) that give you an immediate, easy-to-read care report in human language with tailored next steps.',
    actionLabel: 'Take Free Assessment',
    badge: 'Confidential & Free',
    recommendedPath: '/assessment',
  },
  {
    key: 'professional',
    icon: Stethoscope,
    label: 'Professional Help',
    subtitle: 'Accredited therapists & psychiatrists',
    reassurance:
      'Connect 1-on-1 with accredited psychologists and psychiatric doctors for structured therapy (CBT), clinical diagnoses, and specialized medical care.',
    actionLabel: 'Explore Clinicians',
    badge: 'Verified Clinicians',
    recommendedPath: '/therapists',
  },
  {
    key: 'counselor',
    icon: MessageCircleHeart,
    label: 'Counselor',
    subtitle: 'Compassionate sounding boards for life stress',
    reassurance:
      'A warm, non-judgmental space to talk through relationship challenges, workplace burnout, academic anxiety, and everyday emotional crossroads.',
    actionLabel: 'Connect with a Counselor',
    badge: 'Empathetic Support',
    recommendedPath: '/counsellors',
  },
  {
    key: 'medications',
    icon: Pill,
    label: 'Medications',
    subtitle: 'Verified prescriptions & doorstep delivery',
    reassurance:
      'Secure e-pharmacy orders and certified psychiatric prescription fulfillment delivered discreetly to your doorstep with continuous clinical review.',
    actionLabel: 'Explore E-Pharmacy',
    badge: 'Doorstep Care',
    recommendedPath: '/pharmacy',
  },
]

export function HomeInteractiveCare({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey>('assessments')
  const current = featureOptions.find((f) => f.key === selectedFeature) ?? featureOptions[0]
  const CurrentIcon = current.icon

  const destinationHref = isLoggedIn ? current.recommendedPath : '/for-patients'

  return (
    <div className="relative rounded-3xl border border-[#D3CCE2] bg-[#EAE6F0] p-4 sm:p-7 lg:p-8 shadow-xl shadow-[#221C35]/5">
      {/* Header bar */}
      <div className="flex flex-col gap-2.5 border-b border-[#D3CCE2] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76] shadow-xs">
            <Heart className="h-5 w-5 text-[#483D76]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#221C35] sm:text-base">Core Care Features</h3>
            <p className="text-xs text-[#554E6B]">Choose a feature to explore how Destiny supports you</p>
          </div>
        </div>
        <span className="self-start inline-flex items-center gap-1.5 rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-3 py-1 text-xs font-semibold text-[#483D76] sm:self-auto">
          <Sparkles className="h-3.5 w-3.5 text-[#BD6999]" /> 4 Core Features
        </span>
      </div>

      {/* 4 Feature Selector Grid */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {featureOptions.map((item) => {
          const isSelected = item.key === selectedFeature
          const IconComponent = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedFeature(item.key)}
              className={`group flex items-start gap-3 rounded-2xl p-3 sm:p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-[#483D76] bg-[#EBE4F2] shadow-sm ring-1 ring-[#483D76]/20'
                  : 'border border-[#D3CCE2] bg-[#F5F3F8] hover:border-[#C8BCE0] hover:bg-white'
              }`}
            >
              <span
                className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl text-base shadow-xs transition-colors ${
                  isSelected
                    ? 'bg-[#483D76] text-[#F5F3F8]'
                    : 'bg-white text-[#483D76] group-hover:bg-[#EBE4F2]'
                }`}
              >
                <IconComponent className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs sm:text-sm font-bold leading-tight text-[#221C35]">
                    {item.label}
                  </p>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-[#BD6999] shrink-0" />
                  )}
                </div>
                <p className="mt-0.5 sm:mt-1 text-[11px] leading-4 text-[#554E6B] line-clamp-2">
                  {item.subtitle}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Reassurance & Suggested Next Step Box */}
      <div className="mt-4 sm:mt-5 rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EBE4F2] text-[#483D76]">
            <CurrentIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-[#C8BCE0] bg-[#EBE4F2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#483D76]">
                {current.badge}
              </span>
              <span className="text-xs font-bold text-[#221C35]">{current.label}</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[#554E6B]">
              {current.reassurance}
            </p>

            <div className="mt-4 flex flex-col gap-3 border-t border-[#D3CCE2] pt-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#766F8C]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#483D76]" /> Free · Confidential · No pressure
              </span>
              <Link
                href={destinationHref}
                className="inline-flex h-10 sm:h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#483D76] px-5 text-xs font-bold text-[#F5F3F8] shadow-md shadow-[#483D76]/15 transition hover:bg-[#372E5A] active:scale-[0.98]"
              >
                {current.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Step reassurance bar with 'Get Personalized Therapy' */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 divide-y divide-[#D3CCE2] rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] text-center sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
        <div className="p-2.5 sm:p-3">
          <span className="block text-[11px] font-bold text-[#483D76]">01. Reflect</span>
          <p className="mt-0.5 text-[10px] text-[#554E6B]">3-min private assessment</p>
        </div>
        <div className="p-2.5 sm:p-3">
          <span className="block text-[11px] font-bold text-[#BD6999]">02. Understand</span>
          <p className="mt-0.5 text-[10px] text-[#554E6B]">Human-language report</p>
        </div>
        <div className="p-2.5 sm:p-3">
          <span className="block text-[11px] font-bold text-[#483D76]">03. Get Personalized Therapy</span>
          <p className="mt-0.5 text-[10px] text-[#554E6B]">Connect in your time</p>
        </div>
      </div>
    </div>
  )
}
