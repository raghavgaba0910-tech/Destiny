'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { assessmentQuestions } from '@/lib/questions'
import type { AssessmentType } from '@prisma/client'

type AssessmentQuestion = (typeof assessmentQuestions)[AssessmentType][number]

export function AssessmentRunner({ type }: { type: AssessmentType }) {
  const questions = assessmentQuestions[type] as readonly AssessmentQuestion[]
  const storageKey = `destiny-assessment-${type}`
  const [answers, setAnswers] = useState<number[]>([])
  const [index, setIndex] = useState(0)
  const [restored, setRestored] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const question = questions[index]

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.answers) && parsed.answers.length === questions.length) setAnswers(parsed.answers)
        if (Number.isInteger(parsed.index)) setIndex(Math.min(Math.max(parsed.index, 0), questions.length - 1))
      } catch {
        window.localStorage.removeItem(storageKey)
      }
    }
    setRestored(true)
  }, [questions.length, storageKey])

  useEffect(() => {
    if (!restored) return
    window.localStorage.setItem(storageKey, JSON.stringify({ answers, index }))
  }, [answers, index, restored, storageKey])

  const submit = useCallback(async () => {
    if (answers.length !== questions.length || answers.some((value) => value === undefined)) return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, answers }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Could not save your assessment.')
      window.localStorage.removeItem(storageKey)
      router.push(`/assessment/result/${body.id}?email=${body.emailDelivery}`)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save your assessment.')
      setSubmitting(false)
    }
  }, [answers, questions.length, router, storageKey, type])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key >= '1' && event.key <= String(question.options.length)) {
        setAnswers((current) => {
          const next = [...current]
          next[index] = question.scores[Number(event.key) - 1]
          return next
        })
      } else if (event.key === 'ArrowRight' && answers[index] !== undefined && index < questions.length - 1) {
        setIndex((current) => current + 1)
      } else if (event.key === 'Enter' && index === questions.length - 1) {
        void submit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [answers, index, question.options.length, question.scores, questions.length, submit])

  function select(score: number) {
    setAnswers((current) => {
      const next = [...current]
      next[index] = score
      return next
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-16 text-[#221C35]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#766F8C]">A private assessment · about 5 minutes</p>
      <div className="mt-5 flex items-center justify-between text-sm text-[#554E6B]">
        <span>Question {index + 1} of {questions.length}</span>
        <span>{Math.round(((index + 1) / questions.length) * 100)}%</span>
      </div>
      <Progress value={((index + 1) / questions.length) * 100} className="mt-2 h-2" />
      <section className="mt-8 rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-sm md:p-10">
        <h1 className="text-2xl font-bold leading-snug text-[#221C35] md:text-3xl">{question.text}</h1>
        <div className="mt-8 space-y-3">
          {question.options.map((option, optionIndex) => {
            const selected = answers[index] === question.scores[optionIndex]
            return (
              <button
                key={option}
                type="button"
                onClick={() => select(question.scores[optionIndex])}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? 'border-2 border-[#483D76] bg-[#EBE4F2] text-[#221C35] ring-2 ring-[#483D76]/20' : 'border-[#D3CCE2] bg-[#F5F3F8] text-[#221C35] hover:border-[#BD6999] hover:bg-white'}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${selected ? 'border-[#483D76] bg-[#483D76] text-[#F5F3F8]' : 'border-[#D3CCE2] bg-white text-[#554E6B]'}`}>{optionIndex + 1}</span>
                <span className="font-medium">{option}</span>
              </button>
            )
          })}
        </div>
        {type === 'DEPRESSION' && index === 8 && answers[index] > 0 && (
          <div role="alert" className="mt-6 rounded-2xl border border-[#E8C8D2] bg-[#FBECEF] p-4 text-sm text-[#6B3346]">
            <strong>You deserve support right now.</strong> If you may be in immediate danger, call India emergency services at <a className="font-bold underline text-[#BD6999]" href="tel:112">112</a>. For mental health support, call Tele-MANAS at <a className="font-bold underline text-[#BD6999]" href="tel:14416">14416</a>. This screening is not emergency care.
          </div>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-[#6B3346]">{error}</p>}
        <div className="mt-8 flex justify-between gap-3">
          <Button variant="outline" disabled={index === 0} onClick={() => setIndex((current) => current - 1)} className="rounded-xl border-[#D3CCE2] text-[#221C35] hover:bg-[#EAE6F0]">Back</Button>
          {index < questions.length - 1
            ? <Button disabled={answers[index] === undefined} onClick={() => setIndex((current) => current + 1)} className="rounded-xl bg-[#483D76] text-[#F5F3F8] hover:bg-[#372E5A]">Continue</Button>
            : <Button disabled={answers[index] === undefined || submitting} onClick={() => void submit()} className="rounded-xl bg-[#483D76] text-[#F5F3F8] hover:bg-[#372E5A]">{submitting ? 'Saving…' : 'See my care report'}</Button>}
        </div>
      </section>
      <p className="mt-5 text-center text-xs text-[#766F8C]">Your progress saves on this device. Use 1–{question.options.length} to select an answer.</p>
    </div>
  )
}
