import fs from 'fs/promises'
import path from 'path'

type MailAppointment = {
  id: string
  patient?: { name?: string | null } | null
  professional?: { user?: { name?: string | null } | null; pricePerSession?: number } | null
  slot?: { startTime?: Date } | null
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

export async function generateMailPreview(appointment: MailAppointment) {
  const previewDir = process.env.MAIL_PREVIEW_DIR || '.mail-previews'
  await fs.mkdir(previewDir, { recursive: true })

  const profName = escapeHtml(appointment.professional?.user?.name || 'Your Professional')
  const patientName = escapeHtml(appointment.patient?.name || 'there')
  const slotTime = appointment.slot?.startTime ? new Date(appointment.slot.startTime) : new Date()
  const price = appointment.professional?.pricePerSession || 0
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(slotTime)
  const timeLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  }).format(slotTime)

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Confirmation — Destiny</title></head>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FFF8F0;">
  <div style="background: linear-gradient(135deg, #8B5CF6, #4F46E5, #14B8A6); padding: 32px; border-radius: 16px; color: white; margin-bottom: 32px;">
    <h1 style="margin: 0; font-size: 28px;">🌌 Destiny</h1>
    <p style="margin: 8px 0 0; opacity: 0.9;">Your session is confirmed ✨</p>
  </div>
  <h2>Hi ${patientName},</h2>
  <p>Your session has been confirmed. Here are the details:</p>
  <div style="background: white; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #E5E7EB;">
    <p><strong>Professional:</strong> ${profName} <em>(Demo profile)</em></p>
    <p><strong>Date:</strong> ${dateLabel}</p>
    <p><strong>Time:</strong> ${timeLabel} IST</p>
    <p><strong>Session fee:</strong> ₹${price} <em style="color: #6B7280;">(demo — no payment collected)</em></p>
  </div>
  <p>Join from your <a href="http://localhost:3000/dashboard" style="color: #4F46E5;">Destiny dashboard</a>.</p>
  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
  <p style="color: #6B7280; font-size: 13px;">This is a demo confirmation. No real payment was collected.<br>Destiny does not replace emergency care. In crisis? Call Tele-MANAS: <strong>14416</strong> | Emergency: <strong>112</strong></p>
</body>
</html>`

  const filename = path.join(previewDir, `${appointment.id}.html`)
  await fs.writeFile(filename, html, 'utf-8')
  console.log(`📧 Mail preview: ${filename}`)
}
