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
    <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">How are things feeling right now?</h3>
            <p className="text-xs text-slate-500">Pick whatever resonates most today</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
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
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? `${item.borderColor} ${item.bgSoft} ring-2 shadow-sm`
                  : 'border-slate-200/80 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                {item.emoji}
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{item.subtitle}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Reassurance & Suggested Next Step */}
      <div className="mt-5 rounded-2xl border border-slate-200/90 bg-[#FAF9F6] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Brain className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-700">{current.reassurance}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> Free · Anonymous · No pressure
              </span>
              <Link
                href={destinationHref}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-600"
              >
                {current.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Step reassurance bar */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50/80 py-3 text-center">
        <div className="px-2">
          <span className="text-[11px] font-bold text-indigo-600">01. Reflect</span>
          <p className="text-[10px] text-slate-500">3-min private assessment</p>
        </div>
        <div className="px-2">
          <span className="text-[11px] font-bold text-violet-600">02. Understand</span>
          <p className="text-[10px] text-slate-500">Human-language report</p>
        </div>
        <div className="px-2">
          <span className="text-[11px] font-bold text-teal-600">03. Support</span>
          <p className="text-[10px] text-slate-500">Connect in your time</p>
        </div>
      </div>
    </div>
  )
}
