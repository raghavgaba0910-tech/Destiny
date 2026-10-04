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
      router.push(`/assessment/result/${body.id}`)
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
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet">A private check-in · about 5 minutes</p>
      <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {index + 1} of {questions.length}</span>
        <span>{Math.round(((index + 1) / questions.length) * 100)}%</span>
      </div>
      <Progress value={((index + 1) / questions.length) * 100} className="mt-2 h-2" />
      <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm md:p-10">
        <h1 className="text-2xl font-bold leading-snug md:text-3xl">{question.text}</h1>
        <div className="mt-8 space-y-3">
          {question.options.map((option, optionIndex) => {
            const selected = answers[index] === question.scores[optionIndex]
            return (
              <button
                key={option}
                type="button"
                onClick={() => select(question.scores[optionIndex])}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? 'border-violet bg-violet/5 ring-2 ring-violet/20' : 'hover:border-violet/40 hover:bg-cream'}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">{optionIndex + 1}</span>
                <span>{option}</span>
              </button>
            )
          })}
        </div>
        {type === 'DEPRESSION' && index === 8 && answers[index] > 0 && (
          <div role="alert" className="mt-6 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm">
            <strong>You deserve support right now.</strong> If you may be in immediate danger, call India emergency services at <a className="font-bold underline" href="tel:112">112</a>. For mental health support, call Tele-MANAS at <a className="font-bold underline" href="tel:14416">14416</a>. This screening is not emergency care.
          </div>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        <div className="mt-8 flex justify-between gap-3">
          <Button variant="outline" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}>Back</Button>
          {index < questions.length - 1
            ? <Button disabled={answers[index] === undefined} onClick={() => setIndex((current) => current + 1)}>Continue</Button>
            : <Button disabled={answers[index] === undefined || submitting} onClick={() => void submit()}>{submitting ? 'Saving…' : 'See my care report'}</Button>}
        </div>
      </section>
      <p className="mt-5 text-center text-xs text-muted-foreground">Your progress saves on this device. Use 1–{question.options.length} to select an answer.</p>
    </div>
  )
}
