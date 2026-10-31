'use client'

import { useState } from 'react'
import { Download, Check, ShieldCheck, Heart, User, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { jsPDF } from 'jspdf'

export type ReportData = {
  userName: string
  userAge?: number | null
  createdAt: string | Date
  title: string
  score: number
  maximumScore: number
  severity: string
  flagged: boolean
  recommendation: 'COUNSELLOR' | 'THERAPIST' | 'PSYCHIATRIST'
  isLowerThanModerate: boolean
  safeStatus: string
  questions?: {
    questionText: string
    answerText: string
  }[]
}

export function DownloadReportButton({ data }: { data: ReportData }) {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [customAge, setCustomAge] = useState<string>(data.userAge ? String(data.userAge) : '')
  const [showAgePrompt, setShowAgePrompt] = useState(false)

  function generateAndDownload(ageToUse: string) {
    setDownloading(true)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const displayAge = ageToUse.trim() ? `${ageToUse.trim()} years` : 'Not specified'
      const formattedDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      const formattedTime = new Date(data.createdAt).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' IST'

      // --- Header Banner ---
      doc.setFillColor(34, 28, 53) // #221C35 Deep Twilight Indigo
      doc.rect(0, 0, 210, 32, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(245, 243, 248)
      doc.text('Destiny.', 15, 18)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(213, 206, 236)
      doc.text('Official Wellbeing & Mental Health Assessment Report', 15, 26)

      doc.setFontSize(8)
      doc.setTextColor(189, 105, 153) // #BD6999
      doc.text('CONFIDENTIAL REPORT', 160, 18)

      // --- Patient & Assessment Info Card ---
      doc.setFillColor(245, 243, 248) // #F5F3F8
      doc.roundedRect(15, 38, 180, 48, 3, 3, 'F')
      doc.setDrawColor(211, 204, 226) // #D3CCE2
      doc.roundedRect(15, 38, 180, 48, 3, 3, 'S')

      // Grid Info
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(118, 111, 140) // #766F8C
      doc.text('PATIENT NAME', 22, 47)
      doc.text('PATIENT AGE', 82, 47)
      doc.text('DATE & TIME', 135, 47)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(34, 28, 53)
      doc.text(data.userName || 'Member', 22, 54)
      doc.text(displayAge, 82, 54)
      doc.text(`${formattedDate}, ${formattedTime}`, 135, 54)

      doc.setDrawColor(211, 204, 226)
      doc.line(22, 60, 188, 60)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(118, 111, 140)
      doc.text('ASSESSMENT TYPE', 22, 68)
      doc.text('SCORE ACQUIRED', 82, 68)
      doc.text('SAFE STATUS', 135, 68)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(34, 28, 53)
      doc.text(data.title, 22, 76)
      doc.text(`${data.score} / ${data.maximumScore} (${data.severity})`, 82, 76)

      // Safe Status Color & Label
      if (data.flagged) {
        doc.setTextColor(107, 51, 70) // Red/Rose crisis
      } else if (data.isLowerThanModerate) {
        doc.setTextColor(31, 71, 61) // Emerald / Safe
      } else {
        doc.setTextColor(72, 61, 118) // Royal purple
      }
      doc.text(data.safeStatus, 135, 76)

      // --- Recommendation & Clinical Guidance Section ---
      let y = 94
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(34, 28, 53)
      doc.text('Clinical Assessment & Wellbeing Recommendations', 15, y)

      y += 6
      if (data.isLowerThanModerate) {
        // Score lower than moderate box
        doc.setFillColor(216, 230, 223) // Soft botanical/safe green tint
        doc.roundedRect(15, y, 180, 44, 3, 3, 'F')
        doc.setDrawColor(187, 209, 198)
        doc.roundedRect(15, y, 180, 44, 3, 3, 'S')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.setTextColor(31, 71, 61)
        doc.text('SAFE STATUS: LOW CLINICAL RISK · THERAPY NOT REQUIRED', 20, y + 8)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(34, 28, 53)
        const lowerThanModText = doc.splitTextToSize(
          'Your screening score falls below the moderate threshold. You do not actually need clinical therapy or psychiatric treatment at this time. Your symptoms represent natural, everyday emotional fluctuations.\n\nRECOMMENDED CARE: Instead of therapy, we offer and recommend gentle counselling for smooth mental wellbeing if you are feeling lost in your life, experiencing study or work fatigue, or simply looking for an empathetic listener to bring clarity to everyday crossroads.',
          170
        )
        doc.text(lowerThanModText, 20, y + 15)
        y += 50
      } else if (data.flagged) {
        // Crisis/Flagged box
        doc.setFillColor(251, 236, 239) // Crisis light red
        doc.roundedRect(15, y, 180, 36, 3, 3, 'F')
        doc.setDrawColor(232, 200, 210)
        doc.roundedRect(15, y, 180, 36, 3, 3, 'S')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.setTextColor(107, 51, 70)
        doc.text('ATTENTION REQUIRED · IMMEDIATE PROFESSIONAL EVALUATION', 20, y + 8)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(107, 51, 70)
        const flaggedText = doc.splitTextToSize(
          'Your responses indicate elevated emotional distress. We recommend connecting promptly with an accredited therapist or psychiatrist. If you or someone you know is in distress or experiencing thoughts of harm, call National Emergency 112 or Tele-MANAS at 14416 (24/7 toll-free in India).',
          170
        )
        doc.text(flaggedText, 20, y + 16)
        y += 42
      } else {
        // Moderate / Structured therapy box
        doc.setFillColor(235, 228, 242) // Soft purple
        doc.roundedRect(15, y, 180, 36, 3, 3, 'F')
        doc.setDrawColor(200, 188, 224)
        doc.roundedRect(15, y, 180, 36, 3, 3, 'S')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        doc.setTextColor(72, 61, 118)
        doc.text('STATUS: MODERATE RISK · STRUCTURED THERAPY RECOMMENDED', 20, y + 8)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(34, 28, 53)
        const modText = doc.splitTextToSize(
          'Your responses suggest moderate symptoms affecting your day-to-day comfort. Structured cognitive therapy or mindfulness-based guidance with a licensed therapist or psychologist is recommended to help develop lasting coping tools.',
          170
        )
        doc.text(modText, 20, y + 16)
        y += 42
      }

      // --- Questions & Responses Summary ---
      if (data.questions && data.questions.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(34, 28, 53)
        doc.text('Recorded Responses Summary', 15, y)
        y += 5

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')

        // Display up to 6 key responses to fit page 1 cleanly
        const displayQuestions = data.questions.slice(0, 7)
        displayQuestions.forEach((item, index) => {
          if (y > 265) {
            doc.addPage()
            y = 20
          }
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(55, 46, 90)
          const qLine = doc.splitTextToSize(`${index + 1}. ${item.questionText}`, 175)
          doc.text(qLine, 17, y)
          y += qLine.length * 4

          doc.setFont('helvetica', 'normal')
          doc.setTextColor(85, 78, 107)
          doc.text(`Selected answer: ${item.answerText}`, 21, y)
          y += 5.5
        })
      }

      // --- Footer / Disclaimer ---
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setDrawColor(211, 204, 226)
        doc.line(15, 280, 195, 280)

        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7.5)
        doc.setTextColor(118, 111, 140)
        doc.text(
          'Destiny is an exploration and support prototype. Clinical self-assessments are for personal reflection and do not constitute medical diagnosis.',
          15,
          285
        )
        doc.text(
          'In an emergency in India, call 112 or Tele-MANAS at 14416 (24/7). | Generated at www.destinycare.app',
          15,
          289
        )
        doc.text(`Page ${i} of ${pageCount}`, 180, 289)
      }

      const safeFilename = `Destiny-Report-${data.title.replace(/\s+/g, '-')}-${formattedDate.replace(/\s+/g, '-')}.pdf`
      doc.save(safeFilename)

      setDownloaded(true)
      setShowAgePrompt(false)
      setTimeout(() => setDownloaded(false), 4000)
    } catch (err) {
      console.error('Failed to generate report PDF:', err)
      alert('Could not generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  function handleDownloadClick() {
    // If age is not set, prompt the user for their age so it's included in the report
    if (!data.userAge && !customAge) {
      setShowAgePrompt(true)
    } else {
      generateAndDownload(customAge || String(data.userAge || ''))
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownloadClick}
        disabled={downloading}
        className="inline-flex items-center gap-2 rounded-xl bg-[#483D76] px-4 py-2.5 text-sm font-semibold text-[#F5F3F8] shadow-sm transition hover:bg-[#372E5A] active:scale-[0.98] disabled:opacity-50"
      >
        {downloaded ? (
          <>
            <Check className="h-4 w-4 text-emerald-300" />
            Report Downloaded!
          </>
        ) : downloading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Report (PDF)
          </>
        )}
      </button>

      {/* Age Prompt Modal if user wants to specify/confirm age */}
      {showAgePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-[#D3CCE2] bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#221C35]">Enter Patient Age for Report</h3>
            <p className="mt-1 text-xs text-[#554E6B]">
              Your age will be included on your official Destiny care report alongside your name, date, safe status, and score.
            </p>

            <div className="mt-4">
              <label htmlFor="patient-age-input" className="block text-xs font-semibold text-[#221C35]">
                Age in years
              </label>
              <input
                id="patient-age-input"
                type="number"
                min="10"
                max="120"
                value={customAge}
                onChange={(e) => setCustomAge(e.target.value)}
                placeholder="e.g. 24"
                className="mt-1 h-11 w-full rounded-xl border border-[#D3CCE2] bg-[#F5F3F8] px-3 text-sm text-[#221C35] focus:outline-none focus:ring-2 focus:ring-[#483D76]/20"
                autoFocus
              />
            </div>

            <div className="mt-5 flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => generateAndDownload(customAge)}
                className="rounded-xl border border-[#D3CCE2] px-3.5 py-2 text-xs font-semibold text-[#554E6B] hover:bg-[#F5F3F8]"
              >
                Skip Age
              </button>
              <button
                type="button"
                onClick={() => generateAndDownload(customAge)}
                className="rounded-xl bg-[#483D76] px-4 py-2 text-xs font-semibold text-[#F5F3F8] hover:bg-[#372E5A]"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
