'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Brain, Heart, Sparkles, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react'

type MoodKey = 'anxious' | 'low' | 'burned' | 'talk'

type MoodOption = {
  key: MoodKey
  emoji: string
  label: string
  subtitle: string
  reassurance: string
  recommendedPath: string
  actionLabel: string
  accentColor: string
  borderColor: string
  bgSoft: string
}

const moodOptions: MoodOption[] = [
  {
    key: 'anxious',
    emoji: '🌀',
    label: 'Anxious or on edge',
    subtitle: 'Racing thoughts, tension, restlessness',
    reassurance: 'It is completely normal to feel overwhelmed. A gentle assessment can help slow things down and bring clarity.',
    recommendedPath: '/assessment/anxiety',
    actionLabel: 'Take anxiety assessment',
    accentColor: 'text-indigo-600',
    borderColor: 'border-indigo-300 ring-indigo-500/20',
    bgSoft: 'bg-indigo-50/70',
  },
  {
    key: 'low',
    emoji: '☁️',
    label: 'Feeling low or numb',
    subtitle: 'Low energy, lack of joy or motivation',
    reassurance: 'You do not have to force yourself to be cheerful. Take things one small breath at a time.',
    recommendedPath: '/assessment/depression',
    actionLabel: 'Take mood assessment',
    accentColor: 'text-violet-600',
    borderColor: 'border-violet-300 ring-violet-500/20',
    bgSoft: 'bg-violet-50/70',
  },
  {
    key: 'burned',
    emoji: '🍂',
    label: 'Stressed & burned out',
    subtitle: 'Exhausted by work, study, or family',
    reassurance: 'Chronic pressure takes a heavy toll. Let us help you identify what your mind and body need right now.',
    recommendedPath: '/assessment/stress',
    actionLabel: 'Take stress assessment',
    accentColor: 'text-teal-600',
    borderColor: 'border-teal-300 ring-teal-500/20',
    bgSoft: 'bg-teal-50/70',
  },
  {
    key: 'talk',
    emoji: '🌱',
    label: 'Need someone to talk to',
    subtitle: 'Looking for a supportive listener',
    reassurance: 'Speaking with an empathetic, accredited professional can make all the difference. Explore verified profiles.',
    recommendedPath: '/therapists',
    actionLabel: 'Explore caring professionals',
    accentColor: 'text-rose-600',
    borderColor: 'border-rose-300 ring-rose-500/20',
    bgSoft: 'bg-rose-50/70',
  },
]

export function HomeInteractiveCare({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [selectedMood, setSelectedMood] = useState<MoodKey>('anxious')
  const current = moodOptions.find((m) => m.key === selectedMood) ?? moodOptions[0]
  const destinationHref = isLoggedIn ? current.recommendedPath : '/for-patients'

  return (
    <div className="relative rounded-3xl border border-[#D3CCE2] bg-[#EAE6F0] p-6 shadow-xl shadow-[#221C35]/5 sm:p-8">
      <div className="flex items-center justify-between border-b border-[#D3CCE2] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EBE4F2] text-[#483D76]">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#221C35]">How are things feeling right now?</h3>
            <p className="text-xs text-[#554E6B]">Pick whatever resonates most today</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C8BCE0] bg-[#EBE4F2] px-3 py-1 text-xs font-semibold text-[#483D76]">
          <Sparkles className="h-3.5 w-3.5" /> Gentle Start
        </span>
      </div>

      {/* Mood Selector Grid */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {moodOptions.map((item) => {
          const isSelected = item.key === selectedMood
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedMood(item.key)}
              className={`flex items-start gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-[#483D76] bg-[#EBE4F2] shadow-sm'
                  : 'border border-[#D3CCE2] bg-[#F5F3F8] hover:border-[#C8BCE0] hover:bg-white'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg shadow-xs transition ${
                  isSelected ? 'bg-[#483D76] text-white' : 'bg-white text-slate-800'
                }`}
              >
                {item.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight text-[#221C35]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-[#554E6B]">{item.subtitle}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Reassurance & Suggested Next Step */}
      <div className="mt-5 rounded-2xl border border-[#D3CCE2] bg-[#F5F3F8] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#EBE4F2] text-[#483D76]">
            <Brain className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-[#554E6B]">{current.reassurance}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#D3CCE2] pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#766F8C]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#483D76]" /> Free · Anonymous · No pressure
              </span>
              <Link
                href={destinationHref}
                className="inline-flex items-center gap-2 rounded-xl bg-[#483D76] px-4 py-2 text-xs font-bold text-[#F5F3F8] shadow-sm transition hover:bg-[#372E5A]"
              >
                {current.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Step reassurance bar */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-[#D3CCE2] rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] py-3 text-center">
        <div className="px-2">
          <span className="text-[11px] font-bold text-[#483D76]">01. Reflect</span>
          <p className="text-[10px] text-[#554E6B]">3-min private assessment</p>
        </div>
        <div className="px-2">
          <span className="text-[11px] font-bold text-[#BD6999]">02. Understand</span>
          <p className="text-[10px] text-[#554E6B]">Human-language report</p>
        </div>
        <div className="px-2">
          <span className="text-[11px] font-bold text-[#483D76]">03. Support</span>
          <p className="text-[10px] text-[#554E6B]">Connect in your time</p>
        </div>
      </div>
    </div>
  )
}
