'use client'

import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { jsPDF } from 'jspdf'

type SessionReportData = {
  patientName: string
  patientAge?: number | null
  professionalName: string
  professionalType: string
  sessionTime: string | Date
  status: string
}

export function DownloadSessionReportButton({ data }: { data: SessionReportData }) {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  function handleDownload() {
    setDownloading(true)
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const formattedDate = new Date(data.sessionTime).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      const formattedTime = new Date(data.sessionTime).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' IST'

      // Header
      doc.setFillColor(34, 28, 53)
      doc.rect(0, 0, 210, 32, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(245, 243, 248)
      doc.text('Destiny.', 15, 18)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(213, 206, 236)
      doc.text('Session Summary & Care Attendance Record', 15, 26)

      doc.setFontSize(8)
      doc.setTextColor(189, 105, 153)
      doc.text('CONFIDENTIAL RECORD', 155, 18)

      // Info Card
      doc.setFillColor(245, 243, 248)
      doc.roundedRect(15, 40, 180, 52, 3, 3, 'F')
      doc.setDrawColor(211, 204, 226)
      doc.roundedRect(15, 40, 180, 52, 3, 3, 'S')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(118, 111, 140)
      doc.text('CLIENT NAME', 22, 50)
      doc.text('CLIENT AGE', 82, 50)
      doc.text('SESSION TIME & DATE', 135, 50)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(34, 28, 53)
      doc.text(data.patientName || 'Member', 22, 57)
      doc.text(data.patientAge ? `${data.patientAge} years` : 'Not specified', 82, 57)
      doc.text(`${formattedDate}, ${formattedTime}`, 135, 57)

      doc.setDrawColor(211, 204, 226)
      doc.line(22, 63, 188, 63)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(118, 111, 140)
      doc.text('PROVIDER NAME', 22, 72)
      doc.text('PROVIDER TYPE', 82, 72)
      doc.text('SAFE STATUS', 135, 72)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(34, 28, 53)
      doc.text(data.professionalName, 22, 80)
      doc.text(data.professionalType, 82, 80)

      doc.setTextColor(31, 71, 61)
      doc.text('SAFE · SESSION COMPLETED', 135, 80)

      // Care note
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(34, 28, 53)
      doc.text('Session Details & Continuity of Care', 15, 106)

      doc.setFillColor(235, 228, 242)
      doc.roundedRect(15, 112, 180, 36, 3, 3, 'F')
      doc.setDrawColor(200, 188, 224)
      doc.roundedRect(15, 112, 180, 36, 3, 3, 'S')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(72, 61, 118)
      doc.text('CONTINUING WELLBEING COMMITMENT', 20, 120)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(34, 28, 53)
      const careText = doc.splitTextToSize(
        `This record confirms that ${data.patientName} successfully attended and completed a dedicated 1-on-1 session with ${data.professionalName} (${data.professionalType}).\n\nDestiny sessions are strictly private and do not store audio or video recordings. For continuity of care, remember to practice your recommended grounding exercises and schedule follow-ups as appropriate.`,
        170
      )
      doc.text(careText, 20, 127)

      // Footer
      doc.setDrawColor(211, 204, 226)
      doc.line(15, 280, 195, 280)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7.5)
      doc.setTextColor(118, 111, 140)
      doc.text('Destiny Mental Wellbeing & Care | Verified Session Record', 15, 285)
      doc.text('For urgent support in India, call National Emergency 112 or Tele-MANAS at 14416 (24/7).', 15, 289)

      const filename = `Destiny-Session-${data.patientName.replace(/\s+/g, '-')}-${formattedDate.replace(/\s+/g, '-')}.pdf`
      doc.save(filename)
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 4000)
    } catch (err) {
      console.error('Session PDF error:', err)
      alert('Could not download session summary.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-1.5 rounded-xl border border-[#D3CCE2] bg-white px-3.5 py-2 text-xs font-semibold text-[#221C35] shadow-xs transition hover:bg-[#F5F3F8] active:scale-[0.98]"
    >
      {downloaded ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          Downloaded
        </>
      ) : downloading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#483D76] border-t-transparent" />
          Preparing...
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5 text-[#483D76]" />
          Download Session Summary
        </>
      )}
    </button>
  )
}
